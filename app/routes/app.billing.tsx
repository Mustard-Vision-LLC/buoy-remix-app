import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import BillingPage from "../components/billing/BillingPage";
import { useLoaderData } from "@remix-run/react";
import React from "react";

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
      return json({
        shop: session.shop,
        jwtTokens: {
          jwt_token: loginData.data.jwtDetails.jwt_token,
          refresh_jwt_token: loginData.data.jwtDetails.refresh_jwt_token,
        },
        shopData: loginData.data.shop,
      });
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

export default function Index() {
  const { jwtTokens } = useLoaderData<{
    shop: string;
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

  const [tokensReady, setTokensReady] = React.useState(false);

  // Store JWT tokens in localStorage on component mount
  React.useEffect(() => {
    console.log("🔐 Initializing JWT tokens for billing page...");
    if (jwtTokens?.jwt_token && jwtTokens?.refresh_jwt_token) {
      localStorage.setItem("jwt_token", jwtTokens.jwt_token);
      localStorage.setItem("refresh_jwt_token", jwtTokens.refresh_jwt_token);
      console.log("✅ JWT tokens stored successfully");
      console.log(
        "🔑 JWT Token (first 30 chars):",
        jwtTokens.jwt_token.substring(0, 30) + "...",
      );

      // Signal that tokens are ready
      setTokensReady(true);
    } else {
      console.error("❌ No JWT tokens received from loader");
    }
  }, [jwtTokens]);

  // Only render BillingPage after tokens are stored
  if (!tokensReady) {
    console.log("⏳ Waiting for tokens to be stored...");
    return <div>Loading...</div>;
  }

  return <BillingPage />;
}
