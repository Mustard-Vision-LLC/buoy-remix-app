import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Layout, Page } from "@shopify/polaris";
import prisma from "~/db.server";
import { checkIfAppEmbedIsActivated } from "~/services/ThemeFunctions.server";
import { apiClient, setAccessToken, setShopUrl } from "~/utils/api";
import DashboardPage from "~/components/dashboard/DashboardPage";
import WidgetActivationModal from "~/components/WidgetActivationModal";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const { shop } = session;

  const dbRecord = await prisma.session.findFirst({
    where: {
      shop: shop,
    },
  });

  if (!dbRecord?.shop || !dbRecord?.accessToken) {
    throw new Error("Missing session data");
  }

  const checkActiveEmbed = await checkIfAppEmbedIsActivated(admin, dbRecord);
  console.log("check active emmbed here", checkActiveEmbed);

  const payload = {
    shop_url: dbRecord.shop,
    access_token: dbRecord.accessToken,
  };

  setAccessToken(dbRecord.accessToken);
  setShopUrl(dbRecord.shop);

  const response = await fetch(
    `https://dashboard-api.fishook.online/shopify/update/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const jsonData = await response.json();

  try {
    // Fetch dashboard analytics and chart data
    const [
      analyticsResponse,
      storePerformanceResponse,
      conversionsResponse,
      marketPerformanceResponse,
    ] = await Promise.all([
      apiClient.getDashboardAnalytics(),
      apiClient.getDashboardStorePerformance({ period: "year" }),
      apiClient.getDashboardConversions({ period: "year" }),
      apiClient.getDashboardMarketPerformance({ period: "year" }),
    ]);

    return {
      shop: session.shop,
      jsonData: jsonData,
      analytics: analyticsResponse.data?.analytics || null,
      storePerformance: storePerformanceResponse || null,
      conversions: conversionsResponse || null,
      marketPerformance: marketPerformanceResponse || null,
      checkActiveEmbed: checkActiveEmbed,
    };
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    // Return with null analytics if the API call fails
    return {
      session,
      jsonData,
      shop: shop,
      accessToken: dbRecord.accessToken,
      analytics: null,
      storePerformance: null,
      conversions: null,
      marketPerformance: null,
      checkActiveEmbed: checkActiveEmbed,
    };
  }

  // return {
  //   session,
  //   jsonData,
  //   shop: shop,
  //   accessToken: dbRecord.accessToken,
  // };
};

export const action = async ({ request }: ActionFunctionArgs) => {};

export default function Home() {
  const { jsonData, checkActiveEmbed } = useLoaderData<{
    session: string;
    jsonData: any;
    accessToken: string;
    shop: string;
    checkActiveEmbed: any;
  }>();

  const [showActivationModal, setShowActivationModal] = useState(false);

  console.log("checkActiveEmbed", checkActiveEmbed);
  console.log("jsonData", JSON.stringify(jsonData));

  const isWidgetActive = checkActiveEmbed?.activeStatus === true;
  const deeplink = checkActiveEmbed?.deeplink || "";

  var dashboardUrl = "https://dashboard.fishook.online/merchant/auth/login";
  try {
    if (
      jsonData.hasOwnProperty("data") &&
      jsonData.data.hasOwnProperty("jwt_token")
    ) {
      dashboardUrl = `${dashboardUrl}?jwt_token=${jsonData.data.jwt_token}`;
    }
  } catch (error) {}

  const handleButtonClick = () => {
    if (isWidgetActive) {
      window.open(dashboardUrl, "_blank", "noopener,noreferrer");
    } else {
      setShowActivationModal(true);
    }
  };

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <div className="fishook-auth-banner w-full min-h-60 rounded-2xl grid place-content-center pt-13 pb-8 mt-8">
            <div className="grid justify-center mb-5">
              <img
                src="/assets/images/fishook-logo.png"
                className="h-20"
                alt="fishook-logo"
                loading="lazy"
              />
            </div>
          </div>

          <div
            style={{
              width: "100%",
              backgroundColor: isWidgetActive ? "#F0FDF4" : "#FEF2F2",
              border: `1px solid ${isWidgetActive ? "#00A63E" : "#FB2C36"}`,
              borderRadius: "8px",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              marginTop: "20px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src={
                  isWidgetActive
                    ? "/assets/icons/green-checkmark.svg"
                    : "/assets/icons/x-icon.svg"
                }
                alt="icon"
                className="size-3"
              />

              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#2C2C2C",
                }}
              >
                {isWidgetActive
                  ? "Widget activated"
                  : "Widget successfully installed but not activated yet."}
              </span>
            </div>

            <button
              style={{
                padding: "8px 20px",
                backgroundColor: "#ff5b00",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background-color 0.2s",
              }}
              onClick={handleButtonClick}
            >
              {isWidgetActive ? "Go to Dashboard" : "Activate Widget"}
            </button>
          </div>
        </Layout>
        <Layout>
          <DashboardPage />
        </Layout>
      </BlockStack>

      <WidgetActivationModal
        open={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        deeplink={deeplink}
      />
    </Page>
  );
}
