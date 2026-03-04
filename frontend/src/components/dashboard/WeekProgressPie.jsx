"use client";

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
import styles from "./WeekProgressPie.module.css";
import { useIsClient } from "@/lib/useIsClient";

export default function WeekProgressPie({ done, goal }) {
  const isClient = useIsClient();

  const safeGoal = goal > 0 ? goal : 1;
  const safeDone = Math.min(done, safeGoal);
  const rest = Math.max(safeGoal - safeDone, 0);

  const data = [
    { name: "done", value: safeDone },
    { name: "rest", value: rest },
  ];

  if (!isClient) return <div className={styles.skeleton} />;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <p className={styles.title}>
          <span className={styles.x}>{`x${safeDone}`}</span>{" "}
          <span className={styles.soft}>{`sur objectif de ${safeGoal}`}</span>
        </p>
        <p className={styles.subtitle}>Courses hebdomadaire réalisées</p>
      </div>

      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={58}
              outerRadius={84}
              startAngle={0}
              endAngle={-360}
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill="#0B2CFF" />
              <Cell fill="rgba(11,44,255,.28)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className={styles.tagLeft}>
          <span className={styles.dotDone} aria-hidden="true" />
          <span>{safeDone} réalisées</span>
        </div>

        <div className={styles.tagRight}>
          <span className={styles.dotRest} aria-hidden="true" />
          <span>{rest} restants</span>
        </div>
      </div>
    </div>
  );
}