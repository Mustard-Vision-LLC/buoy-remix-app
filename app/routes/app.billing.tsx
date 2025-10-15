import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { fishookApi } from "../utils/fishook.server";
import BillingPage from "../components/billing/BillingPage";

/**
 * Loader: Fetch billing data and plans on page load
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session: shopifySession } = await authenticate.admin(request);

    if (!shopifySession?.shop || !shopifySession?.accessToken) {
      return json({
        error: "Missing Shopify session data",
        shop: null,
        billingData: null,
        plans: null,
      });
    }

    // Fetch billing data and plans in parallel on server-side
    const [billingResponse, plansResponse] = await Promise.all([
      fishookApi.getBillingData(shopifySession.accessToken),
      fishookApi.getPlans(shopifySession.accessToken),
    ]);

    return json({
      shop: shopifySession.shop,
      billingData: billingResponse.data,
      plans: plansResponse.data,
      error: null,
    });
  } catch (error) {
    console.error("❌ [Loader] Error fetching billing data:", error);
    return json({
      error:
        error instanceof Error ? error.message : "Failed to load billing data",
      shop: null,
      billingData: null,
      plans: null,
    });
  }
};

/**
 * Action: Handle mutations (top-up, plan changes)
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { session: shopifySession } = await authenticate.admin(request);

    if (!shopifySession?.shop || !shopifySession?.accessToken) {
      return json(
        { success: false, error: "Missing Shopify session data" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const actionType = formData.get("actionType") as string;

    switch (actionType) {
      case "topUp": {
        const amount = parseFloat(formData.get("amount") as string);

        if (amount < 50) {
          return json(
            { success: false, error: "Minimum top-up amount is $50" },
            { status: 400 },
          );
        }

        const response = await fishookApi.topUpWallet(
          shopifySession.accessToken,
          amount,
        );

        return json({
          success: true,
          message: response.message || `Successfully topped up $${amount}!`,
        });
      }

      case "changePlan": {
        const planId = formData.get("planId") as string;
        const planName = formData.get("planName") as string;

        const response = await fishookApi.upgradePlan(
          shopifySession.accessToken,
          planId,
        );

        return json({
          success: true,
          message:
            response.message || `Successfully upgraded to ${planName} plan!`,
        });
      }

      default:
        return json(
          { success: false, error: "Invalid action type" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("❌ [Action] Error:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Operation failed",
      },
      { status: 500 },
    );
  }
};

export default function Index() {
  return <BillingPage />;
}
