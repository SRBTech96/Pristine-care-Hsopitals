import type { Metadata } from "next";
import { generateMetadata, pageMetadata } from "@/lib/seo";
import { Award, Users, Heart, TrendingUp } from "lucide-react";

/**
 * About Page - Server Component with SSG
 * Static page about the hospital
 * Revalidates every 24 hours
 */

export const metadata: Metadata = generateMetadata(pageMetadata.about);

export const revalidate = 86400; // 24 hours

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <main className="w-full min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pristine-600 to-pristine-800 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Pristine Hospital
          </h1>
          <p className="text-lg md:text-xl text-pristine-100 max-w-3xl">
            Committed to delivering world-class healthcare with compassion, integrity,
            and excellence since our establishment.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Mission */}
            <div className="card bg-gradient-to-br from-pristine-50 to-white">
              <div className="flex items-center gap-4 mb-4">
                <Heart className="w-8 h-8 text-pristine-600" />
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To provide comprehensive, compassionate, and cost-effective healthcare
                services to all sections of society while maintaining the highest standards
                of medical practice.
              </p>
            </div>

            {/* Vision */}
            <div className="card bg-gradient-to-br from-pristine-50 to-white">
              <div className="flex items-center gap-4 mb-4">
                <TrendingUp className="w-8 h-8 text-pristine-600" />
                <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To become a leading healthcare institution recognized for clinical
                excellence, patient safety, innovation, and teaching of medical sciences
                across the region.
              </p>
            </div>

            {/* Values */}
            <div className="card bg-gradient-to-br from-pristine-50 to-white">
              <div className="flex items-center gap-4 mb-4">
                <Award className="w-8 h-8 text-pristine-600" />
                <h3 className="text-2xl font-bold text-gray-900">Our Values</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Patient-first approach, medical excellence, integrity, compassion,
                continuous learning, teamwork, and commitment to community health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Why Choose Pristine Hospital
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pristine-600 text-white">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Expert Medical Team</h3>
                <p className="mt-2 text-gray-600">
                  Our team comprises highly qualified physicians and specialists with
                  years of experience in their respective fields.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pristine-600 text-white">
                  <Award className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">World-Class Facilities</h3>
                <p className="mt-2 text-gray-600">
                  Equipped with state-of-the-art medical equipment and technology for
                  accurate diagnosis and treatment.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pristine-600 text-white">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Patient-Centric Care</h3>
                <p className="mt-2 text-gray-600">
                  We prioritize patient comfort and well-being, providing compassionate
                  care at every step of their healthcare journey.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pristine-600 text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Continuous Innovation</h3>
                <p className="mt-2 text-gray-600">
                  We stay at the forefront of medical advancements, adopting latest
                  treatment methods and best practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Our Impact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pristine-600 mb-2">
                50,000+
              </div>
              <p className="text-gray-600">Patients Treated</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pristine-600 mb-2">
                100+
              </div>
              <p className="text-gray-600">Medical Experts</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pristine-600 mb-2">
                15+
              </div>
              <p className="text-gray-600">Years of Excellence</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pristine-600 mb-2">
                98%
              </div>
              <p className="text-gray-600">Patient Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pristine-600 to-pristine-800 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Excellence?</h2>
          <p className="text-lg text-pristine-100 mb-8 max-w-2xl mx-auto">
            Schedule an appointment with our specialists and take the first step toward
            better health.
          </p>
          <button className="inline-block bg-white text-pristine-600 font-semibold px-8 py-3 rounded-lg hover:bg-pristine-50 transition-colors">
            Book Appointment
          </button>
        </div>
      </section>
    </main>
  );
}
