import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import BillingPage from "../components/billing/BillingPage";
import prisma from "~/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session: shopifySession } = await authenticate.admin(request);
  const { shop } = shopifySession;

  const dbRecord = await prisma.session.findFirst({
    where: { shop: shop }
  })

  if (!dbRecord?.shop || !dbRecord?.accessToken) {
    throw new Error("Missing Shopify session data");
  }

  // Return shop and access token for client-side API calls
  return json({
    shop: dbRecord.shop,
    accessToken: dbRecord.accessToken,
  });
};

export default function Index() {
  return <BillingPage />;
}
