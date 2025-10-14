import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Layout, Page } from "@shopify/polaris";
import React from "react";

const dashboardUrl = "https://sandbox-dashboard.fishook.online/?source=shopify";
const API_BASE_URL = "https://dashboard-api.fishook.online";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (!session?.shop || !session?.accessToken) {
    throw new Error("Missing session data");
  }

  console.log("🏪 Shop:", session.shop);

  // Login to Fishook API to get JWT tokens
  try {
    const payload = {
      shop_url: session.shop,
      access_token: session.accessToken,
      shop_type: "SHOPIFY",
    };

    console.log("📤 Sending login request to Fishook API...");

    const response = await fetch(`${API_BASE_URL}/shopify/admin/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const loginData = await response.json();

    console.log("📥 Login response status:", response.status);
    console.log("📦 Login response data:", JSON.stringify(loginData, null, 2));

    if (loginData.status_code === 200 && loginData.data?.jwtDetails) {
      console.log("✅ Login successful, returning JWT tokens");
      // Return JWT tokens to be stored on the client side
      return {
        session: {
          shop: session.shop,
        },
        jwtTokens: {
          jwt_token: loginData.data.jwtDetails.jwt_token,
          refresh_jwt_token: loginData.data.jwtDetails.refresh_jwt_token,
        },
        shopData: loginData.data.shop,
      };
    }

    console.error("❌ Login failed:", loginData);
    throw new Error(
      `Failed to authenticate with Fishook API: ${loginData.message || "Unknown error"}`,
    );
  } catch (error) {
    console.error("❌ Fishook API login error:", error);
    throw new Error("Failed to initialize Fishook session");
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {};

export default function Home() {
  const { session, jwtTokens, shopData } = useLoaderData<{
    session: { shop: string };
    jwtTokens: {
      jwt_token: string;
      refresh_jwt_token: string;
    };
    shopData: {
      shop_url: string;
      script_tag_id: string;
      platform: string;
    };
  }>();

  // Store JWT tokens in localStorage on component mount
  React.useEffect(() => {
    console.log("🔐 Checking JWT tokens...");
    if (jwtTokens?.jwt_token && jwtTokens?.refresh_jwt_token) {
      localStorage.setItem("jwt_token", jwtTokens.jwt_token);
      localStorage.setItem("refresh_jwt_token", jwtTokens.refresh_jwt_token);
      console.log("✅ JWT tokens stored successfully");
      console.log(
        "🔑 JWT Token (first 30 chars):",
        jwtTokens.jwt_token.substring(0, 30) + "...",
      );
      console.log(
        "🔄 Refresh Token (first 30 chars):",
        jwtTokens.refresh_jwt_token.substring(0, 30) + "...",
      );
    } else {
      console.error("❌ No JWT tokens received from loader");
    }
  }, [jwtTokens]);

  console.log("🏪 Session shop:", session.shop);
  console.log("📦 Shop data:", shopData);

  // useEffect(() => {
  //   shopify.toast.show("Product created");
  // }, [shopify]);

  const goToLogin = () => {
    window.open(dashboardUrl, "_blank", "noopener,noreferrer");
  };

  // const widgetInstall = async () => {
  //   try {
  //     const body = {
  //       shop_id: "89d0c014-ab1a-4a14-ad4a-5cfb0417158b",
  //       merchant_id: "6e5f9023-e711-4a79-bf8b-0d22cd79dc88",
  //       widget_name: "demo_name",
  //     };

  //     const response = await fetch(
  //       `${process.env.VITE_API_BASE_URL}/shopify/widgets`,
  //       {
  //         method: "POST",
  //         body: JSON.stringify(body),
  //       },
  //     );

  //     const json = await response.json();
  //     console.log(json);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  return (
    <Page>
      <TitleBar title="Login with your Fishook account">
        <a
          variant="primary"
          href={dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to Fishook Dashboard
        </a>
      </TitleBar>

      <BlockStack gap="500">
        <Layout>
          {/* {jsonData?.data ? (
            <div>
              <p>You are logged in now!</p>

              <button onClick={widgetInstall}>Install Widget</button>
            </div>
          ) : ( */}
          <div className="fishook-auth-banner w-full min-h-60 rounded-2xl grid place-content-center pt-13 pb-8 mt-8">
            <div className="grid justify-center mb-5">
              <img
                src="/assets/images/fishook-logo.png"
                className="h-20"
                alt="fishook-logo"
                loading="lazy"
              />
            </div>

            <div className="flex justify-center items-center flex-nowrap gap-4">
              <button
                className="h-12 bg-primary text-white font-medium rounded-xl px-8 py-3"
                onClick={goToLogin}
              >
                View Dashboard
              </button>
            </div>
          </div>
          {/* )} */}
        </Layout>
      </BlockStack>
    </Page>
  );
}
