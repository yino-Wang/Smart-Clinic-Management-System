import { api } from "./axios";

export type PortalType = "Admin" | "User";

export interface LoginResponse {
  accessToken: string;
  role: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  portal: PortalType;
  adminCode?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function login(username: string, password: string) {
  const res = await api.post<LoginResponse>("/api/auth/login", { username, password });
  return res.data;
}

export async function register(payload: RegisterPayload) {
  const res = await api.post("/api/auth/register", payload);
  return res.data as { id: number; username: string; role: string };
}

export async function changePassword(payload: ChangePasswordPayload) {
  return api.post("/api/auth/change-password", payload);
}

export async function logoutSession() {
  return api.post("/api/auth/logout", {});
}
