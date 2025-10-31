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
import StorePerformanceChart from "./StorePerformanceChart";
import TotalConversionsChart from "./TotalConversionsChart";
import InterventionsChart from "./InterventionsChart";
import MarketPerformanceChart from "./MarketPerformanceChart";
import ProductsTable from "./ProductsTable";

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
  }>();

  // Empty state statistics
  const statistics = [
    {
      title: "Total Engagement",
      value: 0,
    },
    {
      title: "Total Conversion",
      value: 0,
    },
    {
      title: "Avg Time Spent on Chat",
      value: "0 min",
    },
    {
      title: "Total Successful Sales",
      value: 0,
    },
    {
      title: "Total Generated Revenue",
      value: "$0",
    },
    {
      title: "Total Abandoned Carts",
      value: 0,
    },
    {
      title: "Total Assisted Shopping",
      value: 0,
    },
    {
      title: "Total Coupon Intervention",
      value: 0,
    },
    {
      title: "Current Coupon Budget",
      value: "$0",
    },
    {
      title: "Available Coupon Budget",
      value: "$0",
    },
  ];

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
          </ClientOnly>

          {/* Product Tables */}
          <Layout>
            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Top 5 Most Viewed Products
                  </Text>
                  <ProductsTable type="viewed" />
                </BlockStack>
              </Card>
            </Layout.Section>

            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Top 5 Most Purchased Products
                  </Text>
                  <ProductsTable type="purchased" />
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        </BlockStack>
      </Page>
    </Frame>
  );
}
