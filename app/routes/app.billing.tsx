import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import BillingPage from "../components/billing/BillingPage";

const API_BASE_URL = "https://dashboard-api.fishook.online";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (!session?.shop || !session?.accessToken) {
    throw new Error("Missing session data");
  }

  console.log("🏪 Shop:", session.shop);

  try {
    // Step 1: Login to get JWT tokens
    console.log("📤 Logging in to Fishook API...");
    const loginResponse = await fetch(`${API_BASE_URL}/shopify/admin/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_url: session.shop,
        access_token: session.accessToken,
        shop_type: "SHOPIFY",
      }),
    });

    const loginData = await loginResponse.json();
    console.log(
      "📥 Login status:",
      loginResponse.status,
      loginData.status_code,
    );

    if (loginData.status_code !== 200 || !loginData.data?.jwtDetails) {
      console.error("❌ Login failed:", loginData);
      throw new Error(`Login failed: ${loginData.message || "Unknown error"}`);
    }

    const jwtToken = loginData.data.jwtDetails.jwt_token;
    console.log("✅ JWT token obtained");

    // Step 2: Fetch billing data using the JWT token
    console.log("📤 Fetching billing data...");
    const billingResponse = await fetch(
      `${API_BASE_URL}/shopify/admin/billings/interactions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      },
    );

    const billingData = await billingResponse.json();
    console.log(
      "📥 Billing status:",
      billingResponse.status,
      billingData.status_code,
    );

    if (billingData.status_code !== 200) {
      console.error("❌ Billing fetch failed:", billingData);
      throw new Error(`Failed to fetch billing data: ${billingData.message}`);
    }

    console.log("✅ Billing data fetched successfully");

    // Step 3: Transform and return data to client
    return json({
      shop: session.shop,
      jwtToken,
      refreshToken: loginData.data.jwtDetails.refresh_jwt_token,
      billingData: {
        balance: billingData.data.balance,
        currentPlan: {
          name: billingData.data.current_plan.name,
          costPerToken: billingData.data.current_plan.cost_per_token,
        },
        interactions: {
          total: billingData.data.total_store_interactions,
          limit: 300,
          cost: billingData.data.total_store_interaction_cost,
          tokenBalance: billingData.data.total_store_interaction_token_balance,
        },
        connectedStores: {
          active: billingData.data.connected_stores.active,
          inactive: billingData.data.connected_stores.inactive,
          total: billingData.data.connected_stores.total_stores,
        },
        customers: billingData.data.customers,
        extraBundle: billingData.data.extra_bundle,
        extraBundleCost: billingData.data.extra_bundle_cost,
      },
    });
  } catch (error) {
    console.error("❌ Error in billing loader:", error);
    // Return error state instead of throwing
    return json({
      shop: session.shop,
      error:
        error instanceof Error ? error.message : "Failed to load billing data",
      billingData: null,
      jwtToken: null,
      refreshToken: null,
    });
  }
};

export default function Index() {
  return <BillingPage />;
}
