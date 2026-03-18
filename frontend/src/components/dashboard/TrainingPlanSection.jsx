"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "./TrainingPlanSection.module.css";

const GOAL_OPTIONS = [
  { value: "5k", label: "Préparer un 5 km" },
  { value: "10k", label: "Préparer un 10 km" },
  { value: "half_marathon", label: "Préparer un semi-marathon" },
  { value: "marathon", label: "Préparer un marathon" },
  { value: "free_training", label: "Entraînement libre" },
];

const DEFAULT_AVAILABLE_DAYS = ["monday", "wednesday", "friday", "sunday"];
const DEFAULT_MAX_SESSIONS = 4;

const DAY_LABELS = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

const INTENSITY_LABELS = {
  low: "Faible",
  moderate: "Modérée",
  high: "Élevée",
};

function MinusIcon() {
  return <span className={styles.iconCircle}>−</span>;
}

function PlusIcon() {
  return <span className={styles.iconCircle}>+</span>;
}

function downloadPlan(plan) {
  const blob = new Blob([JSON.stringify(plan, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sportsee-training-plan.json";
  link.click();
  URL.revokeObjectURL(url);
}

function getIntensityClass(intensity) {
  if (intensity === "high") return styles.intensityHigh;
  if (intensity === "moderate") return styles.intensityModerate;
  return styles.intensityLow;
}

function SectionIcon({ src, alt }) {
  return (
    <div className={styles.iconWrapper}>
      <Image src={src} alt={alt} width={64} height={64} className={styles.sectionIcon} />
    </div>
  );
}

function SessionCard({ session }) {
  return (
    <article className={styles.sessionCard}>
      <div className={styles.sessionMain}>
        <p className={styles.sessionDay}>{DAY_LABELS[session.day] || session.day}</p>
        <h3 className={styles.sessionTitle}>{session.title}</h3>
        <p className={styles.sessionDetails}>{session.details}</p>

        <div className={styles.sessionMeta}>
          <span className={`${styles.intensityBadge} ${getIntensityClass(session.intensity)}`}>
            Intensité {INTENSITY_LABELS[session.intensity] || session.intensity}
          </span>
          <span className={styles.typeBadge}>{session.type}</span>
        </div>
      </div>

      <div className={styles.durationPill}>{session.duration_min}min</div>
    </article>
  );
}

function WeekAccordion({ week, isOpen, onToggle }) {
  return (
    <section className={styles.weekCard}>
      <button
        type="button"
        className={styles.weekHeader}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h2 className={styles.weekTitle}>Semaine {week.week}</h2>
        {isOpen ? <MinusIcon /> : <PlusIcon />}
      </button>

      {isOpen && (
        <div className={styles.sessionsList}>
          {week.sessions.map((session, index) => (
            <SessionCard
              key={`${week.week}-${session.day}-${session.type}-${index}`}
              session={session}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ onStart }) {
  return (
    <section className={styles.cardShell}>
      <SectionIcon src="/calendarIcon.png" alt="Calendrier" />

      <h2 className={styles.heroTitle}>Créez votre planning d&apos;entraînement intelligent</h2>
      <p className={styles.heroText}>
        Notre IA vous aide à bâtir un planning 100 % personnalisé selon vos objectifs, votre
        niveau et votre emploi du temps.
      </p>

      <button type="button" className={styles.primaryButton} onClick={onStart}>
        Commencer
      </button>
    </section>
  );
}

function StepGoal({ goal, onChange, onNext, isLoading }) {
  return (
    <section className={styles.cardShell}>
      <SectionIcon src="/targetIcon.png" alt="Objectif" />

      <h2 className={styles.heroTitle}>Quel est votre objectif principal ?</h2>
      <p className={styles.heroText}>Choisissez l’objectif qui vous motive le plus</p>

      <div className={styles.formBlock}>
        <label htmlFor="training-goal" className={styles.label}>
          Objectif
        </label>
        <select
          id="training-goal"
          value={goal}
          onChange={(event) => onChange(event.target.value)}
          className={styles.input}
        >
          {GOAL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.centerActionRow}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onNext}
          disabled={isLoading}
        >
          Suivant
        </button>
      </div>
    </section>
  );
}

function StepStartDate({ startDate, onChange, onBack, onSubmit, isLoading }) {
  return (
    <section className={styles.cardShell}>
      <SectionIcon src="/calendarIcon.png" alt="Calendrier" />

      <h2 className={styles.heroTitle}>Quand souhaitez vous commencer votre programme ?</h2>
      <p className={styles.heroText}>
        Générer un programme d’une semaine à partir de la date de votre choix
      </p>

      <div className={styles.formBlock}>
        <label htmlFor="training-start-date" className={styles.label}>
          Date de début
        </label>
        <input
          id="training-start-date"
          type="date"
          value={startDate}
          onChange={(event) => onChange(event.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.actionsRow}>
        <button type="button" className={styles.secondarySquareButton} onClick={onBack}>
          ←
        </button>
        <button
          type="button"
          className={styles.primaryButtonWide}
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Génération..." : "Générer mon planning"}
        </button>
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <section className={styles.cardShell}>
      <div className={styles.spinner} />
      <h2 className={styles.heroTitle}>Génération de votre planning…</h2>
      <p className={styles.heroText}>
        Nous préparons un programme adapté à votre objectif. Cela peut prendre quelques secondes.
      </p>
    </section>
  );
}

function ErrorState({ message, onRetry, onBack }) {
  return (
    <section className={styles.cardShell}>
      <div className={styles.errorBadge}>!</div>
      <h2 className={styles.heroTitle}>Une erreur est survenue</h2>
      <p className={styles.heroText}>{message}</p>

      <div className={styles.doubleActionRow}>
        <button type="button" className={styles.secondaryGhostButton} onClick={onBack}>
          Modifier
        </button>
        <button type="button" className={styles.primaryButton} onClick={onRetry}>
          Réessayer
        </button>
      </div>
    </section>
  );
}

function PlanView({ plan, onRegenerate, isRegenerating }) {
  const [openWeeks, setOpenWeeks] = useState(() => {
    const initial = {};
    for (const week of plan.weeks || []) {
      initial[week.week] = week.week === 1;
    }
    return initial;
  });

  const warningText = useMemo(() => {
    if (!Array.isArray(plan.warnings) || plan.warnings.length === 0) return null;
    return plan.warnings.join(" ");
  }, [plan.warnings]);

  function toggleWeek(weekNumber) {
    setOpenWeeks((prev) => ({
      ...prev,
      [weekNumber]: !prev[weekNumber],
    }));
  }

  return (
    <section className={styles.cardShellLarge}>
      <div className={styles.planIntro}>
        <h2 className={styles.planTitle}>Votre planning de la semaine</h2>
        <p className={styles.planSubtitle}>Important pour définir un programme adapté</p>
      </div>

      {warningText && <div className={styles.warningBox}>{warningText}</div>}

      <div className={styles.weeksStack}>
        {plan.weeks.map((week) => (
          <WeekAccordion
            key={week.week}
            week={week}
            isOpen={Boolean(openWeeks[week.week])}
            onToggle={() => toggleWeek(week.week)}
          />
        ))}
      </div>

      <div className={styles.footerActions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => downloadPlan(plan)}
        >
          Télécharger
        </button>

        <button type="button" className={styles.primaryButtonWide} onClick={onRegenerate}>
          {isRegenerating ? "Régénération..." : "Régénérer un programme"}
        </button>
      </div>
    </section>
  );
}

export default function TrainingPlanSection() {
  const [step, setStep] = useState("empty");
  const [startDate, setStartDate] = useState("");
  const [goal, setGoal] = useState("10k");
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function generatePlan() {
    setIsLoading(true);
    setError("");
    setStep("loading");

    try {
      const response = await fetch("/api/training-plan/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          level: "beginner",
          targetDate: startDate || null,
          availableDays: DEFAULT_AVAILABLE_DAYS,
          maxSessionsPerWeek: DEFAULT_MAX_SESSIONS,
          constraints: ["planning lisible et progressif"],
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message || "Impossible de générer le planning."
        );
      }

      if (typeof data !== "object" || !data?.plan?.weeks?.length) {
        throw new Error("Le planning reçu est vide.");
      }

      setPlan(data.plan);
      setStep("plan");
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  }

  if (step === "empty") {
    return <EmptyState onStart={() => setStep("goal")} />;
  }

  if (step === "goal") {
    return (
      <StepGoal
        goal={goal}
        onChange={setGoal}
        onNext={() => setStep("start-date")}
        isLoading={isLoading}
      />
    );
  }

  if (step === "start-date") {
    return (
      <StepStartDate
        startDate={startDate}
        onChange={setStartDate}
        onBack={() => setStep("goal")}
        onSubmit={generatePlan}
        isLoading={isLoading}
      />
    );
  }

  if (step === "loading") {
    return <LoadingState />;
  }

  if (step === "error") {
    return (
      <ErrorState
        message={error}
        onRetry={generatePlan}
        onBack={() => setStep("start-date")}
      />
    );
  }

  return (
    <PlanView
      plan={plan}
      onRegenerate={generatePlan}
      isRegenerating={isLoading}
    />
  );
}