import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { generateMetadata, pageMetadata, generateOrganizationSchema } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = generateMetadata(pageMetadata.home);

// Add schema as component to avoid serialization issues
function SchemaScript() {
  const schema = generateOrganizationSchema();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        
        {/* Prefetch backend API */}
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}
        />

        {/* Import Google Fonts with display=swap for better CLS */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
        />

        {/* Theme color for address bar */}
        <meta name="theme-color" content="#0ea5e9" />

        {/* Add structured data for organization */}
        <SchemaScript />

        {/* Performance optimization: disable prefetch for external links by default */}
        <meta name="prefetch" content="false" />
      </head>
      <body className="overflow-x-hidden">
        {/* SkipLink for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 bg-pristine-600 text-white p-2"
        >
          Skip to main content
        </a>

        <Header />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer />

        {/* Performance monitoring script - only in production */}
        {process.env.NODE_ENV === "production" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
