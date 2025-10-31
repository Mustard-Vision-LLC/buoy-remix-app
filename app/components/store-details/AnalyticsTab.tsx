import { lazy, Suspense } from "react";
import { Layout, Card, BlockStack, Text } from "@shopify/polaris";

const PerformanceTrendChart = lazy(() => import("./PerformanceTrendChart"));
const ChatRevenueChart = lazy(() => import("./ChatRevenueChart"));

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

export default function AnalyticsTab() {
  // Empty state statistics
  const statistics = [
    {
      title: "Total Sessions",
      value: 0,
    },
    {
      title: "Successful Intervention",
      value: 0,
    },
    {
      title: "Conversion Rate",
      value: "0%",
    },
    {
      title: "Revenue from chat",
      value: "$0",
    },
  ];

  return (
    <BlockStack gap="500">
      <BlockStack gap="300">
        <Text variant="headingSm" as="h3">
          Chat Performance
        </Text>

        {/* Statistics Grid */}
        <Layout>
          {statistics.map((stat, index) => (
            <Layout.Section key={index} variant="oneThird">
              <StatCard title={stat.title} value={stat.value} />
            </Layout.Section>
          ))}
        </Layout>
      </BlockStack>

      {/* Charts */}
      <Suspense fallback={<ChartSkeleton />}>
        <Layout>
          <Layout.Section>
            <PerformanceTrendChart />
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <ChatRevenueChart />
          </Layout.Section>
        </Layout>
      </Suspense>
    </BlockStack>
  );
}
