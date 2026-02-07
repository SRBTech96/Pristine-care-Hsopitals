import type { Metadata } from "next";
import React from "react";
import { HeroSection } from "@/components/HeroSection";
import { DoctorsTabContent } from "@/components/DoctorsTabContent";
import { DoctorListing } from "@/components/DoctorListing";
import { generateMetadata, pageMetadata } from "@/lib/seo";

/**
 * Server Component - Home Page
 * Configured for Incremental Static Regeneration (ISR)
 * Revalidates every 10 minutes (600 seconds)
 */

// Export metadata for home page
export const metadata: Metadata = generateMetadata(pageMetadata.home);

// Configure Page Segment Config for ISR
export const revalidate = 600; // ISR - revalidate every 10 minutes

// Generate static params early
export const dynamicParams = false;

// Tell Next.js this page is static
export const dynamic = "force-static";

/**
 * Home page component
 * This is still a server component that utilizes client components
 * for interactive sections while keeping static content server-side
 */
export default function Home() {
  return (
    <main className="w-full">
      {/* Hero Section - Server Component */}
      <HeroSection />

      {/* Why Our Doctors - Server Component */}
      <DoctorsTabContent />

      {/* Doctor Listing - Client Component with ISR support */}
      <DoctorListing
        title="Meet Our Medical Team"
        subtitle="Highly qualified specialists dedicated to providing excellent care"
      />
    </main>
  );
}
