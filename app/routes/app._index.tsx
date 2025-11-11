import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Layout, Page } from "@shopify/polaris";
import prisma from "~/db.server";
import { checkIfAppEmbedIsActivated } from "~/services/ThemeFunctions.server";
import { apiClient, setAccessToken, setShopUrl } from "~/utils/api";
import DashboardPage from "~/components/dashboard/DashboardPage";

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
      window.open(deeplink, "_blank", "noopener,noreferrer");
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

            <div className="flex items-center flex-nowrap gap-4">
              <p className="text-lg font-medium">
                {isWidgetActive
                  ? "View Dashboard"
                  : "Please click here to activate Fishook Widget!"}
              </p>

              <button
                className="h-12 bg-primary text-white font-medium rounded-xl px-8 py-3"
                onClick={handleButtonClick}
              >
                {isWidgetActive ? "Log in" : "Activate Widget"}
              </button>
            </div>
          </div>
          {/* )} */}
        </Layout>
        <Layout>
          <DashboardPage />
        </Layout>
      </BlockStack>
    </Page>
  );
}
