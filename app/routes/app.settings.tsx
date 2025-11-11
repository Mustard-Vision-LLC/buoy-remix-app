import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import SettingsPage from "../components/settings/SettingsPage";
import prisma from "~/db.server";
import { apiClient, setAccessToken, setShopUrl } from "~/utils/api";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const dbRecord = await prisma.session.findFirst({
    where: { shop: shop },
  });

  if (!dbRecord?.shop || !dbRecord?.accessToken) {
    throw new Error("Missing session data");
  }

  // Set tokens for API client
  setAccessToken(dbRecord.accessToken);
  setShopUrl(dbRecord.shop);

  // Fetch profile data
  const profileData = await apiClient.getProfile();

  return json({
    shop: shop,
    accessToken: dbRecord.accessToken,
    profile: profileData.data,
  });
};

export default function Settings() {
  return <SettingsPage />;
}
