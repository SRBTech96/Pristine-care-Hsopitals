"use client";

import React from "react";
import { ChevronRight, Stethoscope, Users, Award } from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-pristine-600 to-pristine-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Healthcare Excellence at Every Step
            </h1>
            <p className="text-lg text-pristine-100 mb-8">
              At Pristine Hospital, we're committed to delivering world-class healthcare services with
              compassion, expertise, and innovation. Our team of experienced medical professionals is here to
              care for you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-pristine-700 px-6 py-3 rounded-lg font-semibold hover:bg-pristine-50 smooth-transition flex items-center justify-center gap-2">
                Book Appointment
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-pristine-700 smooth-transition">
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 border border-white border-opacity-20 hover:bg-opacity-20 smooth-transition">
              <Users className="w-8 h-8 mb-4" />
              <p className="text-3xl font-bold mb-2">50,000+</p>
              <p className="text-pristine-100">Happy Patients</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 border border-white border-opacity-20 hover:bg-opacity-20 smooth-transition">
              <Stethoscope className="w-8 h-8 mb-4" />
              <p className="text-3xl font-bold mb-2">100+</p>
              <p className="text-pristine-100">Medical Experts</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 border border-white border-opacity-20 hover:bg-opacity-20 smooth-transition sm:col-span-2">
              <Award className="w-8 h-8 mb-4" />
              <p className="text-3xl font-bold mb-2">15+ Years</p>
              <p className="text-pristine-100">of Excellence</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
