# Pristine Hospital - Premium Public Website

A modern, data-driven hospital website showcasing doctors grouped by department. Built with Next.js 14, TypeScript, and Tailwind CSS with seamless API integration.

## Features

✨ **Data-Driven Architecture**
- All doctor information fetched from backend APIs
- Zero hardcoded doctor data in UI
- Department grouping handled dynamically
- Automatic updates without code changes

🏥 **Premium Hospital UX**
- Clean, professional design
- Responsive grid layouts
- Interactive doctor cards with contact information
- Department-based organization with custom icons
- Experience badges and qualification display

📱 **Fully Responsive**
- Desktop, tablet, and mobile optimized
- Touch-friendly interface
- Performance optimized

🔌 **API Integration**
- Axios-based API client
- Error handling and loading states
- Doctor and department queries

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with Header/Footer
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Header.tsx          # Sticky header with navigation
│   │   ├── Footer.tsx          # Footer with contact info
│   │   ├── HeroSection.tsx     # Hero banner with stats
│   │   ├── DoctorsTabContent.tsx   # Why choose section
│   │   ├── DoctorListing.tsx   # Main doctor listing (client)
│   │   ├── DepartmentSection.tsx   # Department grouping
│   │   └── DoctorCard.tsx      # Individual doctor card
│   ├── lib/
│   │   ├── api-client.ts       # Axios API wrapper
│   │   └── doctor-utils.ts     # Doctor grouping & formatting
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.ts
```

## Key Components

### DoctorListing (Main Component)
- Fetches all doctors from `/doctors` endpoint
- Groups doctors by specialization
- Handles loading and error states
- Maps over department groups

### DoctorCard
- Displays individual doctor information
- Shows qualifications as badges
- Contact actions (email/phone)
- Experience level badges
- Premium hover effects

### DepartmentSection
- Groups doctors by specialization
- Shows department icon and stats
- Displays doctor count and average experience
- Responsive grid layout (1-3 columns)

## API Integration

### Endpoints Used

```typescript
GET /doctors
// Returns: Doctor[]
// Provides all doctors for grouping

GET /doctors/:id
// Returns: Doctor
// Get specific doctor details

GET /doctors?specialization=Orthopedics
// Returns: Doctor[]
// Filter by specialization
```

### API Client Methods

```typescript
fetchDoctors()           // Get all doctors
fetchDoctorById(id)      // Get single doctor
fetchDoctorsBySpecialization(spec)  // Filter by specialty
fetchDepartments()       // Get unique specializations
```

## Doctor Data Model

```typescript
interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualifications: string[];    // e.g., ["MD", "MRCP"]
  specialization: string;      // e.g., "Orthopedics"
  yearsOfExperience: number;
  registrationNumber?: string;
  bio?: string;
}
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Installation & Running

```bash
cd frontend

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Then visit http://localhost:3000

## Premium Design Features

### Color Scheme
- Primary: Pristine Blue (#0ea5e9)
- Dark: Pristine Dark (#075985)
- Accent: Light Blue (#e0f2fe)

### Typography
- Display: Poppins (bold, headings)
- Body: Inter (clean, readable)

### Components
- Premium cards with shadow effects
- Hover animations and transitions
- Gradient backgrounds
- Professional spacing and alignment

### Icons
- Department icons (emoji or custom SVG)
- Action icons (Mail, Phone, Award)
- Loading and error indicators

## Sample Data

The current implementation uses HM Prasanna as sample data:

```typescript
{
  id: "doc-1",
  firstName: "HM",
  lastName: "Prasanna",
  email: "hm.prasanna@pristinehospital.com",
  phone: "+91-9876543210",
  qualifications: ["MD", "DNB Orthopedics"],
  specialization: "Orthopedics",
  yearsOfExperience: 18,
  registrationNumber: "ORG-12345-IN",
  bio: "Senior Orthopaedist with 18 years of experience in trauma and joint replacement surgery"
}
```

## Workflow: Adding New Doctors

1. **No UI Changes Required** - Simply add doctors to backend database
2. Backend API returns updated doctor list
3. Frontend automatically:
   - Fetches new doctors
   - Groups by department
   - Renders with correct styling
   - Updates department stats

Example: Adding Dr. Sarah (Cardiologist)
- Backend: Add to database
- Frontend: Automatically creates "Cardiology" section and displays her card
- No code changes needed!

## Future Enhancements

1. **Search & Filter**
   - Search by doctor name
   - Filter by department
   - Experience level filtering

2. **Doctor Detail Pages**
   - Full bio and credentials
   - Reviews/ratings
   - Appointment booking

3. **Department Pages**
   - Department overview
   - Services offered
   - Department-specific information

4. **Advanced Features**
   - Doctor availability calendar
   - Online booking system
   - Patient testimonials
   - Blog/articles

## Performance Optimizations

- Next.js 14 server components for faster rendering
- Image optimization ready
- CSS-in-JS for optimized CSS delivery
- TypeScript for type safety
- Error boundaries for graceful degradation

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Styling System

All styling uses Tailwind CSS with custom Pristine Hospital theme:

```tailwind
@apply btn btn-primary          // Premium button
@apply card card-premium        # Premium card
@apply smooth-transition        // Smooth animations
@apply premium-shadow           // Premium shadow effect
```

## Error Handling

- Network errors show user-friendly messages
- Loading states during API calls
- Fallback content for missing data
- Console logging for debugging

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Proper heading hierarchy
- Color contrast compliance
- Keyboard navigation support

---

**Status**: ✅ **COMPLETE** - Fully functional, data-driven hospital website ready for production.
