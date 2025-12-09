import { useState, useMemo } from "react";
import { Card, BlockStack, InlineStack, Text, Select } from "@shopify/polaris";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface MarketPerformanceData {
  status_code: number;
  message: string;
  data: {
    conversions: {
      datasets: Array<{ data: number[]; label: string }>;
      labels: string[];
    };
    engagements: {
      datasets: Array<{ data: number[]; label: string }>;
      labels: string[];
    };
  };
}

interface Props {
  data: MarketPerformanceData | null;
}

export default function MarketPerformanceChart({ data }: Props) {
  const [filter, setFilter] = useState("weekly");

  const chartData = useMemo(() => {
    const conversionsData = data?.data?.conversions?.datasets?.[0]?.data ?? [];
    const engagementsData = data?.data?.engagements?.datasets?.[0]?.data ?? [];
    const conversionsLabels = data?.data?.conversions?.labels ?? [];
    const engagementsLabels = data?.data?.engagements?.labels ?? [];
    const categories =
      conversionsLabels?.length > 0 ? conversionsLabels : engagementsLabels;

    const series = [
      {
        name: "Revenue",
        data: conversionsData,
      },
      {
        name: "Intervention",
        data: engagementsData,
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
      colors: ["#FF5B00", "#0570DE"],
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
        categories: categories,
      },
      yaxis: [
        {
          title: {
            text: "Revenue",
          },
          labels: {
            formatter: (val) => `$${val.toLocaleString()}`,
          },
        },
        {
          opposite: true,
          title: {
            text: "Intervention",
          },
        },
      ],
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
  }, [data]);

  const hasData =
    chartData.series?.length > 0 &&
    chartData.series.some((s) => s.data.length > 0);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h2">
            Market Performance
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
