import { useState, useMemo } from "react";
import { Card, BlockStack, InlineStack, Text, Select } from "@shopify/polaris";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

export default function TotalConversionsChart() {
  const [filter, setFilter] = useState("weekly");

  const chartData = useMemo(() => {
    // Empty data for now - replace with real data from API based on filter
    const series = [
      {
        name: "Conversions",
        data: [], // e.g., [44, 55, 57, 56, 61, 58, 63]
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
        categories: [], // e.g., ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
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
  }, []);

  const hasData =
    chartData.series.length > 0 &&
    chartData.series.some((s) => s.data.length > 0);

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
