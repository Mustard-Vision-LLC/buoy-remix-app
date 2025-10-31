import { useState, useMemo } from "react";
import { Card, BlockStack, InlineStack, Text, Select } from "@shopify/polaris";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

export default function PerformanceTrendChart() {
  const [filter, setFilter] = useState("weekly");

  const chartData = useMemo(() => {
    // Empty data for now - replace with real data from API based on filter
    const series = [
      {
        name: "Sessions",
        data: [], // e.g., [30, 40, 35, 50, 49, 60, 70]
      },
      {
        name: "Conversions",
        data: [], // e.g., [15, 20, 18, 25, 24, 30, 35]
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
      colors: ["#0570DE", "#228403"],
      stroke: {
        curve: "smooth",
        width: 3,
      },
      markers: {
        size: 4,
        hover: {
          size: 6,
        },
      },
      xaxis: {
        categories: [], // e.g., ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
      },
      grid: {
        borderColor: "#f1f1f1",
      },
      dataLabels: {
        enabled: false,
      },
    };

    return { series, options };
  }, []);

  const hasData =
    chartData.series.length > 0 &&
    chartData.series.some((s) => s.data.length > 0);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h2">
            Performance Trend
          </Text>
          <Select
            label=""
            labelHidden
            options={[
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" },
            ]}
            value={filter}
            onChange={(value) => setFilter(value)}
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
