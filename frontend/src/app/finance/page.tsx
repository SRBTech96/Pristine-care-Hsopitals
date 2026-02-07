import type { Metadata } from "next";
import { generateMetadata } from "@/lib/seo";
import { FinanceDashboard } from "@/components/finance/FinanceDashboard";

export const metadata: Metadata = generateMetadata({
  title: "Finance & Owner Dashboard - Pristine Hospital",
  description: "Financial reports for hospital owners and finance teams. Revenue, expenses, P&L and exports.",
});

export default function FinancePage() {
  return (
    <main className="w-full min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FinanceDashboard />
      </div>
    </main>
  );
}
