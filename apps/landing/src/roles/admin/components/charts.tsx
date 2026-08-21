import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const PRIMARY = "#16a34a";
const PRIMARY_SOFT = "rgba(22, 163, 74, 0.12)";
const GRID = "rgba(148, 163, 184, 0.15)";
const TICKS = "#94a3b8";

const baseScales = {
  x: { grid: { display: false }, ticks: { color: TICKS, font: { size: 11 } }, border: { display: false } },
  y: {
    grid: { color: GRID },
    border: { display: false },
    ticks: { color: TICKS, font: { size: 11 }, maxTicksLimit: 6 },
    beginAtZero: true,
  },
};

const lineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: baseScales,
  elements: { point: { radius: 3, hoverRadius: 5 } },
};

const barOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: baseScales,
};

export function AreaChart({
  labels,
  values,
  height = 260,
}: {
  labels: string[];
  values: number[];
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <Line
        options={lineOptions}
        data={{
          labels,
          datasets: [
            {
              data: values,
              borderColor: PRIMARY,
              backgroundColor: PRIMARY_SOFT,
              fill: true,
              tension: 0.4,
              borderWidth: 2.5,
            },
          ],
        }}
      />
    </div>
  );
}

export function ColumnChart({
  labels,
  values,
  height = 260,
  color = PRIMARY,
}: {
  labels: string[];
  values: number[];
  height?: number;
  color?: string;
}) {
  return (
    <div style={{ height }}>
      <Bar
        options={barOptions}
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: color,
              borderRadius: 8,
              maxBarThickness: 42,
            },
          ],
        }}
      />
    </div>
  );
}

export function DonutChart({
  labels,
  values,
  height = 220,
}: {
  labels: string[];
  values: number[];
  height?: number;
}) {
  const palette = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#94a3b8"];
  return (
    <div style={{ height }}>
      <Doughnut
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          plugins: {
            legend: { position: "bottom", labels: { color: TICKS, usePointStyle: true, boxWidth: 8, padding: 14 } },
          },
        }}
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: palette,
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        }}
      />
    </div>
  );
}

/** Tiny inline trend line for stat cards. */
export function Sparkline({ values, width = 88, height = 30 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - 3 - ((v - min) / range) * (height - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="overflow-visible">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={PRIMARY}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1].split(",")[0]}
        cy={points[points.length - 1].split(",")[1]}
        r="2.5"
        fill={PRIMARY}
      />
    </svg>
  );
}
