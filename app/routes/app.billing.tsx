import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import BillingPage from "../components/billing/BillingPage";
import { jwtSessionStorage, setTokens } from "../session.server";

// API Base URL
const API_BASE_URL = "https://dashboard-api.fishook.online";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session: shopifySession } = await authenticate.admin(request);

  if (!shopifySession?.shop || !shopifySession?.accessToken) {
    throw new Error("Missing Shopify session data");
  }

  try {
    // Login to Fishook and get JWT tokens
    const formattedShopUrl = shopifySession.shop.replace(/^https?:\/\//, "");

    const response = await fetch(`${API_BASE_URL}/shopify/admin/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_url: formattedShopUrl,
        access_token: shopifySession.accessToken,
        shop_type: "SHOPIFY",
      }),
    });

    const data = await response.json();

    if (data.status_code !== 200 || !data.data?.jwtDetails) {
      console.error("❌ Fishook login failed:", data);
      throw new Error(data.message || "Failed to login to Fishook");
    }

    // Store tokens in cookie
    const cookieSession = await setTokens(
      request,
      data.data.jwtDetails.jwt_token,
      data.data.jwtDetails.refresh_jwt_token,
    );

    // Return shop info, JWT token for client-side API calls, and set cookie
    return json(
      {
        shop: shopifySession.shop,
        jwtToken: data.data.jwtDetails.jwt_token,
        refreshToken: data.data.jwtDetails.refresh_jwt_token,
      },
      {
        headers: {
          "Set-Cookie": await jwtSessionStorage.commitSession(cookieSession),
        },
      },
    );
  } catch (error) {
    console.error("❌ Error in billing loader:", error);

    // Return error state
    return json({
      shop: shopifySession.shop,
      error: error instanceof Error ? error.message : "Failed to authenticate",
    });
  }
};

export default function Index() {
  return <BillingPage />;
}
