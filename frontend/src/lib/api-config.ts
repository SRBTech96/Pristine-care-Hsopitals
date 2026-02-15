// Centralized API base URL configuration for frontend
// Ensures consistent alignment with NestJS global prefix `/api`

const ORIGIN_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Core backend API (matches Nest global prefix in backend/src/main.ts)
export const CORE_API_BASE_URL = `${ORIGIN_BASE_URL}/api`;
