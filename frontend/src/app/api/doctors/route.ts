/**
 * API Route Handler for Doctor Data
 * Acts as a proxy with caching layer to reduce backend load
 * Enables ISR and static generation for optimized performance
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Cache configuration
const CACHE_DURATION = 10 * 60; // 10 minutes in seconds
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * Get cached data or fetch fresh
 */
async function getCachedOrFetch(
  url: string,
  options?: RequestInit
): Promise<any> {
  const cachedData = cache.get(url);
  const now = Date.now();

  // Return cached data if still valid
  if (
    cachedData &&
    now - cachedData.timestamp < CACHE_DURATION * 1000
  ) {
    return cachedData.data;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    cache.set(url, {
      data,
      timestamp: now,
    });

    return data;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    
    // Return stale cache if available
    if (cachedData) {
      console.log("Returning stale cache due to fetch failure");
      return cachedData.data;
    }

    throw error;
  }
}

/**
 * GET /api/doctors - Fetch all doctors with caching
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const specialization = searchParams.get("specialization");

    // Build URL and cache key
    let url = `${API_BASE_URL}/doctors`;
    let cacheKey = "doctors:all";

    if (specialization) {
      url += `?specialization=${encodeURIComponent(specialization)}`;
      cacheKey = `doctors:${specialization}`;
    }

    // Fetch with caching
    const data = await getCachedOrFetch(url);

    // Return response with cache headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache for 10 minutes in browser, keep stale for 1 hour
        "Cache-Control":
          "public, s-maxage=600, stale-while-revalidate=3600",
        // Enable compression
        "Content-Encoding": "gzip",
      },
    });
  } catch (error) {
    console.error("Failed to fetch doctors:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch doctors",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Clear cache endpoint (admin only)
 */
export async function DELETE(request: NextRequest) {
  // In production, verify authentication here
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    cache.clear();

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}

/**
 * Get cache stats endpoint (for debugging)
 */
export async function POST(request: NextRequest) {
  const { action } = await request.json().catch(() => ({}));

  if (action === "stats") {
    let totalSize = 0;
    for (const { data } of cache.values()) {
      totalSize += JSON.stringify(data).length;
    }

    return NextResponse.json({
      cacheSize: cache.size,
      estimatedMemory: `${(totalSize / 1024).toFixed(2)} KB`,
      entries: Array.from(cache.keys()),
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
