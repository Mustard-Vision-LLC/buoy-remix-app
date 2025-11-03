import { lazy, Suspense, useState, useEffect } from "react";
import { Layout, Card, BlockStack, Text, Spinner } from "@shopify/polaris";
import { apiClient } from "~/utils/api";

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
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.getAnalytics();
        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const statistics = [
    {
      title: "Total Sessions",
      value: analytics?.total_sessions || 0,
    },
    {
      title: "Successful Intervention",
      value: analytics?.successful_intervention || 0,
    },
    {
      title: "Conversion Rate",
      value: `${analytics?.conversion_rate || 0}%`,
    },
    {
      title: "Revenue from chat",
      value: `$${analytics?.revenue_from_chat || 0}`,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spinner size="large" />
      </div>
    );
  }

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
