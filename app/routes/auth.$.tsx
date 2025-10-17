import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  console.log("🎉 Auth completed for shop:", session?.shop);

  // Notify backend about the installation
  try {
    const response = await fetch(
      "https://sandbox-dashboard.fishook.online/oauth/shop/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_url: session?.shop,
          access_token: session?.accessToken,
          shop_type: "SHOPIFY",
        }),
      },
    );

    const data = await response.json();
    console.log("✅ Backend notified successfully:", data);
  } catch (error) {
    console.error("❌ Error notifying backend:", error);
  }

  // Redirect to Fishook dashboard after authentication
  return redirect("https://sandbox.fishook.online/");
};
