import { useState, useMemo, useEffect } from "react";
import { Card, BlockStack, InlineStack, Text, Select } from "@shopify/polaris";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { apiClient } from "~/utils/api";

export default function InterventionsChart() {
  const [filter, setFilter] = useState<
    "hourly" | "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [interventionData, setInterventionData] = useState<{
    assistedShopping: number;
    abandonedCart: number;
    windowShopper: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.getInterventionAnalysis(filter);
        setInterventionData(response.data);
      } catch (error) {
        console.error("Error fetching intervention analysis:", error);
        setInterventionData(null);
      }
    };

    fetchData();
  }, [filter]);

  const chartData = useMemo(() => {
    const series = interventionData
      ? [
          interventionData.assistedShopping,
          interventionData.abandonedCart,
          interventionData.windowShopper,
        ]
      : [];

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
  }, [interventionData]);

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
