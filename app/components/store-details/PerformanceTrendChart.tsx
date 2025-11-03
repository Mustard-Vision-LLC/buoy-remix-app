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

export default function PerformanceTrendChart() {
  const [filter, setFilter] = useState("year");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getPerformance(filter);
        setData(response);
      } catch (error) {
        console.error("Error fetching performance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [filter]);

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
      ...conversionsDatasets.map(
        (dataset: { data: number[]; label: string }) => ({
          name: `Conversions`,
          data: Array.isArray(dataset.data) ? dataset.data : [],
        }),
      ),
      ...engagementsDatasets.map(
        (dataset: { data: number[]; label: string }) => ({
          name: `Engagements`,
          data: Array.isArray(dataset.data) ? dataset.data : [],
        }),
      ),
    ];

    const categories =
      conversionsLabels.length > 0 ? conversionsLabels : engagementsLabels;

    const options: ApexOptions = {
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ["#FF5B00", "#0570DE"],
      plotOptions: {
        bar: {
          horizontal: false,
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: "13px",
                fontWeight: 900,
              },
            },
          },
        },
      },
      xaxis: {
        type:
          categories.length > 0 && categories[0]?.includes("GMT")
            ? "datetime"
            : "category",
        categories,
      },
      legend: {
        position: "top",
        offsetY: 1,
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
    chartData.series.length > 0 &&
    chartData.series.some((s) => s.data.length > 0) &&
    chartData.options.xaxis?.categories?.length > 0;

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
