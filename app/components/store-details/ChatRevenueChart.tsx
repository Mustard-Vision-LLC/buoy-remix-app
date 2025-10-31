import { useState, useMemo } from "react";
import { Card, BlockStack, InlineStack, Text, Select } from "@shopify/polaris";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

export default function ChatRevenueChart() {
  const [filter, setFilter] = useState("weekly");

  const chartData = useMemo(() => {
    // Empty data for now - replace with real data from API based on filter
    const series = [
      {
        name: "Revenue",
        data: [], // e.g., [100, 200, 150, 300, 250, 400, 350]
      },
    ];

    const options: ApexOptions = {
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      colors: ["#228403"],
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: [], // e.g., ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      },
      yaxis: {
        title: {
          text: "Revenue ($)",
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
            Chat Revenue
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
