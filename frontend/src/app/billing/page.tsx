import type { Metadata } from "next";
import { generateMetadata, pageMetadata } from "@/lib/seo";
import { AlertCircle } from "lucide-react";
import { BillingCounter } from "@/components/billing/BillingCounter";

/**
 * Billing Counter Page
 * For ADMIN, FINANCE, and CASHIER roles
 * Fast invoice creation and payment capture
 */

export const metadata: Metadata = generateMetadata({
  title: "Billing Counter - Pristine Hospital",
  description:
    "Fast invoice creation and payment capture for hospital cashier and finance staff. Create invoices, add line items, capture payments, and print invoices.",
  keywords: [
    "billing",
    "invoices",
    "payments",
    "cashier",
    "finance",
    "hospital billing",
  ],
  canonicalUrl: "/billing",
});

export const revalidate = 3600; // 1 hour

// In a real app, you would check user role from session/auth
// For now, this page is available but components handle the access control
const ALLOWED_ROLES = ["ADMIN", "FINANCE", "CASHIER"];

function UnauthorizedAccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Access Denied
        </h1>
        <p className="text-gray-600 text-center mb-6">
          You do not have permission to access the billing counter. This feature is
          restricted to Finance, Cashier, and Admin users.
        </p>
        <a
          href="/"
          className="block text-center bg-pristine-600 hover:bg-pristine-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

export default function BillingCounterPage({
  searchParams,
}: {
  searchParams: { invoice?: string };
}) {
  // In production, verify user role from session
  // For now, show the billing counter
  // const userRole = await getUserRole(); // From session/auth
  // if (!ALLOWED_ROLES.includes(userRole)) {
  //   return <UnauthorizedAccess />;
  // }

  const invoiceId = searchParams.invoice;

  return (
    <main className="w-full min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Security note - visible in development only */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg text-sm">
            <p className="font-semibold">Development Mode:</p>
            <p>
              In production, this page should verify user role (ADMIN, FINANCE, or
              CASHIER) from the authentication session.
            </p>
          </div>
        )}

        <BillingCounter initialInvoiceId={invoiceId} />
      </div>
    </main>
  );
}
