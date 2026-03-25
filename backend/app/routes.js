const express = require("express");
const jwt = require("jsonwebtoken");

const users = require("./data.json");
const { authenticateToken, generateToken } = require("./middleware");
const { generateTrainingPlan } = require("./services/trainingPlanService");
const { generateTrainingPlanIcs } = require("./services/icsService");
const {
  canGenerateTrainingPlan,
  incrementGenerationCount,
  getGenerationUsage,
} = require("./services/dailyTrainingPlanLimitService");

const SECRET_KEY = "your-secret-key-12345"; // In a real app, this would be in environment variables

const getUserById = (userId) => {
  return users.find((user) => user.id === userId);
};

const router = express.Router();

/**
 * POST /api/login ✅
 * Returns a token for the user
 */
router.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }

  const user = users.find((u) => u.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user.id);
  return res.json({
    token,
    userId: user.id,
  });
});

/** ✅
 * GET /api/user-info
 * Returns user information including profile, goals, and statistics
 */
router.get("/api/user-info", authenticateToken, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, SECRET_KEY);
  const user = getUserById(decodedToken.userId);
  const runningData = user.runningData;

  // Calculate overall statistics
  const totalDistance = runningData.reduce(
    (sum, session) => sum + session.distance,
    0
  ).toFixed(1);
  const totalSessions = runningData.length;
  const totalDuration = runningData.reduce(
    (sum, session) => sum + session.duration,
    0
  );

  // Extract user profile information
  const userProfile = {
    firstName: user.userInfos.firstName,
    lastName: user.userInfos.lastName,
    createdAt: user.userInfos.createdAt,
    age: user.userInfos.age,
    weight: user.userInfos.weight,
    height: user.userInfos.height,
    profilePicture: user.userInfos.profilePicture,
  };

  return res.json({
    profile: userProfile,
    statistics: {
      totalDistance,
      totalSessions,
      totalDuration,
    },
  });
});

/**
 * GET /api/user-activity
 * Returns running sessions between startWeek and endWeek
 */
router.get("/api/user-activity", authenticateToken, (req, res) => {
  const { startWeek, endWeek } = req.query;
  
  if (!startWeek || !endWeek) {
    return res.status(400).json({ message: "startWeek and endWeek are required" });
  }

  const user = getUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const runningData = user.runningData;

  // Convert week strings to Date objects
  const startDate = new Date(startWeek);
  const endDate = new Date(endWeek);
  const now = new Date();
  
  // Filter sessions between startWeek and endWeek, excluding future dates
  const filteredSessions = runningData.filter((session) => {
    const sessionDate = new Date(session.date);
    return sessionDate >= startDate && sessionDate <= endDate && sessionDate <= now;
  });

  // Sort by date ascending
  const sortedSessions = filteredSessions.sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  return res.json(sortedSessions);
});

router.post("/api/training-plan/generate", authenticateToken, async (req, res) => {
  try {
    const user = getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const limitCheck = canGenerateTrainingPlan(req.user.userId);

    if (!limitCheck.allowed) {
      return res.status(429).json({
        ok: false,
        message: "Vous avez atteint la limite de 3 générations de planning pour aujourd’hui.",
        limit: limitCheck.limit,
        used: limitCheck.count,
        remaining: limitCheck.remaining,
      });
    }

    const payload = {
      ...req.body,
      age: user.userInfos?.age || req.body.age,
    };

    const result = await generateTrainingPlan(payload);
    const usage = incrementGenerationCount(req.user.userId);

    return res.status(200).json({
      ...result,
      dailyLimit: {
        limit: usage.limit,
        used: usage.count,
        remaining: usage.remaining,
      },
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message || "Unable to generate training plan",
    });
  }
});

router.post("/api/training-plan/download-ics", authenticateToken, async (req, res) => {
  try {
    const { plan, startDate, preferredTime } = req.body;

    if (!plan) {
      return res.status(400).json({ message: "plan is required" });
    }

    if (!startDate) {
      return res.status(400).json({ message: "startDate is required" });
    }

    const { filename, content } = generateTrainingPlanIcs({
      plan,
      startDate,
      preferredTime,
    });

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(content);
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Unable to generate ICS file",
    });
  }
});

router.get("/api/training-plan/generation-limit", authenticateToken, (req, res) => {
  const usage = getGenerationUsage(req.user.userId);

  return res.status(200).json({
    limit: usage.limit,
    used: usage.count,
    remaining: usage.remaining,
  });
});

module.exports = router;
