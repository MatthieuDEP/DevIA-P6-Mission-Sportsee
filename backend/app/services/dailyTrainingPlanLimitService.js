const DAILY_LIMIT = 3;

const generationStore = new Map();

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildStoreKey(userId) {
  return `${userId}:${getTodayKey()}`;
}

function cleanupOldEntries() {
  const today = getTodayKey();

  for (const key of generationStore.keys()) {
    if (!key.endsWith(`:${today}`) && !key.includes(`:${today}`)) {
      const [, dateKey] = key.split(":");
      if (dateKey !== today) {
        generationStore.delete(key);
      }
    }
  }
}

function getGenerationUsage(userId) {
  cleanupOldEntries();

  const key = buildStoreKey(userId);
  const currentCount = generationStore.get(key) || 0;

  return {
    count: currentCount,
    remaining: Math.max(0, DAILY_LIMIT - currentCount),
    limit: DAILY_LIMIT,
  };
}

function canGenerateTrainingPlan(userId) {
  const usage = getGenerationUsage(userId);

  return {
    allowed: usage.count < DAILY_LIMIT,
    ...usage,
  };
}

function incrementGenerationCount(userId) {
  cleanupOldEntries();

  const key = buildStoreKey(userId);
  const currentCount = generationStore.get(key) || 0;
  const nextCount = currentCount + 1;

  generationStore.set(key, nextCount);

  return {
    count: nextCount,
    remaining: Math.max(0, DAILY_LIMIT - nextCount),
    limit: DAILY_LIMIT,
  };
}

module.exports = {
  DAILY_LIMIT,
  getGenerationUsage,
  canGenerateTrainingPlan,
  incrementGenerationCount,
};