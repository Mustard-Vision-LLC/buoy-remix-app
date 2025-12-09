import { useState, useMemo } from "react";
import { Card, BlockStack, InlineStack, Text, Select } from "@shopify/polaris";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface StorePerformanceData {
  status_code: number;
  message: string;
  conversions: {
    datasets: Array<{ data: number[]; label: string }>;
    labels: string[];
  };
  engagements: {
    datasets: Array<{ data: number[]; label: string }>;
    labels: string[];
  };
}

interface Props {
  data: StorePerformanceData | null;
}

export default function StorePerformanceChart({ data }: Props) {
  const [filter, setFilter] = useState("weekly");

  const chartData = useMemo(() => {
    const conversions = data?.conversions ?? { datasets: [], labels: [] };
    const engagements = data?.engagements ?? { datasets: [], labels: [] };
    const conversionsDatasets = Array.isArray(conversions.datasets)
      ? conversions.datasets
      : [];
    const engagementsDatasets = Array.isArray(engagements.datasets)
      ? engagements.datasets
      : [];
    const conversionsLabels = Array.isArray(conversions.labels)
      ? conversions.labels
      : [];
    const engagementsLabels = Array.isArray(engagements.labels)
      ? engagements.labels
      : [];

    const allSeries = [
      ...conversionsDatasets.map((dataset) => ({
        name: "Conversions",
        data: Array.isArray(dataset.data) ? dataset.data : [],
      })),
      ...engagementsDatasets.map((dataset) => ({
        name: "Engagements",
        data: Array.isArray(dataset.data) ? dataset.data : [],
      })),
    ];

    const categories =
      conversionsLabels?.length > 0 ? conversionsLabels : engagementsLabels;

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
