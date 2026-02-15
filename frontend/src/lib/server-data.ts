/**
 * Server-side data fetching utility for Next.js App Router
 * Used for static generation (SSG) and incremental static regeneration (ISR)
 */

import { Doctor, ApiResponse } from "@/types";
import { CORE_API_BASE_URL } from "./api-config";

/**
 * Fetch data on the server with error handling
 * Won't block page rendering if fetch fails
 */
async function fetchFromBackend<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(`${CORE_API_BASE_URL}${endpoint}`, {
      ...options,
      // These headers are important for server-side fetching
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      // Revalidate ISR cached data
      next: {
        revalidate: 600, // 10 minutes
      },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

/**
 * Fetch all doctors on server (for SSG/ISR pages)
 */
export async function getServerDoctors(): Promise<Doctor[]> {
  const response = await fetchFromBackend<ApiResponse<Doctor[]>>("/doctors");
  return response?.data || [];
}

/**
 * Fetch doctor by ID on server
 */
export async function getServerDoctorById(id: string): Promise<Doctor | null> {
  const response = await fetchFromBackend<ApiResponse<Doctor>>(`/doctors/${id}`);
  return response?.data || null;
}

/**
 * Fetch doctors by specialization on server
 */
export async function getServerDoctorsBySpecialization(
  specialization: string
): Promise<Doctor[]> {
  const response = await fetchFromBackend<ApiResponse<Doctor[]>>("/doctors", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const allDoctors = response?.data || [];
  return allDoctors.filter((doc) => doc.specialization === specialization);
}

/**
 * Get unique departments on server
 */
export async function getServerDepartments(): Promise<string[]> {
  const doctors = await getServerDoctors();
  const specializations = new Set(doctors.map((doc) => doc.specialization));
  return Array.from(specializations).sort();
}

/**
 * Revalidate ISR cache for doctors
 * Call this when you update doctor data
 */
export async function revalidateDoctorsCache() {
  // This is a placeholder for revalidatePath from Next.js
  // It should be called in route handlers or server actions
  // to invalidate cached pages
}
