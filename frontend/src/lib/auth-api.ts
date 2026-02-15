import axios from "axios";
import { CORE_API_BASE_URL } from "./api-config";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

class AuthApi {
  private client = axios.create({
    baseURL: CORE_API_BASE_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });

  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await this.client.post<LoginResponse>("/auth/login", { email, password });
    return res.data;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.client.post("/auth/logout", { refreshToken });
  }

  async getProfile(token: string): Promise<AuthProfile> {
    const res = await this.client.get<AuthProfile>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }
}

export const authApi = new AuthApi();
