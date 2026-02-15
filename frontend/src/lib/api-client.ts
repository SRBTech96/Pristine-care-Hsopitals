import axios, { AxiosInstance } from "axios";
import { Doctor, ApiResponse } from "@/types";
import { apiCache } from "./api-cache";
import { CORE_API_BASE_URL } from "./api-config";

class ApiClient {
  private client: AxiosInstance;
  private cacheEnabled: boolean = true;
  private cacheTTL = {
    doctors: 10 * 60 * 1000, // 10 minutes for doctors list
    doctorById: 30 * 60 * 1000, // 30 minutes for individual doctor
    departments: 15 * 60 * 1000, // 15 minutes for departments
  };

  constructor() {
    this.client = axios.create({
      baseURL: CORE_API_BASE_URL,
      timeout: 8000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
        });
        throw error;
      }
    );
  }

  /**
   * Fetch all doctors from the backend with caching
   */
  async fetchDoctors(): Promise<Doctor[]> {
    const cacheKey = "doctors:all";

    if (this.cacheEnabled) {
      return apiCache.get(
        cacheKey,
        async () => {
          const response = await this.client.get<ApiResponse<Doctor[]>>("/doctors");
          return response.data.data || [];
        },
        this.cacheTTL.doctors
      );
    }

    try {
      const response = await this.client.get<ApiResponse<Doctor[]>>("/doctors");
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      throw error;
    }
  }

  /**
   * Fetch doctor by ID with longer cache
   */
  async fetchDoctorById(id: string): Promise<Doctor> {
    const cacheKey = `doctor:${id}`;

    if (this.cacheEnabled) {
      return apiCache.get(
        cacheKey,
        async () => {
          const response = await this.client.get<ApiResponse<Doctor>>(`/doctors/${id}`);
          return response.data.data;
        },
        this.cacheTTL.doctorById
      );
    }

    try {
      const response = await this.client.get<ApiResponse<Doctor>>(`/doctors/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch doctor ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetch doctors by specialization with caching
   */
  async fetchDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
    const cacheKey = `doctors:specialization:${specialization.toLowerCase()}`;

    if (this.cacheEnabled) {
      return apiCache.get(
        cacheKey,
        async () => {
          const response = await this.client.get<ApiResponse<Doctor[]>>("/doctors", {
            params: { specialization },
          });
          return response.data.data || [];
        },
        this.cacheTTL.doctors
      );
    }

    try {
      const response = await this.client.get<ApiResponse<Doctor[]>>("/doctors", {
        params: { specialization },
      });
      return response.data.data || [];
    } catch (error) {
      console.error(
        `Failed to fetch doctors by specialization ${specialization}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get unique departments/specializations with caching
   */
  async fetchDepartments(): Promise<string[]> {
    const cacheKey = "departments:all";

    if (this.cacheEnabled) {
      return apiCache.get(
        cacheKey,
        async () => {
          const doctors = await this.fetchDoctors();
          const specializations = new Set(doctors.map((doc) => doc.specialization));
          return Array.from(specializations).sort();
        },
        this.cacheTTL.departments
      );
    }

    try {
      const doctors = await this.fetchDoctors();
      const specializations = new Set(doctors.map((doc) => doc.specialization));
      return Array.from(specializations).sort();
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      throw error;
    }
  }

  /**
   * Invalidate doctor cache (when data is updated)
   */
  invalidateDoctorsCache(): void {
    apiCache.invalidatePattern("^doctor(s)?:");
  }

  /**
   * Disable caching (useful for testing or specific scenarios)
   */
  disableCache(): void {
    this.cacheEnabled = false;
  }

  /**
   * Enable caching
   */
  enableCache(): void {
    this.cacheEnabled = true;
  }

  /**
   * Manually set cache TTL
   */
  setCacheTTL(type: keyof typeof this.cacheTTL, ttl: number): void {
    this.cacheTTL[type] = ttl;
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    apiCache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return apiCache.getStats();
  }

  /**
   * Health check for backend
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get("/health", {
        timeout: 2000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Singleton instance
const apiClient = new ApiClient();

export default apiClient;
