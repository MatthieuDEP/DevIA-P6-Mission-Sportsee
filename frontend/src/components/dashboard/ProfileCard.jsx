"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./ProfileCard.module.css";

export default function ProfileCard({ user, totalDistanceKm }) {
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:8000";

  const fileName = user?.profilePicture || "sophie.jpg";
  const remoteSrc = `${API_ORIGIN}/images/${fileName}`;

  const [src, setSrc] = useState(remoteSrc);

  return (
    <section className={styles.card}>
      <div className={styles.left}>
        <div className={styles.avatarWrap}>
          <Image
            className={styles.avatar}
            src={src}
            alt={fullName ? `Photo de ${fullName}` : "Photo de profil"}
            width={72}
            height={72}
            priority
            unoptimized
            onError={() => setSrc("/LoginPicture.png")}
          />
        </div>

        <div className={styles.identity}>
          <h1 className={styles.name}>{fullName || "Utilisateur"}</h1>
          <p className={styles.meta}>
            Membre depuis le{" "}
            <span className={styles.metaStrong}>{user?.createdAt || "—"}</span>
          </p>
        </div>
      </div>

      <div className={styles.distanceGroup}>
        <span className={styles.distanceLabel}>Distance totale parcourue</span>
        <div className={styles.distanceCard}>
          <span className={styles.distanceValue}>
            {Number(totalDistanceKm || 0).toFixed(0)} km
          </span>
        </div>
      </div>
    </section>
  );
}