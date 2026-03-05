import axios from "axios";

export const api = axios.create({
  baseURL: "",
});


// request: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// response: auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/"; // back to login page
    }
    return Promise.reject(err);
  }
);