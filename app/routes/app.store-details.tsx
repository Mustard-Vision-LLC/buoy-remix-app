import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import StoreDetailsPage from "~/components/store-details/StoreDetailsPage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  return json({
    shop: session.shop,
  });
};

export default function StoreDetails() {
  return <StoreDetailsPage />;
}
