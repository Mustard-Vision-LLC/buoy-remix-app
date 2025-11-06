import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import DashboardPage from "../components/dashboard/DashboardPage";
import { apiClient, setAccessToken, setShopUrl } from "../utils/api";
import prisma from "~/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session: shopifySession } = await authenticate.admin(request);

  if (!shopifySession?.shop || !shopifySession?.accessToken) {
    throw new Error("Missing Shopify session data");
  }

  // Get the access token from the database
  const dbRecord = await prisma.session.findFirst({
    where: {
      shop: shopifySession.shop,
    },
  });

  if (!dbRecord?.shop || !dbRecord?.accessToken) {
    throw new Error("Missing session data");
  }

  // Set the access token and shop URL for API calls
  setAccessToken(dbRecord.accessToken);
  setShopUrl(dbRecord.shop);

  try {
    // Fetch dashboard analytics and chart data
    const [
      analyticsResponse,
      storePerformanceResponse,
      conversionsResponse,
      marketPerformanceResponse,
    ] = await Promise.all([
      apiClient.getDashboardAnalytics(),
      apiClient.getDashboardStorePerformance({ period: "year" }),
      apiClient.getDashboardConversions({ period: "year" }),
      apiClient.getDashboardMarketPerformance({ period: "year" }),
    ]);

    return json({
      shop: shopifySession.shop,
      analytics: analyticsResponse.data?.analytics || null,
      storePerformance: storePerformanceResponse || null,
      conversions: conversionsResponse || null,
      marketPerformance: marketPerformanceResponse || null,
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    // Return with null analytics if the API call fails
    return json({
      shop: shopifySession.shop,
      analytics: null,
      storePerformance: null,
      conversions: null,
      marketPerformance: null,
    });
  }
};

export default function Index() {
  return <DashboardPage />;
}
