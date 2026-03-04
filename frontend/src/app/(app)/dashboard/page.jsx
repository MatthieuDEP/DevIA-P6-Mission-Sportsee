"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useApp } from "@/context/AppContext";

import CoachPrompt from "@/components/dashboard/CoachPrompt";
import ProfileCard from "@/components/dashboard/ProfileCard";
import DateArrows from "@/components/dashboard/DateArrows";
import StatBlock from "@/components/dashboard/StatBlock";
import Card from "@/components/dashboard/Card";

import {
  addDays,
  clamp,
  formatShortFR,
  toISODate,
  weekRangeLabelDots,
} from "@/lib/dateUtils";

import styles from "./Dashboard.module.css";

const WeeklyKmChart = dynamic(() => import("@/components/dashboard/WeeklyKmChart"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 300, borderRadius: 14, background: "rgba(17,24,39,.03)" }} />
  ),
});

const HeartRateChart = dynamic(() => import("@/components/dashboard/HeartRateChart"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 300, borderRadius: 14, background: "rgba(17,24,39,.03)" }} />
  ),
});

const WeekProgressPie = dynamic(() => import("@/components/dashboard/WeekProgressPie"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 240, borderRadius: 14, background: "rgba(17,24,39,.03)" }} />
  ),
});

async function fetchActivityRange(startISO, endISO, signal) {
  const res = await fetch(
    `/api/user-activity?startWeek=${startISO}&endWeek=${endISO}`,
    { method: "GET", signal, credentials: "include" }
  );

  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Erreur lors du chargement des activités");
  }

  const data = await res.json();
  return data.activity || [];
}

function sum(arr, key) {
  return arr.reduce((s, x) => s + (Number(x?.[key]) || 0), 0);
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, error } = useApp();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`${ROUTES.LOGIN}?next=${encodeURIComponent(ROUTES.DASHBOARD)}`);
    }
  }, [loading, user, router]);

  const [kmOffset, setKmOffset] = useState(0);
  const [bpmOffset, setBpmOffset] = useState(0);

  const today = useMemo(() => new Date(), []);
  const kmDays = 28;
  const bpmDays = 7;

  const kmRange = useMemo(() => {
    const end = addDays(today, kmOffset * kmDays);
    const start = addDays(end, -(kmDays - 1));
    return { startISO: toISODate(start), endISO: toISODate(end), startDate: start };
  }, [today, kmOffset]);

  const bpmRange = useMemo(() => {
    const end = addDays(today, bpmOffset * bpmDays);
    const start = addDays(end, -(bpmDays - 1));
    return { startISO: toISODate(start), endISO: toISODate(end), startDate: start };
  }, [today, bpmOffset]);

  const globalRange = kmRange;

  const [kmSessions, setKmSessions] = useState([]);
  const [bpmSessions, setBpmSessions] = useState([]);
  const [globalSessions, setGlobalSessions] = useState([]);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    async function run() {
      try {
        const [kmData, bpmData, globalData] = await Promise.all([
          fetchActivityRange(kmRange.startISO, kmRange.endISO, controller.signal),
          fetchActivityRange(bpmRange.startISO, bpmRange.endISO, controller.signal),
          fetchActivityRange(globalRange.startISO, globalRange.endISO, controller.signal),
        ]);

        setKmSessions(Array.isArray(kmData) ? kmData : []);
        setBpmSessions(Array.isArray(bpmData) ? bpmData : []);
        setGlobalSessions(Array.isArray(globalData) ? globalData : []);
        setFetchError("");
      } catch (e) {
        if (e?.name === "AbortError") return;
        setKmSessions([]);
        setBpmSessions([]);
        setGlobalSessions([]);
        setFetchError("Impossible de charger les données d’activité.");
      }
    }

    run();
    return () => controller.abort();
  }, [
    user,
    kmRange.startISO,
    kmRange.endISO,
    bpmRange.startISO,
    bpmRange.endISO,
    globalRange.startISO,
    globalRange.endISO,
  ]);

  const kmTotal = useMemo(() => sum(kmSessions, "distance"), [kmSessions]);
  const kmAverage = useMemo(() => (kmTotal / 4 || 0).toFixed(0), [kmTotal]);

  const weeklyKmData = useMemo(() => {
    const buckets = [0, 0, 0, 0];
    const start = new Date(kmRange.startDate);

    kmSessions.forEach((s) => {
      const d = new Date(s.date);
      const idx = clamp(
        Math.floor((d - start) / (1000 * 60 * 60 * 24 * 7)),
        0,
        3
      );
      buckets[idx] += Number(s.distance) || 0;
    });

    return buckets.map((km, i) => {
      const wStart = addDays(start, i * 7);
      return {
        week: `S${i + 1}`,
        km: Number(km.toFixed(1)),
        rangeLabel: weekRangeLabelDots(wStart),
      };
    });
  }, [kmSessions, kmRange.startDate]);

  const bpmAvg = useMemo(() => {
    if (!bpmSessions.length) return "—";
    const avgs = bpmSessions.map((s) => {
      const heart = s.heartRate || {};
      const min = Number(heart.min ?? (s.bpm ? s.bpm - 25 : 140));
      const max = Number(heart.max ?? s.bpm ?? min + 30);
      const avg = Number(heart.average ?? Math.round((min + max) / 2));
      return avg;
    });
    const v = avgs.reduce((a, b) => a + b, 0) / avgs.length;
    return String(Math.round(v));
  }, [bpmSessions]);

  const heartRateData = useMemo(() => {
    const byDay = Array.from({ length: 7 }, () => null);
    const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    bpmSessions.forEach((s) => {
      const dt = new Date(s.date);
      const day = dt.getDay();
      const index = day === 0 ? 6 : day - 1;

      const heart = s.heartRate || {};
      const min = Number(heart.min ?? (s.bpm ? s.bpm - 25 : 140));
      const max = Number(heart.max ?? s.bpm ?? min + 30);
      const avg = Number(heart.average ?? Math.round((min + max) / 2));

      byDay[index] = { day: labels[index], min, max, avg };
    });

    return byDay.map((v, i) => v || { day: labels[i], min: 0, max: 0, avg: 0 });
  }, [bpmSessions]);

  const weekStats = useMemo(() => {
    const done = bpmSessions.length;
    const goal = 6;
    return {
      done,
      goal,
      totalDuration: Math.round(sum(bpmSessions, "duration")),
      totalDistance: sum(bpmSessions, "distance").toFixed(1),
    };
  }, [bpmSessions]);

  const totalDistanceKm = useMemo(() => {
    const v = user?.statistics?.totalDistance;
    if (v !== undefined && v !== null && String(v).length) return v;
    return sum(globalSessions, "distance").toFixed(0);
  }, [user, globalSessions]);

  if (loading) return <p className={styles.muted}>Chargement…</p>;

  if (!user) return null;

  return (
    <div className={styles.page}>
      <CoachPrompt />
      <ProfileCard user={user} totalDistanceKm={totalDistanceKm} />

      <div className={styles.topRow}>
        <h2 className={styles.sectionTitle}>Vos dernières performances</h2>
      </div>

      <div className={styles.performanceRow}>
        <Card
          headerLeft={
            <div>
              <div className={styles.kpiBlue}>{kmAverage}km en moyenne</div>
              <div className={styles.kpiSub}>Total des kilomètres 4 dernières semaines</div>
            </div>
          }
          headerRight={
            <DateArrows
              label={`${formatShortFR(kmRange.startISO)} - ${formatShortFR(kmRange.endISO)}`}
              onPrev={() => setKmOffset((v) => v - 1)}
              onNext={() => setKmOffset((v) => v + 1)}
            />
          }
          bodyMinHeight={360}
        >
          <WeeklyKmChart key={`${kmRange.startISO}_${kmRange.endISO}`} data={weeklyKmData} />
        </Card>

        <Card
          headerLeft={
            <div>
              <div className={styles.kpiRed}>{bpmAvg} BPM</div>
              <div className={styles.kpiSub}>Fréquence cardiaque moyenne</div>
            </div>
          }
          headerRight={
            <DateArrows
              label={`${formatShortFR(bpmRange.startISO)} - ${formatShortFR(bpmRange.endISO)}`}
              onPrev={() => setBpmOffset((v) => v - 1)}
              onNext={() => setBpmOffset((v) => v + 1)}
            />
          }
          bodyMinHeight={360}
        >
          <HeartRateChart key={`${bpmRange.startISO}_${bpmRange.endISO}`} data={heartRateData} />
        </Card>
      </div>

      {fetchError || error ? <p className={styles.muted}>{fetchError || error}</p> : null}

      <div>
        <h2 className={styles.sectionTitle} style={{ marginBottom: 4 }}>
          Cette semaine
        </h2>
        <p className={styles.muted} style={{ marginTop: 0 }}>
          Du {formatShortFR(bpmRange.startISO)} au {formatShortFR(bpmRange.endISO)}
        </p>
      </div>

      <div className={styles.weekRow}>
        <div className={styles.weekLeft}>
          <Card bodyMinHeight={360}>
            <WeekProgressPie
              key={`${bpmRange.startISO}_${bpmRange.endISO}`}
              done={weekStats.done}
              goal={weekStats.goal}
            />
          </Card>
        </div>

        <div className={styles.weekRight}>
          <StatBlock title="Durée d’activité" value={weekStats.totalDuration} unit="minutes" tone="blue" />
          <StatBlock title="Distance" value={weekStats.totalDistance} unit="kilomètres" tone="red" />
        </div>
      </div>
    </div>
  );
}