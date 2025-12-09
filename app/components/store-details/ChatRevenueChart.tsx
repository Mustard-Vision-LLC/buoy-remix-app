import { useState, useMemo, useEffect } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Select,
  Spinner,
} from "@shopify/polaris";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { apiClient } from "~/utils/api";

export default function ChatRevenueChart() {
  const [filter, setFilter] = useState("year");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getRevenue(filter);
        setData(response);
      } catch (error) {
        console.error("Error fetching revenue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [filter]);

  const chartData = useMemo(() => {
    const conversionsData = data?.data?.datasets?.[0]?.data ?? [];
    const categories = data?.data?.labels ?? [];

    const series = [
      {
        name: "Total Conversions",
        data: conversionsData,
      },
    ];

    const options: ApexOptions = {
      chart: {
        type: "line",
        height: 350,
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      colors: ["#3B82F6"],
      xaxis: {
        categories: categories,
      },
      yaxis: {
        title: {
          text: "Conversions",
        },
      },
      markers: {
        size: 5,
        colors: ["#3B82F6"],
        strokeColors: "#fff",
        strokeWidth: 2,
      },
      tooltip: {
        enabled: true,
      },
      legend: {
        position: "top",
      },
      grid: {
        borderColor: "#e5e7eb",
      },
    };

    return { series, options };
  }, [data]);

  const hasData =
    chartData?.series[0]?.data?.length > 0 &&
    chartData?.options.xaxis?.categories?.length > 0;

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h2">
            Total Conversions
          </Text>
          <Select
            label=""
            labelHidden
            options={[
              { label: "Weekly", value: "week" },
              { label: "Monthly", value: "month" },
              { label: "Yearly", value: "year" },
            ]}
            value={filter}
            onChange={(value) => setFilter(value)}
          />
        </InlineStack>

        {loading ? (
          <div
            style={{
              height: "350px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner size="large" />
          </div>
        ) : hasData ? (
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="line"
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
