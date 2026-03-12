// backend/app/services/mistralClient.js

const TRAINING_PLAN_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    goal: {
      type: "string",
      enum: ["5k", "10k", "half_marathon", "marathon", "free_training"],
    },
    duration_weeks: {
      type: "number",
    },
    level: {
      type: "string",
      enum: ["beginner", "intermediate", "advanced"],
    },
    summary: {
      type: "string",
    },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
    weeks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          week: { type: "number" },
          focus: { type: "string" },
          sessions: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                day: {
                  type: "string",
                  enum: [
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ],
                },
                type: {
                  type: "string",
                  enum: [
                    "rest",
                    "easy_run",
                    "interval",
                    "tempo",
                    "long_run",
                    "recovery",
                    "cross_training",
                  ],
                },
                title: { type: "string" },
                duration_min: { type: "number" },
                intensity: {
                  type: "string",
                  enum: ["low", "moderate", "high"],
                },
                details: { type: "string" },
              },
              required: [
                "day",
                "type",
                "title",
                "duration_min",
                "intensity",
                "details",
              ],
            },
          },
        },
        required: ["week", "focus", "sessions"],
      },
    },
  },
  required: [
    "goal",
    "duration_weeks",
    "level",
    "summary",
    "warnings",
    "weeks",
  ],
};

async function callMistralChat({ systemPrompt, userPrompt }) {
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error("Missing MISTRAL_API_KEY");
  }

  const model = process.env.MISTRAL_MODEL || "mistral-small-latest";

  const payload = {
    model,
    temperature: 0.1,
    max_tokens: 2600,
    random_seed: 42,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "training_plan",
        schema: TRAINING_PLAN_JSON_SCHEMA,
      },
    },
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  };

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mistral API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  const finishReason = data?.choices?.[0]?.finish_reason || "unknown";
  const content = data?.choices?.[0]?.message?.content;

  console.log("Mistral finish_reason:", finishReason);
  console.log("Mistral usage:", data?.usage || {});
  console.log("Mistral content type:", typeof content);

  if (finishReason === "length") {
    throw new Error("Mistral response was truncated by max_tokens");
  }

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const merged = content
      .map((chunk) => {
        if (typeof chunk === "string") return chunk;
        if (chunk && typeof chunk.text === "string") return chunk.text;
        return "";
      })
      .join("")
      .trim();

    if (merged) {
      return merged;
    }
  }

  throw new Error("Unexpected Mistral response format");
}

module.exports = {
  callMistralChat,
  TRAINING_PLAN_JSON_SCHEMA,
};