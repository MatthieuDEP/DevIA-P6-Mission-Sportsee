export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  COACH_AI: "/coach-ai",
  PROFILE: "/profile",
};

export const PROTECTED_PATH_PREFIXES = [
  ROUTES.DASHBOARD,
  ROUTES.COACH_AI,
  ROUTES.PROFILE,
];

export function isProtectedPath(pathname) {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}