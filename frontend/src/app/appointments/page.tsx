import { AppointmentBookingForm } from "@/components/AppointmentBookingForm";

export const dynamic = "force-dynamic";

export default function AppointmentsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Schedule Your Visit</h1>
          <p className="text-gray-600 mt-2">
            Pick your department, doctor, and time slot. Our reception team will confirm your appointment.
          </p>
        </div>
        <AppointmentBookingForm />
      </div>
    </main>
  );
}
