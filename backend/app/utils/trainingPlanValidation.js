// backend/app/utils/trainingPlanValidation.js

const {
  ALLOWED_GOALS,
  ALLOWED_LEVELS,
  ALLOWED_DAYS,
  ALLOWED_TYPES,
  ALLOWED_INTENSITIES,
} = require("../services/trainingPlanPrompts");

function normalizeDay(day) {
  return String(day || "").trim().toLowerCase();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function calculateDurationWeeks({ targetDate, requestedDurationWeeks }) {
  const minWeeks = 4;
  const maxWeeks = 8;

  if (targetDate) {
    const now = new Date();
    const target = new Date(targetDate);

    if (!Number.isNaN(target.getTime()) && target > now) {
      const diffMs = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const weeks = Math.ceil(diffDays / 7);
      return clamp(weeks, minWeeks, maxWeeks);
    }
  }

  const requested = Number(requestedDurationWeeks || 6);
  return clamp(requested, minWeeks, maxWeeks);
}

function extractFirstJson(raw) {
  if (typeof raw !== "string") {
    throw new Error("AI response is not a string");
  }

  const cleaned = raw.replace(/```json|```/gi, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in AI response");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

function parseJsonResponse(raw) {
  const jsonString = extractFirstJson(raw);
  return JSON.parse(jsonString);
}

function validateTrainingPlan(plan, options = {}) {
  const errors = [];
  const availableDays = (options.availableDays || []).map(normalizeDay);
  const maxSessionsPerWeek = options.maxSessionsPerWeek
    ? Number(options.maxSessionsPerWeek)
    : null;

  if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
    return { valid: false, errors: ["Plan root must be an object"] };
  }

  if (!ALLOWED_GOALS.includes(plan.goal)) {
    errors.push("Invalid goal");
  }

  if (!ALLOWED_LEVELS.includes(plan.level)) {
    errors.push("Invalid level");
  }

  if (typeof plan.duration_weeks !== "number" || plan.duration_weeks < 1) {
    errors.push("Invalid duration_weeks");
  }

  if (typeof plan.summary !== "string") {
    errors.push("Invalid summary");
  }

  if (!Array.isArray(plan.warnings)) {
    errors.push("warnings must be an array");
  } else if (plan.warnings.length > 2) {
    errors.push("warnings must not contain more than 2 items");
  }

  if (!Array.isArray(plan.weeks)) {
    errors.push("weeks must be an array");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  if (plan.weeks.length !== plan.duration_weeks) {
    errors.push("weeks length must match duration_weeks");
  }

  plan.weeks.forEach((weekObj, weekIndex) => {
    if (!weekObj || typeof weekObj !== "object") {
      errors.push(`week ${weekIndex + 1}: invalid object`);
      return;
    }

    if (weekObj.week !== weekIndex + 1) {
      errors.push(`week ${weekIndex + 1}: week number mismatch`);
    }

    if (typeof weekObj.focus !== "string" || weekObj.focus.length > 40) {
      errors.push(`week ${weekIndex + 1}: invalid focus`);
    }

    if (!Array.isArray(weekObj.sessions)) {
      errors.push(`week ${weekIndex + 1}: sessions must be an array`);
      return;
    }

    if (
      maxSessionsPerWeek &&
      weekObj.sessions.length > Number(maxSessionsPerWeek)
    ) {
      errors.push(`week ${weekIndex + 1}: too many sessions`);
    }

    const usedDays = new Set();
    let highIntensityCount = 0;

    weekObj.sessions.forEach((session, sessionIndex) => {
      const label = `week ${weekIndex + 1}, session ${sessionIndex + 1}`;

      if (!session || typeof session !== "object") {
        errors.push(`${label}: invalid object`);
        return;
      }

      const day = normalizeDay(session.day);

      if (!ALLOWED_DAYS.includes(day)) {
        errors.push(`${label}: invalid day`);
      }

      if (availableDays.length > 0 && !availableDays.includes(day)) {
        errors.push(`${label}: day not allowed by availability`);
      }

      if (usedDays.has(day)) {
        errors.push(`${label}: duplicate day in same week`);
      }
      usedDays.add(day);

      if (!ALLOWED_TYPES.includes(session.type)) {
        errors.push(`${label}: invalid type`);
      }

      if (typeof session.title !== "string" || session.title.length > 60) {
        errors.push(`${label}: invalid title`);
      }

      if (
        typeof session.duration_min !== "number" ||
        session.duration_min < 0 ||
        session.duration_min > 240
      ) {
        errors.push(`${label}: invalid duration_min`);
      }

      if (!ALLOWED_INTENSITIES.includes(session.intensity)) {
        errors.push(`${label}: invalid intensity`);
      }

      if (session.intensity === "high") {
        highIntensityCount += 1;
      }

      if (typeof session.details !== "string" || session.details.length > 220) {
        errors.push(`${label}: invalid details`);
      }
    });

    if (plan.level === "beginner" && highIntensityCount > 1) {
      errors.push(
        `week ${weekIndex + 1}: too many high intensity sessions for beginner`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  normalizeDay,
  calculateDurationWeeks,
  parseJsonResponse,
  validateTrainingPlan,
};