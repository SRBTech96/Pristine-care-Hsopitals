import type { Metadata } from "next";
import { generateMetadata, pageMetadata } from "@/lib/seo";
import {
  Stethoscope,
  Heart,
  Brain,
  Zap,
  Microscope,
  AlertCircle,
  Users,
  Home,
} from "lucide-react";

/**
 * Services Page - Server Component with SSG
 * Static page listing hospital services
 * Revalidates every 24 hours
 */

export const metadata: Metadata = generateMetadata(pageMetadata.services);

export const revalidate = 86400; // 24 hours

export const dynamic = "force-static";

const services = [
  {
    icon: AlertCircle,
    title: "Emergency Care",
    description:
      "24/7 emergency services with fully equipped trauma center and ICU facilities. Rapid response team for critical patients.",
  },
  {
    icon: Stethoscope,
    title: "General Consultation",
    description:
      "Comprehensive medical consultation services with experienced physicians for diagnosis and treatment planning.",
  },
  {
    icon: Heart,
    title: "Cardiology",
    description:
      "Advanced cardiac care including diagnostic procedures, interventions, and rehabilitation programs.",
  },
  {
    icon: Brain,
    title: "Neurology & Neurosurgery",
    description:
      "Specialized treatment for neurological conditions including brain and spinal cord disorders.",
  },
  {
    icon: Microscope,
    title: "Diagnostic Services",
    description:
      "State-of-the-art laboratory and imaging services including CT, MRI, ultrasound, and pathology.",
  },
  {
    icon: Zap,
    title: "Surgery",
    description:
      "General and specialized surgical procedures with experienced surgeons and modern operation theaters.",
  },
  {
    icon: Home,
    title: "Outpatient Services",
    description:
      "Walk-in consultation and treatment services for non-emergency medical conditions.",
  },
  {
    icon: Users,
    title: "Health Screening",
    description:
      "Preventive health check-up packages for early disease detection and wellness management.",
  },
];

export default function ServicesPage() {
  return (
    <main className="w-full min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pristine-600 to-pristine-800 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Healthcare Services</h1>
          <p className="text-lg md:text-xl text-pristine-100 max-w-3xl">
            Comprehensive medical services designed to meet all your healthcare needs
            with excellence and compassion.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Our Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="card group hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-pristine-100 text-pristine-600 group-hover:bg-pristine-600 group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Specializations Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            Our Key Specializations
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            We offer specialized care across multiple medical disciplines with expert
            physicians and advanced treatment options.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              "Cardiology",
              "Neurology",
              "Orthopedics",
              "Pediatrics",
              "Gynecology",
              "Psychiatry",
              "Oncology",
              "Gastroenterology",
              "Pulmonology",
              "Nephrology",
              "Endocrinology",
              "Infectious Diseases",
            ].map((specialty) => (
              <div
                key={specialty}
                className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow"
              >
                <p className="text-gray-700 font-medium text-sm md:text-base">{specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Advanced Facilities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Diagnostic Equipment",
                items: ["CT Scan", "MRI", "Digital X-Ray", "Ultrasound", "Pathology Lab"],
              },
              {
                title: "Treatment Facilities",
                items: ["Modern OT Blocks", "ICU", "HDU", "NICU", "Isolation Wards"],
              },
              {
                title: "Infrastructure",
                items: ["24/7 Emergency", "Pharmacy", "Blood Bank", "Cafeteria", "Parking"],
              },
              {
                title: "Support Services",
                items: ["Ambulance", "Counselling", "Physiotherapy", "Dietetics", "Social Work"],
              },
            ].map((facility, index) => (
              <div key={index} className="bg-gradient-to-br from-pristine-50 to-white rounded-lg p-8 border border-pristine-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{facility.title}</h3>
                <ul className="space-y-3">
                  {facility.items.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-pristine-600" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pristine-600 to-pristine-800 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Medical Attention?</h2>
          <p className="text-lg text-pristine-100 mb-8 max-w-2xl mx-auto">
            Contact us today to schedule an appointment or get more information about our services.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-white text-pristine-600 font-semibold px-8 py-3 rounded-lg hover:bg-pristine-50 transition-colors">
              Book Appointment
            </button>
            <button className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-pristine-600 transition-colors">
              Call Us
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
