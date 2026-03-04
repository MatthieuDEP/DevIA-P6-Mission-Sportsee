"use client";

import Image from "next/image";
import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useApp } from "@/context/AppContext";
import styles from "./Profile.module.css";

function safeStr(v, fallback = "—") {
  if (v === null || v === undefined) return fallback;
  const s = String(v);
  return s.trim() ? s : fallback;
}

function StatTile({ label, value, unit }) {
  return (
    <div className={styles.statTile}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>
        {value} <span className={styles.statUnit}>{unit}</span>
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useApp();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`${ROUTES.LOGIN}?next=${encodeURIComponent(ROUTES.PROFILE)}`);
    }
  }, [loading, user, router]);

  const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const fullName = useMemo(() => {
    const first = user?.firstName || "";
    const last = user?.lastName || "";
    return `${first} ${last}`.trim();
  }, [user]);

  const memberSince = useMemo(() => user?.createdAt || "—", [user]);

  const avatarUrl = useMemo(() => {
    const file = user?.profilePicture || "sophie.jpg";
    return `${API_ORIGIN}/images/${file}`;
  }, [API_ORIGIN, user]);

  const stats = user?.statistics || {};

  const totalTime = safeStr(stats.totalTime ?? "—");
  const calories = safeStr(stats.calories ?? "—");
  const distance = safeStr(stats.totalDistance ?? "—");
  const restDays = safeStr(stats.restDays ?? "—");
  const sessions = safeStr(stats.sessions ?? "—");

  if (loading) return <p className={styles.muted}>Chargement…</p>;
  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.leftCol}>
          <div className={styles.userCard}>
            <div className={styles.avatarWrap}>
              <Image
                src={avatarUrl}
                alt={fullName ? `Photo de ${fullName}` : "Photo de profil"}
                width={76}
                height={76}
                className={styles.avatar}
                priority
                unoptimized
              />
            </div>

            <div className={styles.userText}>
              <p className={styles.userName}>{fullName || "—"}</p>
              <p className={styles.userMeta}>Membre depuis le {memberSince}</p>
            </div>
          </div>

          <div className={styles.profileCard}>
            <div className={styles.profileHead}>
              <h2 className={styles.profileTitle}>Votre profil</h2>
              <div className={styles.profileDivider} />
            </div>

            <ul className={styles.profileList}>
              <li className={styles.profileItem}>
                <span className={styles.profileKey}>Âge :</span>
                <span className={styles.profileVal}>{safeStr(user?.age)}</span>
              </li>
              <li className={styles.profileItem}>
                <span className={styles.profileKey}>Genre :</span>
                <span className={styles.profileVal}>{safeStr(user?.gender)}</span>
              </li>
              <li className={styles.profileItem}>
                <span className={styles.profileKey}>Taille :</span>
                <span className={styles.profileVal}>{safeStr(user?.height)}</span>
              </li>
              <li className={styles.profileItem}>
                <span className={styles.profileKey}>Poids :</span>
                <span className={styles.profileVal}>
                  {safeStr(user?.weight)}
                  {user?.weight ? "kg" : ""}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.statsHead}>
            <h2 className={styles.statsTitle}>Vos statistiques</h2>
            <p className={styles.statsSub}>depuis le {memberSince}</p>
          </div>

          <div className={styles.statsGrid}>
            <StatTile label="Temps total couru" value={totalTime} unit="" />
            <StatTile label="Calories brûlées" value={calories} unit="cal" />
            <StatTile label="Distance totale parcourue" value={distance} unit="km" />
            <StatTile label="Nombre de jours de repos" value={restDays} unit="jours" />
            <div className={styles.statsSingle}>
              <StatTile label="Nombre de sessions" value={sessions} unit="sessions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}