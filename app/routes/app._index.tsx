import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Layout, Page } from "@shopify/polaris";
import prisma from "~/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const dbRecord = await prisma.session.findFirst({
    where: {
      shop: shop
    },
  });

  const allDbRecords = await prisma.session.findMany({
    where: {
      shop: shop
    }
  });

  if (!dbRecord?.shop || !dbRecord?.accessToken) {
    throw new Error("Missing session data");
  }

  const payload = {
    shop_url: dbRecord.shop,
    access_token: dbRecord.accessToken
  };

  const response = await fetch(`https://dashboard-api.fishook.online/shopify/update/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const jsonData = await response.json();

  console.log('loader json data', jsonData);

  return {
    session,
    jsonData,
    shop: shop,
    accessToken: dbRecord.accessToken,
    allDbRecords: allDbRecords
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {};

export default function Home() {
  // const shopify = useAppBridge();
  const {jsonData, allDbRecords} = useLoaderData<{
    session: string;
    jsonData: any;
    accessToken: string;
    shop: string;
    allDbRecords: any;
  }>();

  console.log('response data', JSON.stringify(jsonData));
  console.log('all db records', JSON.stringify(allDbRecords));

  // Test API calls

  // useEffect(() => {
  //   shopify.toast.show("Product created");
  // }, [shopify]);

  var dashboardUrl = "https://dashboard.fishook.online/merchant/auth/login";
  if(jsonData.hasOwnProperty('data') && jsonData.data.hasOwnProperty('jwt_token')) {
    dashboardUrl = `${dashboardUrl}?jwt_token=${jsonData.data.jwt_token}`;
  }

  const goToLogin = () => {
    window.open(dashboardUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          {/* {jsonData?.data ? (
            <div>
              <p>You are logged in now!</p>

              <button onClick={widgetInstall}>Install Widget</button>
            </div>
          ) : ( */}
          <div className="fishook-auth-banner w-full min-h-60 rounded-2xl grid place-content-center pt-13 pb-8 mt-8">
            <div className="grid justify-center mb-5">
              <img
                src="/assets/images/fishook-logo.png"
                className="h-20"
                alt="fishook-logo"
                loading="lazy"
              />
            </div>

            <div className="flex justify-center items-center flex-nowrap gap-4">
              <button
                className="h-12 bg-primary text-white font-medium rounded-xl px-8 py-3"
                onClick={goToLogin}
              >
                View Dashboard
              </button>
            </div>
          </div>
          {/* )} */}
        </Layout>
      </BlockStack>
    </Page>
  );
}
