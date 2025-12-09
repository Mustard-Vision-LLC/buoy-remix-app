import { useState, useMemo } from "react";
import { Card, BlockStack, InlineStack, Text, Select } from "@shopify/polaris";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

export default function InterventionsChart() {
  const [filter, setFilter] = useState("weekly");

  const chartData = useMemo(() => {
    // Empty data for now - replace with real data from API based on filter
    const series: number[] = []; // e.g., [44, 55, 13] for [Assisted Shopping, Abandoned Cart, Window Shopper]

    const options: ApexOptions = {
      chart: {
        type: "donut",
        height: 320,
      },
      colors: ["#228403", "#FF5B00", "#0570DE"],
      labels: ["Assisted Shopping", "Abandoned Cart", "Window Shopper"],
      legend: {
        show: false, // We'll use custom legend below
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return val.toFixed(1) + "%";
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
          },
        },
      },
    };

    return { series, options };
  }, []);

  const hasData =
    chartData?.series?.length > 0 && chartData.series.some((s) => s > 0);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h2">
            Intervention Analysis
          </Text>
          <Select
            label=""
            labelHidden
            options={[
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
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
            type="donut"
            height={320}
          />
        ) : (
          <div
            style={{
              height: "320px",
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

        <BlockStack gap="200">
          <InlineStack gap="200" align="center">
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#228403",
                borderRadius: "50%",
              }}
            />
            <Text variant="bodySm" as="p">
              Assisted Shopping
            </Text>
          </InlineStack>

          <InlineStack gap="200" align="center">
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#FF5B00",
                borderRadius: "50%",
              }}
            />
            <Text variant="bodySm" as="p">
              Abandoned Cart
            </Text>
          </InlineStack>

          <InlineStack gap="200" align="center">
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#0570DE",
                borderRadius: "50%",
              }}
            />
            <Text variant="bodySm" as="p">
              Window Shopper
            </Text>
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
