import { useState, useMemo, useEffect } from "react";
import { Card, BlockStack, InlineStack, Text, Select } from "@shopify/polaris";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { apiClient } from "~/utils/api";

interface ConversionDataPoint {
  date: string;
  value: number;
}

export default function TotalConversionsChart() {
  const [filter, setFilter] = useState<
    "hourly" | "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [data, setData] = useState<ConversionDataPoint[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getTotalConversions(filter);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching total conversions:", error);
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
          chart: { type: "line" as const, height: 350 },
          xaxis: { categories: [] },
        },
      };
    }

    const conversionsData = data.map((item) => item.value);
    const categories = data.map((item) =>
      new Date(item.date).toLocaleDateString(),
    );

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
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ["#228403"],
      stroke: {
        curve: "smooth",
        width: 3,
      },
      markers: {
        size: 4,
        colors: ["#228403"],
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: {
          size: 6,
        },
      },
      xaxis: {
        categories: categories,
      },
      yaxis: {
        title: {
          text: "Conversions",
        },
      },
      grid: {
        borderColor: "#f1f1f1",
      },
      dataLabels: {
        enabled: false,
      },
    };

    return { series, options };
  }, [data]);

  const hasData =
    chartData?.series?.length > 0 &&
    chartData?.series?.some((s) => s.data?.length > 0);

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
