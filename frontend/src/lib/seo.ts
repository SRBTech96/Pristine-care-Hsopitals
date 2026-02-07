/**
 * SEO and metadata utilities
 * Provides consistent metadata structure across pages
 */

import { Metadata } from "next";

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  author?: string;
  canonicalUrl?: string;
}

/**
 * Generate Next.js Metadata object with Open Graph tags
 */
export function generateMetadata(meta: PageMetadata, baseUrl: string = "https://pristinehospital.com"): Metadata {
  const fullUrl = `${baseUrl}${meta.canonicalUrl || "/"}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords?.join(", "),
    authors:
      meta.author || "Pristine Hospital & Research Centre Pvt Ltd",
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      url: fullUrl,
      title: meta.title,
      description: meta.description,
      siteName: "Pristine Hospital",
      images: [
        {
          url: meta.image || `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: meta.title,
          type: "image/png",
        },
        {
          url: meta.image || `${baseUrl}/og-image-square.png`,
          width: 400,
          height: 400,
          alt: meta.title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [meta.image || `${baseUrl}/og-image.png`],
      creator: "@pristinehospital",
    },
    alternates: {
      canonical: fullUrl,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
    },
  };
}

/**
 * Standard page metadata definitions
 */
export const pageMetadata = {
  home: {
    title: "Pristine Hospital - Excellence in Healthcare",
    description:
      "Experience world-class healthcare with our team of expert physicians and specialists. Comprehensive medical services, state-of-the-art facilities, and patient-centric care.",
    keywords: [
      "hospital",
      "doctors",
      "healthcare",
      "medical",
      "consultation",
      "specialization",
      "patient care",
      "pristine hospital",
    ],
    canonicalUrl: "/",
  },
  doctors: {
    title: "Meet Our Doctors - Pristine Hospital",
    description:
      "Explore our team of experienced physicians and specialists. Find doctors by department, specialization, and expertise at Pristine Hospital.",
    keywords: [
      "doctors",
      "physicians",
      "specialists",
      "medical team",
      "healthcare professionals",
      "consultants",
    ],
    canonicalUrl: "/doctors",
  },
  services: {
    title: "Healthcare Services - Pristine Hospital",
    description:
      "Comprehensive healthcare services including emergency care, diagnostics, surgery, and specialized treatment. Learn about our medical facilities and departments.",
    keywords: [
      "healthcare services",
      "medical services",
      "hospital services",
      "emergency care",
      "surgery",
      "diagnostics",
    ],
    canonicalUrl: "/services",
  },
  about: {
    title: "About Pristine Hospital - Healthcare Excellence",
    description:
      "Learn about Pristine Hospital & Research Centre - our mission, vision, values, and commitment to providing exceptional healthcare. Established with a focus on patient care and medical excellence.",
    keywords: [
      "about hospital",
      "hospital mission",
      "healthcare excellence",
      "patient care",
      "medical research",
    ],
    canonicalUrl: "/about",
  },
  contact: {
    title: "Contact Pristine Hospital - Get In Touch",
    description:
      "Contact Pristine Hospital for appointments, inquiries, and emergency services. Find our location, phone number, email, and business hours.",
    keywords: ["contact", "appointment", "phone", "location", "emergency"],
    canonicalUrl: "/contact",
  },
};

/**
 * Generate structured data (JSON-LD) for search engines
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": "https://pristinehospital.com",
    name: "Pristine Hospital & Research Centre",
    description: "Leading healthcare provider with expert physicians and modern facilities",
    url: "https://pristinehospital.com",
    telephone: "+91-9876543210",
    email: "contact@pristinehospital.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hospital Address",
      addressLocality: "City",
      addressRegion: "State",
      postalCode: "123456",
      addressCountry: "IN",
    },
    image: "https://pristinehospital.com/og-image.png",
    sameAs: [
      "https://facebook.com/pristinehospital",
      "https://twitter.com/pristinehospital",
      "https://linkedin.com/company/pristinehospital",
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "20:00",
    },
  };
}

/**
 * Generate doctor schema for search engines
 */
export function generateDoctorSchema(doctor: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  yearsOfExperience: number;
  qualifications: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
    email: doctor.email,
    telephone: doctor.phone,
    specialty: doctor.specialization,
    knowsAbout: doctor.qualifications.map((q) => ({
      "@type": "Thing",
      name: q,
    })),
    jobTitle: doctor.specialization,
  };
}

/**
 * Generate breadcrumb schema for navigation
 */
export function generateBreadcrumbSchema(path: string) {
  const segments = path.split("/").filter(Boolean);
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://pristinehospital.com",
    },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    items.push({
      "@type": "ListItem",
      position: index + 2,
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      item: `https://pristinehospital.com${currentPath}`,
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
