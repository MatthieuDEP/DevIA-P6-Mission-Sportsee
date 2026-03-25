function pad(value) {
  return String(value).padStart(2, "0");
}

function escapeIcsText(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function slugify(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatUtcDate(date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function getMondayBasedIndex(day) {
  const map = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };

  return map[day];
}

function truncateDescription(text, maxLength = 220) {
  const clean = String(text || "").trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength - 1).trimEnd() + "…";
}

function getStartOfWeekMonday(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);

  const jsDay = copy.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  copy.setDate(copy.getDate() + mondayOffset);

  return copy;
}

function buildSessionDate({ startDate, weekNumber, day }) {
  const monday = getStartOfWeekMonday(startDate);
  const dayIndex = getMondayBasedIndex(day);

  if (dayIndex === undefined) {
    throw new Error(`Invalid day "${day}"`);
  }

  const sessionDate = new Date(monday);
  sessionDate.setDate(monday.getDate() + (weekNumber - 1) * 7 + dayIndex);

  return sessionDate;
}

function buildSessionDateTime({ sessionDate, preferredTime = "18:00", durationMin = 45 }) {
  const [hoursRaw, minutesRaw] = String(preferredTime || "18:00").split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  const start = new Date(sessionDate);
  start.setHours(Number.isFinite(hours) ? hours : 18, Number.isFinite(minutes) ? minutes : 0, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + Number(durationMin || 45));

  return { start, end };
}

function buildEventDescription(session) {
  const parts = [
    session.details ? truncateDescription(session.details, 180) : "",
    session.intensity ? `Intensité : ${session.intensity}` : "",
    session.type ? `Type : ${session.type}` : "",
    session.duration_min ? `Durée : ${session.duration_min} min` : "",
  ].filter(Boolean);

  return parts.join(" | ");
}

function buildEventTitle(session) {
  return session.title || "Séance SportSee";
}

function generateUid({ planSlug, weekNumber, day, generatedAt }) {
  return `${planSlug}-w${weekNumber}-${day}-${generatedAt}@sportsee.local`;
}

function foldIcsLine(line) {
  const maxLength = 75;

  if (line.length <= maxLength) return line;

  let result = "";
  let remaining = line;

  while (remaining.length > maxLength) {
    result += remaining.slice(0, maxLength) + "\r\n ";
    remaining = remaining.slice(maxLength);
  }

  return result + remaining;
}

function createIcsEvent({
  uid,
  dtStamp,
  start,
  end,
  title,
  description,
}) {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${formatUtcDate(start)}`,
    `DTEND:${formatUtcDate(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Rappel séance SportSee",
    "TRIGGER:-PT30M",
    "END:VALARM",
    "END:VEVENT",
  ];

  return lines.map(foldIcsLine).join("\r\n");
}

function generateTrainingPlanIcs({
  plan,
  startDate,
  preferredTime = "18:00",
}) {
  if (!plan || !Array.isArray(plan.weeks)) {
    throw new Error("Invalid plan");
  }

  if (!startDate) {
    throw new Error("startDate is required to generate ICS");
  }

  const planStartDate = new Date(startDate);

  if (Number.isNaN(planStartDate.getTime())) {
    throw new Error("Invalid startDate");
  }

  const generatedAt = formatUtcDate(new Date());
  const planSlug = slugify(plan.goal || "training-plan");
  const calendarName = `SportSee - ${plan.goal || "training plan"}`;

  const events = [];

  for (const week of plan.weeks) {
    for (const session of week.sessions || []) {
      const sessionDate = buildSessionDate({
        startDate: planStartDate,
        weekNumber: week.week,
        day: session.day,
      });

      const { start, end } = buildSessionDateTime({
        sessionDate,
        preferredTime,
        durationMin: session.duration_min,
      });

      events.push(
        createIcsEvent({
          uid: generateUid({
            planSlug,
            weekNumber: week.week,
            day: session.day,
            generatedAt,
          }),
          dtStamp: generatedAt,
          start,
          end,
          title: buildEventTitle(session),
          description: buildEventDescription(session),
        })
      );
    }
  }

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SportSee//Training Plan//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    ...events,
    "END:VCALENDAR",
  ];

  const icsContent = icsLines.join("\r\n") + "\r\n";

  const filename = `sportsee-training-plan-${planSlug}-${Date.now()}.ics`;

  return {
    filename,
    content: icsContent,
  };
}

module.exports = {
  generateTrainingPlanIcs,
};