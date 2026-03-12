const {
  getTrainingPlanSystemPrompt,
  buildTrainingPlanUserPrompt,
  ALLOWED_GOALS,
  ALLOWED_LEVELS,
  ALLOWED_DAYS,
} = require("./trainingPlanPrompts");

const { callMistralChat } = require("./mistralClient");

const {
  normalizeDay,
  calculateDurationWeeks,
  parseJsonResponse,
  validateTrainingPlan,
} = require("../utils/trainingPlanValidation");

function sanitizeInput(payload = {}) {
  const goal = String(payload.goal || "").trim().toLowerCase();
  const level = String(payload.level || "").trim().toLowerCase();

  if (!ALLOWED_GOALS.includes(goal)) {
    throw new Error("Invalid goal");
  }

  if (!ALLOWED_LEVELS.includes(level)) {
    throw new Error("Invalid level");
  }

  const availableDays = Array.isArray(payload.availableDays)
    ? payload.availableDays
        .map(normalizeDay)
        .filter((day) => ALLOWED_DAYS.includes(day))
    : [];

  if (availableDays.length === 0) {
    throw new Error("availableDays is required");
  }

  const uniqueDays = [...new Set(availableDays)];

  const requestedMaxSessions = payload.maxSessionsPerWeek
    ? Number(payload.maxSessionsPerWeek)
    : uniqueDays.length;

  const maxSessionsPerWeek = Math.max(
    1,
    Math.min(requestedMaxSessions, uniqueDays.length)
  );

  const requestedDurationWeeks = payload.durationWeeks
    ? Number(payload.durationWeeks)
    : undefined;

  const durationWeeks = calculateDurationWeeks({
    targetDate: payload.targetDate,
    requestedDurationWeeks,
  });

  const constraints = Array.isArray(payload.constraints)
    ? payload.constraints.slice(0, 5).map(String)
    : [];

  const userContext = {
    target_time: payload.targetTime || null,
    weekly_distance_km: payload.weeklyDistanceKm || null,
    average_bpm: payload.averageBpm || null,
    age: payload.age || null,
    notes: payload.notes || null,
  };

  return {
    goal,
    level,
    availableDays: uniqueDays,
    maxSessionsPerWeek,
    durationWeeks,
    targetDate: payload.targetDate || null,
    constraints,
    userContext,
  };
}

function getSessionTitle(type) {
  switch (type) {
    case "easy_run":
      return "Footing facile";
    case "interval":
      return "Fractionné";
    case "tempo":
      return "Tempo";
    case "long_run":
      return "Sortie longue";
    case "recovery":
      return "Récupération";
    case "cross_training":
      return "Cross-training";
    default:
      return "Repos";
  }
}

function getSessionDetails(type, intensity) {
  switch (type) {
    case "easy_run":
      return "Course facile et régulière en aisance respiratoire.";
    case "interval":
      return "Séance courte avec répétitions rapides et récupérations lentes.";
    case "tempo":
      return "Bloc soutenu mais contrôlé après un départ progressif.";
    case "long_run":
      return "Sortie continue à allure confortable pour travailler l'endurance.";
    case "recovery":
      return "Séance très facile pour récupérer sans fatigue supplémentaire.";
    case "cross_training":
      return "Activité douce complémentaire pour entretenir la forme.";
    case "rest":
      return "Repos complet ou marche légère selon les sensations.";
    default:
      return intensity === "high"
        ? "Séance intense mais maîtrisée."
        : "Séance simple et progressive.";
  }
}

function buildFallbackPlan(input) {
  const {
    goal,
    level,
    durationWeeks,
    availableDays,
    maxSessionsPerWeek,
    targetDate,
  } = input;

  const selectedDays = availableDays.slice(
    0,
    maxSessionsPerWeek || availableDays.length
  );

  const typePresets = {
    beginner: ["easy_run", "recovery", "long_run"],
    intermediate: ["easy_run", "tempo", "long_run"],
    advanced: ["easy_run", "interval", "long_run"],
  };

  const preset = typePresets[level] || typePresets.beginner;

  const weeks = Array.from({ length: durationWeeks }).map((_, index) => {
    const weekNumber = index + 1;
    const isLastWeek = weekNumber === durationWeeks;

    const baseDuration =
      level === "beginner" ? 25 : level === "intermediate" ? 35 : 45;

    const progression = isLastWeek ? Math.max(0, (index - 1) * 4) : index * 5;

    const sessions = selectedDays.map((day, dayIndex) => {
      const type = preset[Math.min(dayIndex, preset.length - 1)];

      let intensity = "low";
      if (type === "tempo" || type === "long_run") intensity = "moderate";
      if (type === "interval") intensity = "high";

      const durationMin = isLastWeek
        ? Math.max(20, baseDuration + progression - 10)
        : baseDuration + progression + dayIndex * 5;

      return {
        day,
        type,
        title: getSessionTitle(type),
        duration_min: durationMin,
        intensity,
        details: getSessionDetails(type, intensity),
      };
    });

    return {
      week: weekNumber,
      focus:
        weekNumber === 1
          ? "mise en route"
          : weekNumber === durationWeeks
          ? "allègement"
          : "progression",
      sessions,
    };
  });

  return {
    goal,
    duration_weeks: durationWeeks,
    level,
    summary: `Plan ${goal} sur ${durationWeeks} semaines en version sécurisée.`,
    warnings: [
      "Plan de secours généré localement.",
      targetDate
        ? `Durée calculée depuis ${targetDate}.`
        : "Durée calculée depuis la demande.",
    ],
    weeks,
  };
}

async function generateTrainingPlan(rawPayload) {
  const input = sanitizeInput(rawPayload);

  const systemPrompt = getTrainingPlanSystemPrompt(input.goal);
  const userPrompt = buildTrainingPlanUserPrompt(input);

  try {
    const rawResponse = await callMistralChat({
      systemPrompt,
      userPrompt,
    });

    const parsedPlan = parseJsonResponse(rawResponse);

    const plan = {
      ...parsedPlan,
      goal: input.goal,
      level: input.level,
      duration_weeks: input.durationWeeks,
    };

    const validation = validateTrainingPlan(plan, {
      availableDays: input.availableDays,
      maxSessionsPerWeek: input.maxSessionsPerWeek,
    });

    if (!validation.valid) {
      return {
        ok: true,
        source: "fallback_after_validation_error",
        validationErrors: validation.errors,
        plan: buildFallbackPlan(input),
      };
    }

    return {
      ok: true,
      source: "mistral",
      validationErrors: [],
      plan,
    };
  } catch (error) {
    return {
      ok: true,
      source: "fallback_after_mistral_error",
      validationErrors: [error.message],
      plan: buildFallbackPlan(input),
    };
  }
}

module.exports = {
  generateTrainingPlan,
};