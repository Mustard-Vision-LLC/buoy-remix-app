import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import DashboardPage from "../components/dashboard/DashboardPage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session: shopifySession } = await authenticate.admin(request);

  if (!shopifySession?.shop || !shopifySession?.accessToken) {
    throw new Error("Missing Shopify session data");
  }

  // Return shop for dashboard
  return json({
    shop: shopifySession.shop,
  });
};

export default function Index() {
  return <DashboardPage />;
}
