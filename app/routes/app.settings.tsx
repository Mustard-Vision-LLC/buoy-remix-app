import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
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

export const action = async ({ request }: ActionFunctionArgs) => {
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

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateProfile") {
    try {
      const result = await apiClient.updateProfile(formData);
      return json({ success: true, data: result });
    } catch (error: any) {
      return json({ success: false, error: error.message }, { status: 400 });
    }
  }

  if (intent === "changePassword") {
    const old_password = formData.get("old_password") as string;
    const new_password = formData.get("new_password") as string;

    try {
      const result = await apiClient.changePassword({
        old_password,
        new_password,
      });
      return json({ success: true, data: result });
    } catch (error: any) {
      return json({ success: false, error: error.message }, { status: 400 });
    }
  }

  return json({ success: false, error: "Invalid intent" }, { status: 400 });
};

export default function Settings() {
  return <SettingsPage />;
}
