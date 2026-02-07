import { Doctor, DepartmentGroup } from "@/types";

/**
 * Group doctors by specialization/department
 */
export function groupDoctorsByDepartment(doctors: Doctor[]): DepartmentGroup[] {
  const groupedMap = new Map<string, Doctor[]>();

  // Group doctors by specialization
  doctors.forEach((doctor) => {
    const specialization = doctor.specialization || "General";
    if (!groupedMap.has(specialization)) {
      groupedMap.set(specialization, []);
    }
    groupedMap.get(specialization)!.push(doctor);
  });

  // Convert to array and sort by department name
  return Array.from(groupedMap.entries())
    .map(([specialization, doctorList]) => ({
      departmentName: formatDepartmentName(specialization),
      specialization,
      doctors: doctorList.sort((a, b) => 
        a.lastName.localeCompare(b.lastName)
      ),
    }))
    .sort((a, b) => a.departmentName.localeCompare(b.departmentName));
}

/**
 * Format specialization to readable department name
 */
function formatDepartmentName(specialization: string): string {
  return specialization
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Get department icon based on specialization
 */
export function getDepartmentIcon(specialization: string): string {
  const iconMap: Record<string, string> = {
    orthopedics: "🦴",
    cardiology: "❤️",
    neurology: "🧠",
    pediatrics: "👶",
    dermatology: "🩺",
    general: "👨‍⚕️",
    oncology: "🏥",
    gynecology: "👩‍⚕️",
    urology: "🏥",
    surgery: "🔪",
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (specialization.toLowerCase().includes(key)) {
      return icon;
    }
  }

  return "👨‍⚕️"; // Default icon
}

/**
 * Format doctor name
 */
export function formatDoctorName(doctor: Doctor): string {
  return `${doctor.firstName} ${doctor.lastName}`;
}

/**
 * Get doctor title with qualifications
 */
export function getDoctorTitle(doctor: Doctor): string {
  if (doctor.qualifications && doctor.qualifications.length > 0) {
    return doctor.qualifications.join(", ");
  }
  return doctor.specialization || "Medical Professional";
}

/**
 * Get experience badge text
 */
export function getExperienceBadge(years: number): string {
  if (years >= 20) return "Senior Consultant";
  if (years >= 10) return "Consultant";
  if (years >= 5) return "Specialist";
  return "Associate";
}
