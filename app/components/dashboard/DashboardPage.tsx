import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Frame,
} from "@shopify/polaris";
import ClientOnly from "./ClientOnly";
import ProductsTable from "./ProductsTable";
import { setAccessToken, setShopUrl } from "~/utils/api";

// Lazy load chart components to avoid SSR issues with ApexCharts
import { lazy, Suspense, useEffect } from "react";

const StorePerformanceChart = lazy(() => import("./StorePerformanceChart"));
const TotalConversionsChart = lazy(() => import("./TotalConversionsChart"));
const InterventionsChart = lazy(() => import("./InterventionsChart"));
const MarketPerformanceChart = lazy(() => import("./MarketPerformanceChart"));

const ChartSkeleton = () => (
  <Card>
    <div
      style={{
        height: "350px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text variant="bodyMd" as="p" tone="subdued">
        Loading chart...
      </Text>
    </div>
  </Card>
);

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text variant="bodySm" as="p" tone="subdued">
          {title}
        </Text>
        <Text variant="heading2xl" as="h3">
          {value}
        </Text>
      </BlockStack>
    </Card>
  );
}

export default function DashboardPage() {
  const loaderData = useLoaderData<{
    shop: string;
    accessToken: string;
    analytics: {
      engagements: number;
      total_conversion: number;
      average_time_spent: number;
      total_successful_sales: number;
      total_generated_revenue: string;
      abandoned_cart: number;
      total_assisted_shopping: number;
      total_coupon_intervention: number;
      current_coupon_budget: string;
      available_coupon_budget: string;
      tables?: {
        top_viewed_products: Array<{
          product: { title: string };
          view_count: number;
        }>;
        top_purchased_products: Array<{
          serialNumber: number;
          productName: string;
          revenue: string;
          quantitySold: number;
        }>;
      };
    } | null;
    storePerformance: {
      status_code: number;
      message: string;
      conversions: {
        datasets: Array<{ data: number[]; label: string }>;
        labels: string[];
      };
      engagements: {
        datasets: Array<{ data: number[]; label: string }>;
        labels: string[];
      };
    } | null;
    conversions: {
      status_code: number;
      message: string;
      data: {
        datasets: Array<{ data: number[]; label: string }>;
        labels: string[];
      };
    } | null;
    marketPerformance: {
      status_code: number;
      message: string;
      data: {
        conversions: {
          datasets: Array<{ data: number[]; label: string }>;
          labels: string[];
        };
        engagements: {
          datasets: Array<{ data: number[]; label: string }>;
          labels: string[];
        };
      };
    } | null;
  }>();

  const analytics = loaderData.analytics;

  // Set access token and shop URL for client-side API calls (e.g., charts with filters)
  useEffect(() => {
    if (loaderData.accessToken && loaderData.shop) {
      setAccessToken(loaderData.accessToken);
      setShopUrl(loaderData.shop);
    }
  }, [loaderData.accessToken, loaderData.shop]);

  // Statistics using real analytics data
  const statistics = [
    {
      title: "Total Engagement",
      value: analytics?.engagements || 0,
    },
    {
      title: "Total Conversion",
      value: analytics?.total_conversion ?? 0,
    },
    {
      title: "Avg Time Spent on Chat",
      value: analytics?.average_time_spent
        ? `${Math.round(analytics.average_time_spent)} min`
        : "0 min",
    },
    {
      title: "Total Successful Sales",
      value: analytics?.total_successful_sales || 0,
    },
    {
      title: "Total Generated Revenue",
      value: `$${analytics?.total_generated_revenue || 0}`,
    },
    {
      title: "Total Abandoned Carts",
      value: analytics?.abandoned_cart || 0,
    },
    {
      title: "Total Assisted Shopping",
      value: analytics?.total_assisted_shopping || 0,
    },
    {
      title: "Total Coupon Intervention",
      value: analytics?.total_coupon_intervention || 0,
    },
    {
      title: "Current Coupon Budget",
      value: `$${analytics?.current_coupon_budget || 0}`,
    },
    {
      title: "Available Coupon Budget",
      value: `$${analytics?.available_coupon_budget || 0}`,
    },
  ];

  // Extract product data from analytics
  const topViewedProducts = (
    analytics?.tables?.top_viewed_products || []
  ).slice(0, 5);
  const topPurchasedProducts = (
    analytics?.tables?.top_purchased_products || []
  ).slice(0, 5);

  return (
    <Frame>
      <Page title="Dashboard">
        <BlockStack gap="500">
          {/* Store Info */}
          <Card>
            <InlineStack align="space-between">
              <BlockStack gap="200">
                <Text variant="headingMd" as="h2">
                  Store Overview
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  {loaderData.shop}
                </Text>
              </BlockStack>
            </InlineStack>
          </Card>

          {/* Statistics Grid */}
          <Layout>
            {statistics.map((stat, index) => (
              <Layout.Section key={index} variant="oneThird">
                <StatCard title={stat.title} value={stat.value} />
              </Layout.Section>
            ))}
          </Layout>

          {/* Charts Section */}
          <ClientOnly>
            <Suspense fallback={<ChartSkeleton />}>
              <Layout>
                <Layout.Section variant="oneHalf">
                  <StorePerformanceChart data={loaderData.storePerformance} />
                </Layout.Section>

                <Layout.Section variant="oneHalf">
                  <TotalConversionsChart data={loaderData.conversions} />
                </Layout.Section>
              </Layout>

              <Layout>
                <Layout.Section variant="oneHalf">
                  <InterventionsChart />
                </Layout.Section>

                <Layout.Section variant="oneHalf">
                  <MarketPerformanceChart data={loaderData.marketPerformance} />
                </Layout.Section>
              </Layout>
            </Suspense>
          </ClientOnly>

          {/* Product Tables */}
          <Layout>
            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Top 5 Most Viewed Products
                  </Text>
                  <ProductsTable type="viewed" data={topViewedProducts} />
                </BlockStack>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Top 5 Most Purchased Products
                  </Text>
                  <ProductsTable type="purchased" data={topPurchasedProducts} />
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        </BlockStack>
      </Page>
    </Frame>
  );
}
