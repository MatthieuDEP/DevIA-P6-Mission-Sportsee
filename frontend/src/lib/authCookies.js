import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE, USER_ID_COOKIE } from "./authConstants";

export function getAuthToken() {
  return cookies().get(AUTH_TOKEN_COOKIE)?.value || null;
}

export function getUserId() {
  return cookies().get(USER_ID_COOKIE)?.value || null;
}