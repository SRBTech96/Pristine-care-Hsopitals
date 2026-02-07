import type { Metadata } from "next";
import { generateMetadata, pageMetadata } from "@/lib/seo";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

/**
 * Contact Page - Hybrid Server/Client Component
 * Server component for SEO, with client contact form
 */

export const metadata: Metadata = generateMetadata(pageMetadata.contact);

export const revalidate = 3600; // 1 hour - revalidate contact info occasionally

export default function ContactPage() {
  return (
    <main className="w-full min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pristine-600 to-pristine-800 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-lg md:text-xl text-pristine-100 max-w-3xl">
            Get in touch with us for appointments, inquiries, or emergency assistance.
            We're here to help you.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Get In Touch</h2>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-pristine-100 text-pristine-600">
                      <Phone className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">+91 (123) 456-7890</p>
                    <p className="text-gray-600">+91 (123) 456-7891</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-pristine-100 text-pristine-600">
                      <Mail className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">contact@pristinehospital.com</p>
                    <p className="text-gray-600">appointments@pristinehospital.com</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-pristine-100 text-pristine-600">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                    <p className="text-gray-600">
                      123 Medical Plaza
                      <br />
                      Healthcare City
                      <br />
                      State 123456, India
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-pristine-100 text-pristine-600">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 8:00 AM - 8:00 PM
                      <br />
                      Saturday: 8:00 AM - 6:00 PM
                      <br />
                      Sunday & Holidays: 9:00 AM - 5:00 PM
                      <br />
                      <span className="font-semibold">24/7 Emergency Services</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form - Client Component */}
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-16 md:py-24 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Find Us</h2>
          <div className="rounded-lg overflow-hidden shadow-lg bg-gray-300 h-96 flex items-center justify-center">
            <p className="text-gray-600">Map location will be displayed here</p>
          </div>
        </div>
      </section>
    </main>
  );
}
