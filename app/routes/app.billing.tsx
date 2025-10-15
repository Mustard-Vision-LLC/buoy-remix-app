import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import BillingPage from "../components/billing/BillingPage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session: shopifySession } = await authenticate.admin(request);

  if (!shopifySession?.shop || !shopifySession?.accessToken) {
    throw new Error("Missing Shopify session data");
  }

  // Return shop and access token for client-side API calls
  return json({
    shop: shopifySession.shop,
    accessToken: shopifySession.accessToken,
  });
};

export default function Index() {
  return <BillingPage />;
}
