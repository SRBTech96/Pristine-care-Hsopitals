import type { Metadata } from "next";
import { generateMetadata, pageMetadata } from "@/lib/seo";
import { DoctorListing } from "@/components/DoctorListing";

/**
 * Doctors Page - Server Component with ISR
 * Shows all doctors with department grouping
 * Revalidates every 15 minutes
 */

export const metadata: Metadata = generateMetadata(pageMetadata.doctors);

// Incremental Static Regeneration
export const revalidate = 900; // 15 minutes

export const dynamic = "force-static";

export default function DoctorsPage() {
  return (
    <main className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50">
      <DoctorListing
        title="Find Our Specialists"
        subtitle="Browse our comprehensive team of medical professionals by department"
      />
    </main>
  );
}
