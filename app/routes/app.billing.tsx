import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import BillingPage from "../components/billing/BillingPage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Console log the access token
  console.log("Access Token:", session.accessToken);
  console.log("Shop Domain:", session.shop);

  return json({ shop: session.shop });
};

export default function Index() {
  return <BillingPage />;
}
