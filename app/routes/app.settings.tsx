import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import SettingsPage from "../components/settings/SettingsPage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({
    message: "Settings page loaded",
  });
};

export default function Settings() {
  return <SettingsPage />;
}
