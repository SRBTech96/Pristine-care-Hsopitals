"use client";

import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top Info Bar */}
      <div className="bg-pristine-900 text-white py-3 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-pristine-200 smooth-transition">
                <Phone className="w-4 h-4" />
                <span>+91 9876 543 210</span>
              </a>
              <a href="mailto:info@pristinehospital.com" className="flex items-center gap-2 hover:text-pristine-200 smooth-transition">
                <Mail className="w-4 h-4" />
                <span>info@pristinehospital.com</span>
              </a>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Mon - Fri: 9:00 AM - 9:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Bangalore, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pristine-500 rounded-lg flex items-center justify-center font-bold text-white text-xl">
              ⚕️
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pristine Hospital</h1>
              <p className="text-xs text-gray-600">Excellence in Healthcare</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-900 font-semibold hover:text-pristine-600 smooth-transition">
              Home
            </a>
            <a href="#doctors" className="text-gray-900 font-semibold hover:text-pristine-600 smooth-transition">
              Doctors
            </a>
            <a href="#departments" className="text-gray-900 font-semibold hover:text-pristine-600 smooth-transition">
              Departments
            </a>
            <a href="#contact" className="text-gray-900 font-semibold hover:text-pristine-600 smooth-transition">
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <button className="btn btn-primary hidden sm:inline-flex">
            Book Appointment
          </button>
        </div>
      </div>
    </header>
  );
};
