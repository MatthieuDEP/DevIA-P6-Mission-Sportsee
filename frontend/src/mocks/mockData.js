const DB = {
  users: [
    {
      id: "user123",
      username: "sophiemartin",
      password: "password123",
      profile: {
        firstName: "Sophie",
        lastName: "Martin",
        gender: "Femme",
        age: 32,
        weight: 60,
        height: 165,
        profilePicture: "http://localhost:8000/images/sophie.jpg",
        createdAt: "2025-01-01",
      },
      activity: [
        { date: "2025-01-04", distance: 5.8, duration: 38, bpm: 163, calories: 422 },
        { date: "2025-01-05", distance: 3.2, duration: 20, bpm: 171, calories: 248 },
        { date: "2025-01-09", distance: 6.4, duration: 42, bpm: 163, calories: 468 },
        { date: "2025-01-12", distance: 7.5, duration: 50, bpm: 162, calories: 532 },
        { date: "2025-01-19", distance: 5.1, duration: 34, bpm: 165, calories: 378 },
        { date: "2025-01-25", distance: 4.8, duration: 32, bpm: 166, calories: 352 },
        { date: "2025-01-26", distance: 3.5, duration: 22, bpm: 170, calories: 265 },
      ],
    },
  ],
};

// Auth
const tokenFor = (userId) => `mock-${userId}`;
const userIdFromToken = (token) => (token || "").replace("mock-", "");

// /api/login
export function apiLogin({ username, password }) {
  const user = DB.users.find((u) => u.username === username && u.password === password);
  if (!user) throw new Error("Invalid credentials");
  return { token: tokenFor(user.id), userId: user.id };
}

// /api/user-info
export function apiGetUserInfo(token) {
  const user = DB.users.find((u) => u.id === userIdFromToken(token));
  if (!user) throw new Error("Unauthorized");

  const totalDistance = user.activity.reduce((sum, s) => sum + s.distance, 0).toFixed(1);
  const totalSessions = user.activity.length;
  const totalDuration = user.activity.reduce((sum, s) => sum + s.duration, 0);

  return {
    profile: user.profile,
    statistics: { totalDistance, totalSessions, totalDuration },
  };
}

// /api/user-activity?startWeek&endWeek
export function apiGetUserActivity(token, { startWeek, endWeek }) {
  const user = DB.users.find((u) => u.id === userIdFromToken(token));
  if (!user) throw new Error("Unauthorized");

  const start = new Date(startWeek);
  const end = new Date(endWeek);

  return user.activity.filter((s) => {
    const d = new Date(s.date);
    return d >= start && d <= end;
  });
}
