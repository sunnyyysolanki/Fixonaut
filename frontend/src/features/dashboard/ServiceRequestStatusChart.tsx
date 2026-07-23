import ReactECharts from "echarts-for-react";

import type { StatusMetric } from "./types";

function ServiceRequestStatusChart({ metrics }: { metrics: StatusMetric[] }) {
  if (metrics.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-500">
        No service-request data available.
      </div>
    );
  }

  const option = {
    backgroundColor: "transparent",

    tooltip: {
      trigger: "item",
      backgroundColor: "#0f172a",
      borderColor: "#334155",
      textStyle: {
        color: "#f8fafc",
      },
      formatter: "{b}: {c} ({d}%)",
    },

    legend: {
      bottom: 0,
      left: "center",
      textStyle: {
        color: "#94a3b8",
      },
      type: "scroll",
    },

    series: [
      {
        name: "Service Requests",
        type: "pie",
        radius: ["48%", "75%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,

        itemStyle: {
          borderColor: "#0f172a",
          borderWidth: 3,
        },

        label: {
          show: false,
        },

        emphasis: {
          label: {
            show: true,
            color: "#f8fafc",
            fontSize: 14,
            fontWeight: "bold",
          },
        },

        data: metrics.map((metric) => ({
          name: formatStatus(metric.status),
          value: metric.count,
        })),

        color: [
          "#3b82f6",
          "#8b5cf6",
          "#06b6d4",
          "#f97316",
          "#f59e0b",
          "#10b981",
          "#ef4444",
        ],
      },
    ],
  };

  return (
    <div className="h-72 w-full">
      <ReactECharts
        option={option}
        style={{
          width: "100%",
          height: "100%",
        }}
        opts={{
          renderer: "canvas",
        }}
        notMerge
        lazyUpdate
      />
    </div>
  );
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default ServiceRequestStatusChart;
