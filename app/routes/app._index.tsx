import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Layout, Page } from "@shopify/polaris";

const dashboardUrl = "https://sandbox-dashboard.fishook.online/?source=shopify";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (!session?.shop || !session?.accessToken) {
    throw new Error("Missing session data");
  }

  const payload = {
    shop_url: session.shop,
    access_token: session.accessToken,
    shop_type: "SHOPIFY",
  };

  const response = await fetch(
    `https://sandbox.fishook.online/oauth/shop/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const jsonData = await response.json();

  return { session, jsonData };
};

export const action = async ({ request }: ActionFunctionArgs) => {};

export default function Home() {
  // const shopify = useAppBridge();
  const { session, jsonData } = useLoaderData<{
    session: string;
    jsonData: any;
  }>();

  console.log(session, "session");
  console.log(jsonData, "json data");

  // useEffect(() => {
  //   shopify.toast.show("Product created");
  // }, [shopify]);

  const goToLogin = () => {
    window.open(dashboardUrl, "_blank", "noopener,noreferrer");
  };

  // const widgetInstall = async () => {
  //   try {
  //     const body = {
  //       shop_id: "89d0c014-ab1a-4a14-ad4a-5cfb0417158b",
  //       merchant_id: "6e5f9023-e711-4a79-bf8b-0d22cd79dc88",
  //       widget_name: "demo_name",
  //     };

  //     const response = await fetch(
  //       `${process.env.VITE_API_BASE_URL}/shopify/widgets`,
  //       {
  //         method: "POST",
  //         body: JSON.stringify(body),
  //       },
  //     );

  //     const json = await response.json();
  //     console.log(json);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  return (
    <Page>
      <TitleBar title="Login with your Fishook account">
        <a
          variant="primary"
          href={dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to Fishook Dashboard
        </a>
      </TitleBar>

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
