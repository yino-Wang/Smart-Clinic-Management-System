import { http } from "./http";

export async function login(username: string, password: string) {
  const res = await http.post("/api/auth/login", { username, password });
  return res.data as { accessToken: string; role: string };
}
