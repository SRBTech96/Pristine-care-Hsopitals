import React from "react";

export const DoctorsTabContent: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Doctors?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our medical team consists of highly qualified specialists with years of experience and proven track records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Board Certified",
              description: "All our doctors are board-certified specialists with advanced qualifications.",
              icon: "🏆",
            },
            {
              title: "Experienced",
              description: "Average experience of 15+ years in their respective fields.",
              icon: "⏱️",
            },
            {
              title: "Patient-Focused",
              description: "Dedicated to providing personalized care with the latest medical treatments.",
              icon: "❤️",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="card-premium text-center hover:shadow-premium-lg smooth-transition"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
