"use client";

import React from "react";
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">Pristine Hospital</h3>
            <p className="text-gray-400 text-sm mb-4">
              Delivering world-class healthcare with compassion and excellence since 2010.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-pristine-400 smooth-transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pristine-400 smooth-transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pristine-400 smooth-transition">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white smooth-transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white smooth-transition">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white smooth-transition">
                  Departments
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white smooth-transition">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white smooth-transition">
                  Consultations
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white smooth-transition">
                  Surgery
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white smooth-transition">
                  Emergency Care
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white smooth-transition">
                  Diagnostics
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-pristine-400" />
                <a href="tel:+919876543210" className="text-gray-400 hover:text-white smooth-transition">
                  +91 9876 543 210
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-pristine-400" />
                <a href="mailto:info@pristinehospital.com" className="text-gray-400 hover:text-white smooth-transition">
                  info@pristinehospital.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-pristine-400" />
                <span className="text-gray-400">Bangalore, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 gap-4">
            <p>&copy; {currentYear} Pristine Hospital. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white smooth-transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white smooth-transition">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white smooth-transition">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
