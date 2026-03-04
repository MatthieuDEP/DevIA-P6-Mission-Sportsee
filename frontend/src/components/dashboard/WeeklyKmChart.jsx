"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import styles from "./WeeklyKmChart.module.css";
import { useIsClient } from "@/lib/useIsClient";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{p?.rangeLabel}</p>
      <p className={styles.tooltipValue}>
        {String(p?.km).replace(".", ",")} km
      </p>
    </div>
  );
}

export default function WeeklyKmChart({ data }) {
  const isClient = useIsClient();
  const [activeIndex, setActiveIndex] = useState(-1);

  const filled = useMemo(() => (data || []).map((d) => ({ ...d })), [data]);

  if (!isClient) return <div className={styles.skeleton} />;

  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={filled}
          barCategoryGap={42}
          margin={{ top: 14, right: 18, left: 10, bottom: 0 }}
          onMouseLeave={() => setActiveIndex(-1)}
        >
          <CartesianGrid vertical={false} strokeDasharray="2 4" />
          <XAxis
            dataKey="week"
            axisLine={{ stroke: "rgba(17,24,39,.35)" }}
            tickLine={false}
            tick={{ fill: "rgba(17,24,39,.6)", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={{ stroke: "rgba(17,24,39,.35)" }}
            tickLine={false}
            tick={{ fill: "rgba(17,24,39,.55)", fontSize: 11 }}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />

          <Bar
            dataKey="km"
            radius={[10, 10, 10, 10]}
            barSize={14}
            onMouseEnter={(_, idx) => setActiveIndex(idx)}
            isAnimationActive={false}
          >
            {filled.map((_, idx) => (
              <Cell
                key={`cell-${idx}`}
                className={styles.barCell}
                fill={idx === activeIndex ? "#0B2CFF" : "rgba(11,44,255,.28)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className={styles.legend}>
        <span className={styles.dot} aria-hidden="true" />
        <span>Km</span>
      </div>
    </div>
  );
}