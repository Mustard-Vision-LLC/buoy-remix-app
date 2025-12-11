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
    metrics: {
      total_engagement: number;
      total_conversions: number;
      conversion_rate: number;
      total_revenue: number;
      avg_time_chats: number;
      assisted_shopping: number;
      coupon_intervention: number;
      total_abandoned_carts: number;
      couponBudgets: number;
    } | null;
    couponBudget: {
      data: {
        labels: string[];
        values: number[];
        percentages: number[];
        colors: string[];
      };
    } | null;
    storePerformance: Array<{
      date: string;
      totalEngagement: number;
      totalConversions: number;
    }> | null;
    conversions: Array<{
      date: string;
      value: number;
    }> | null;
    marketPerformance: Array<{
      date: string;
      revenue: number;
      interventions: number;
    }> | null;
    interventionAnalysis: {
      assistedShopping: number;
      abandonedCart: number;
      windowShopper: number;
    } | null;
    analytics: {
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
  }>();

  const metrics = loaderData.metrics;
  const analytics = loaderData.analytics;

  // Set access token and shop URL for client-side API calls (e.g., charts with filters)
  useEffect(() => {
    if (loaderData.accessToken && loaderData.shop) {
      setAccessToken(loaderData.accessToken);
      setShopUrl(loaderData.shop);
    }
  }, [loaderData.accessToken, loaderData.shop]);

  // Statistics using new metrics data structure
  const statistics = [
    {
      title: "Total Engagement",
      value: metrics?.total_engagement || 0,
    },
    {
      title: "Total Conversions",
      value: metrics?.total_conversions || 0,
    },
    {
      title: "Conversion Rate",
      value: `${metrics?.conversion_rate || 0}%`,
    },
    {
      title: "Total Revenue",
      value: `$${metrics?.total_revenue || 0}`,
    },
    {
      title: "Avg Time on Chats",
      value: Math.round(metrics?.avg_time_chats || 0),
    },
    {
      title: "Assisted Shopping",
      value: metrics?.assisted_shopping || 0,
    },
    {
      title: "Coupon Intervention",
      value: metrics?.coupon_intervention || 0,
    },
    {
      title: "Total Abandoned Carts",
      value: metrics?.total_abandoned_carts || 0,
    },
    {
      title: "Coupon Budget",
      value: `$${metrics?.couponBudgets || 0}`,
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
                  <StorePerformanceChart />
                </Layout.Section>

                <Layout.Section variant="oneHalf">
                  <TotalConversionsChart />
                </Layout.Section>
              </Layout>

              <Layout>
                <Layout.Section variant="oneHalf">
                  <InterventionsChart />
                </Layout.Section>

                <Layout.Section variant="oneHalf">
                  <MarketPerformanceChart />
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
