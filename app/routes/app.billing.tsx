import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import BillingPage from "../components/billing/BillingPage";
import {
  loginToFishook,
  getBillingData,
  jwtSessionStorage,
  topUpWallet,
} from "../session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session: shopifySession } = await authenticate.admin(request);

  if (!shopifySession?.shop || !shopifySession?.accessToken) {
    throw new Error("Missing Shopify session data");
  }

  try {
    const formData = await request.json();
    const { amount } = formData;

    if (!amount || isNaN(Number(amount))) {
      return json({ error: "Invalid amount" }, { status: 400 });
    }

    // Top up wallet
    const { session } = await topUpWallet(request, Number(amount));

    return json(
      { success: true },
      {
        headers: {
          "Set-Cookie": await jwtSessionStorage.commitSession(session),
        },
      },
    );
  } catch (error) {
    console.error("❌ Error in top-up action:", error);
    return json(
      { error: error instanceof Error ? error.message : "Top-up failed" },
      { status: 500 },
    );
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session: shopifySession } = await authenticate.admin(request);

  if (!shopifySession?.shop || !shopifySession?.accessToken) {
    throw new Error("Missing Shopify session data");
  }

  try {
    // Step 1: Login to Fishook and store JWT tokens in cookie
    const { session: cookieSession } = await loginToFishook(
      request,
      shopifySession.shop,
      shopifySession.accessToken,
    );

    // Step 2: Fetch billing data using the JWT token from cookie
    const { data: billingData, session: updatedSession } =
      await getBillingData(request);

    // Use updated session if token was refreshed, otherwise use original
    const finalSession = updatedSession || cookieSession;

    // Step 3: Transform and return data
    return json(
      {
        shop: shopifySession.shop,
        billingData: {
          balance: billingData.balance,
          currentPlan: {
            name: billingData.current_plan.name,
            costPerToken: billingData.current_plan.cost_per_token,
          },
          interactions: {
            total: billingData.total_store_interactions,
            limit: 300,
            cost: billingData.total_store_interaction_cost,
            tokenBalance: billingData.total_store_interaction_token_balance,
          },
          connectedStores: {
            active: billingData.connected_stores.active,
            inactive: billingData.connected_stores.inactive,
            total: billingData.connected_stores.total_stores,
          },
          customers: billingData.customers,
          extraBundle: billingData.extra_bundle,
          extraBundleCost: billingData.extra_bundle_cost,
        },
      },
      {
        headers: {
          "Set-Cookie": await jwtSessionStorage.commitSession(finalSession),
        },
      },
    );
  } catch (error) {
    console.error("❌ Error in billing loader:", error);

    // Return error state
    return json({
      shop: shopifySession.shop,
      error:
        error instanceof Error ? error.message : "Failed to load billing data",
      billingData: null,
    });
  }
};

export default function Index() {
  return <BillingPage />;
}
