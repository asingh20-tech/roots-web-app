// Session authentication (backend: accounts/views.py, roots/urls.py).
import { ApiError, BACKEND_ORIGIN, apiRequest } from "./api";

export type CurrentUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

// allauth's Google login. With SOCIALACCOUNT_LOGIN_ON_GET it goes straight to
// Google, then LOGIN_REDIRECT_URL (/accounts/popup-complete/) posts
// { type: "GOOGLE_LOGIN_SUCCESS" } back to window.opener.
export const GOOGLE_LOGIN_URL = `${BACKEND_ORIGIN}/accounts/google/login/`;
export const GOOGLE_LOGIN_SUCCESS = "GOOGLE_LOGIN_SUCCESS";

// GET /api/me/: 200 = signed in, 403 = no session.
export const fetchCurrentUser = async (): Promise<CurrentUser | null> => {
  try {
    return await apiRequest<CurrentUser>("/api/me/");
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthenticated) return null;
    throw error;
  }
};

export const logout = (): Promise<void> =>
  apiRequest<void>("/api/logout/", { method: "POST" });
