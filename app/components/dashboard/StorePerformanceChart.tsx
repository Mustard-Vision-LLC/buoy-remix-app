import { useState, useMemo, useEffect } from "react";
import { Card, BlockStack, InlineStack, Text, Select } from "@shopify/polaris";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { apiClient } from "~/utils/api";

interface StorePerformanceData {
  date: string;
  totalEngagement: number;
  totalConversions: number;
}

export default function StorePerformanceChart() {
  const [filter, setFilter] = useState<
    "hourly" | "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [data, setData] = useState<StorePerformanceData[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getStorePerformance(filter);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching store performance:", error);
        setData(null);
      }
    };

    fetchData();
  }, [filter]);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        series: [],
        options: {
          chart: { type: "bar" as const, height: 350 },
          xaxis: { categories: [] },
        },
      };
    }

    const categories = data.map((item) => item.date);
    const conversionsData = data.map((item) => item.totalConversions);
    const engagementsData = data.map((item) => item.totalEngagement);

    const allSeries = [
      {
        name: "Conversions",
        data: conversionsData,
      },
      {
        name: "Engagements",
        data: engagementsData,
      },
    ];

    const options: ApexOptions = {
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      colors: ["#FF5B00", "#0570DE"],
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: categories,
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
      },
      fill: {
        opacity: 1,
      },
      dataLabels: {
        enabled: false,
      },
    };

    return { series: allSeries, options };
  }, [data]);

  const hasData =
    chartData?.series?.length > 0 &&
    chartData?.series?.some((s) => s.data?.length > 0);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h2">
            Store Performance
          </Text>
          <Select
            label=""
            labelHidden
            options={[
              { label: "Hourly", value: "hourly" },
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" },
            ]}
            value={filter}
            onChange={(value) => setFilter(value as typeof filter)}
          />
        </InlineStack>

        {hasData ? (
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={350}
          />
        ) : (
          <div
            style={{
              height: "350px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed #c9cccf",
              borderRadius: "8px",
            }}
          >
            <Text variant="bodyMd" as="p" tone="subdued">
              No data available
            </Text>
          </div>
        )}
      </BlockStack>
    </Card>
  );
}
