import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Layout, Page } from "@shopify/polaris";
import prisma from "~/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const dbRecord = await prisma.session.findFirst({
    where: {
      shop: shop,
    },
  });

  if (!dbRecord?.shop || !dbRecord?.accessToken) {
    throw new Error("Missing session data");
  }

  const payload = {
    shop_url: dbRecord.shop,
    access_token: dbRecord.accessToken,
  };

  const response = await fetch(
    `https://dashboard-api.fishook.online/shopify/update/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const jsonData = await response.json();

  return {
    session,
    jsonData,
    shop: shop,
    accessToken: dbRecord.accessToken,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {};

export default function Home() {
  const { jsonData } = useLoaderData<{
    session: string;
    jsonData: any;
    accessToken: string;
    shop: string;
  }>();

  var dashboardUrl = "https://dashboard.fishook.online/merchant/auth/login";
  if (
    jsonData.hasOwnProperty("data") &&
    jsonData.data.hasOwnProperty("jwt_token")
  ) {
    dashboardUrl = `${dashboardUrl}?jwt_token=${jsonData.data.jwt_token}`;
  }

  const goToLogin = () => {
    window.open(dashboardUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <div className="fishook-auth-banner w-full min-h-60 rounded-2xl grid place-content-center pt-13 pb-8 mt-8">
            <div className="grid justify-center mb-5">
              <img
                src="/assets/images/fishook-logo.png"
                className="h-20"
                alt="fishook-logo"
                loading="lazy"
              />
            </div>

            <div className="flex items-center flex-nowrap gap-4">
              <p className="text-lg font-medium">
                Please login here to activate Fishook Widget!
              </p>

              <button
                className="h-12 bg-primary text-white font-medium rounded-xl px-8 py-3"
                onClick={goToLogin}
              >
                Log in
              </button>
            </div>
          </div>
          {/* )} */}
        </Layout>
      </BlockStack>
    </Page>
  );
}
