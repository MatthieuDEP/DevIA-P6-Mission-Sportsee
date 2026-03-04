"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./HeartRateChart.module.css";
import { useIsClient } from "@/lib/useIsClient";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const map = Object.fromEntries(payload.map((p) => [p.dataKey, p.value]));

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{label}</p>
      <p className={styles.tooltipLine}>
        <span className={styles.dotMin} aria-hidden="true" /> Min {map.min} bpm
      </p>
      <p className={styles.tooltipLine}>
        <span className={styles.dotMax} aria-hidden="true" /> Max {map.max} bpm
      </p>
      <p className={styles.tooltipLine}>
        <span className={styles.dotAvg} aria-hidden="true" /> Moy {map.avg} bpm
      </p>
    </div>
  );
}

export default function HeartRateChart({ data }) {
  const isClient = useIsClient();

  const chartData = (data || []).map((d) => ({
    day: d.day,
    min: Number(d.min || 0),
    max: Number(d.max || 0),
    avg: Number(d.avg || 0),
  }));

  if (!isClient) return <div className={styles.skeleton} />;

  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={chartData}
          margin={{ top: 14, right: 18, left: 10, bottom: 0 }}
          barCategoryGap={26}
          barGap={10}
        >
          <CartesianGrid vertical={false} strokeDasharray="2 4" />
          <XAxis
            dataKey="day"
            axisLine={{ stroke: "rgba(17,24,39,.35)" }}
            tickLine={false}
            tick={{ fill: "rgba(17,24,39,.6)", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            domain={[130, 187]}
            ticks={[130, 145, 160, 187]}
            axisLine={{ stroke: "rgba(17,24,39,.35)" }}
            tickLine={false}
            tick={{ fill: "rgba(17,24,39,.55)", fontSize: 11 }}
            width={30}
          />

          <Tooltip content={<CustomTooltip />} cursor={false} />

          <Bar
            dataKey="min"
            fill="rgba(255, 45, 45, 0.25)"
            radius={[10, 10, 10, 10]}
            barSize={12}
            isAnimationActive={false}
          />
          <Bar
            dataKey="max"
            fill="#FF2D2D"
            radius={[10, 10, 10, 10]}
            barSize={12}
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="avg"
            stroke="#0B2CFF"
            strokeWidth={2.5}
            dot={{ r: 4, stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className={styles.legend}>
        <span className={styles.item}>
          <span className={styles.dotMin} /> Min
        </span>
        <span className={styles.item}>
          <span className={styles.dotMax} /> Max BPM
        </span>
        <span className={styles.item}>
          <span className={styles.dotAvg} /> Moy BPM
        </span>
      </div>
    </div>
  );
}