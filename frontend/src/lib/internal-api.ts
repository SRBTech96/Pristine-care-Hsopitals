import axios from "axios";
import { CORE_API_BASE_URL } from "./api-config";

export const internalClient = axios.create({
  baseURL: CORE_API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

internalClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
