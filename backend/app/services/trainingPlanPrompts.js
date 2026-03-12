// backend/app/services/trainingPlanPrompts.js

const ALLOWED_GOALS = [
  "5k",
  "10k",
  "half_marathon",
  "marathon",
  "free_training",
];

const ALLOWED_LEVELS = ["beginner", "intermediate", "advanced"];

const ALLOWED_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const ALLOWED_TYPES = [
  "rest",
  "easy_run",
  "interval",
  "tempo",
  "long_run",
  "recovery",
  "cross_training",
];

const ALLOWED_INTENSITIES = ["low", "moderate", "high"];

const COMMON_RULES = `
Tu es un coach de course à pied expert, prudent, clair et concret.

Ta mission est de générer un plan d'entraînement en JSON strict.

Règles obligatoires :
- Réponds uniquement avec un JSON valide.
- N'écris aucun texte avant ou après le JSON.
- Respecte strictement la structure demandée.
- Respecte strictement les jours de disponibilité fournis.
- N'ajoute aucune séance sur un jour non disponible.
- Le plan doit être réaliste, prudent et progressif.
- Le plan doit rester court et compact.
- Si l'objectif est trop ambitieux, adapte prudemment le plan et explique-le dans "warnings".
- Ne donne jamais de conseil médical.

Contraintes de concision :
- summary = 1 phrase courte.
- warnings = 0 à 2 éléments maximum.
- focus = très court.
- title = très court.
- details = 1 seule phrase courte.
- Pas de texte inutile.
- Pas de répétitions.
- Pas d'explications hors JSON.

Valeurs autorisées :
- goal : ${ALLOWED_GOALS.join(" | ")}
- level : ${ALLOWED_LEVELS.join(" | ")}
- day : ${ALLOWED_DAYS.join(" | ")}
- type : ${ALLOWED_TYPES.join(" | ")}
- intensity : ${ALLOWED_INTENSITIES.join(" | ")}

Structure JSON obligatoire :
{
  "goal": "string",
  "duration_weeks": number,
  "level": "beginner | intermediate | advanced",
  "summary": "string",
  "warnings": ["string"],
  "weeks": [
    {
      "week": number,
      "focus": "string",
      "sessions": [
        {
          "day": "monday | tuesday | wednesday | thursday | friday | saturday | sunday",
          "type": "rest | easy_run | interval | tempo | long_run | recovery | cross_training",
          "title": "string",
          "duration_min": number,
          "intensity": "low | moderate | high",
          "details": "string"
        }
      ]
    }
  ]
}

Contraintes de structure :
- "weeks" doit contenir exactement une entrée par semaine.
- "sessions" ne doit contenir que les jours disponibles.
- max 1 séance par jour.
- duration_min doit être réaliste.
- Une semaine peut être légère, mais jamais vide sauf contrainte forte.
`;

const PROMPTS_BY_GOAL = {
  "5k": `
${COMMON_RULES}

Objectif spécifique : préparer un 5 km.

Priorités :
- régularité
- endurance de base
- un peu de vitesse si pertinent
- séances simples et accessibles
`,

  "10k": `
${COMMON_RULES}

Objectif spécifique : préparer un 10 km.

Priorités :
- endurance
- allure régulière
- équilibre entre facile, qualitatif et récupération
`,

  "half_marathon": `
${COMMON_RULES}

Objectif spécifique : préparer un semi-marathon.

Priorités :
- endurance progressive
- sortie longue prudente
- récupération suffisante
`,

  "marathon": `
${COMMON_RULES}

Objectif spécifique : préparer un marathon.

Priorités :
- base d'endurance
- prudence forte
- si objectif irréaliste, plan plus sûr avec warning
`,

  "free_training": `
${COMMON_RULES}

Objectif spécifique : entraînement libre.

Priorités :
- régularité
- forme générale
- plan simple et durable
`,
};

function getTrainingPlanSystemPrompt(goal) {
  return PROMPTS_BY_GOAL[goal] || PROMPTS_BY_GOAL["10k"];
}

function buildTrainingPlanUserPrompt(payload) {
  const {
    level,
    goal,
    durationWeeks,
    availableDays,
    maxSessionsPerWeek,
    targetDate,
    constraints,
    userContext,
  } = payload;

  const safeConstraints =
    Array.isArray(constraints) && constraints.length > 0
      ? constraints.slice(0, 5).map((item) => `- ${item}`).join("\n")
      : "- aucune";

  const safeUserContext = Object.entries(userContext || {})
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");

  return `
Génère un plan d'entraînement avec les informations suivantes :

Niveau : ${level}
Objectif : ${goal}
Durée du plan : ${durationWeeks} semaines
Date objectif : ${targetDate || "non précisée"}
Jours disponibles : ${availableDays.join(", ")}
Nombre maximum de séances par semaine : ${maxSessionsPerWeek || "non précisé"}

Contraintes :
${safeConstraints}

Contexte utilisateur :
${safeUserContext || "- aucun"}

Exigences supplémentaires :
- respecte strictement les jours disponibles
- ne dépasse pas le maximum de séances par semaine
- sois concis
- retourne uniquement le JSON final
`;
}

module.exports = {
  ALLOWED_GOALS,
  ALLOWED_LEVELS,
  ALLOWED_DAYS,
  ALLOWED_TYPES,
  ALLOWED_INTENSITIES,
  getTrainingPlanSystemPrompt,
  buildTrainingPlanUserPrompt,
};