# Frontend Setup Guide - Pristine Hospital Website

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend running on http://localhost:3001

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Visit http://localhost:3000 in your browser.

## Environment Configuration

### Development (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Production (.env.production.local)
```
NEXT_PUBLIC_API_URL=https://api.pristinehospital.com
```

## Features

### ✨ Data-Driven Doctor Listing
- Automatically fetches all doctors from backend
- Groups doctors by specialization/department
- Zero hardcoded doctor data
- Updates reflect immediately on backend changes

### 🏥 Premium UI Components
- **Header**: Sticky navigation with contact info
- **Hero Section**: Eye-catching banner with stats
- **Doctor Listing**: Grid-based card layout
- **Department Sections**: Grouped by specialization
- **Doctor Cards**: Rich information display with contact actions
- **Footer**: Complete footer with links and hours

### 📱 Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interactions

### 🔌 API Integration
- Axios HTTP client with error handling
- Loading states and error messages
- Automatic grouping by specialization
- Support for future filtering/search

## Project Structure

```
frontend/src/
├── app/
│   ├── layout.tsx        - Root layout
│   ├── page.tsx          - Home page
│   └── globals.css       - Global styles
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── DoctorListing.tsx (main - client component)
│   ├── DepartmentSection.tsx
│   ├── DoctorCard.tsx
│   └── DoctorsTabContent.tsx
├── lib/
│   ├── api-client.ts     - Axios wrapper
│   └── doctor-utils.ts   - Utility functions
└── types/
    └── index.ts          - TypeScript types
```

## Key Components

### DoctorListing (Client Component)
**Location**: `src/components/DoctorListing.tsx`

This is the main component that:
1. Fetches all doctors from `/api/doctors`
2. Groups them by specialization
3. Handles loading and error states
4. Renders DepartmentSections

```typescript
// Automatically handles:
- API calls on mount
- Data grouping by department
- Loading spinner while fetching
- Error messages if API fails
- Empty state fallback
```

### DepartmentSection
**Location**: `src/components/DepartmentSection.tsx`

Displays a single department with:
- Department header with icon
- Doctor count and average experience
- Responsive grid of doctor cards (1-3 columns)
- Department statistics

### DoctorCard
**Location**: `src/components/DoctorCard.tsx`

Individual doctor display with:
- Full name and specialization
- Experience badge (years)
- Qualifications as badges
- Email and phone clickable links
- Registration number
- Experience level (Senior/Consultant/Specialist)

## API Endpoints Used

### Get All Doctors
```
GET /api/doctors

Response:
{
  "status": 200,
  "data": [
    {
      "id": "doc-1",
      "firstName": "HM",
      "lastName": "Prasanna",
      "email": "hm.prasanna@pristinehospital.com",
      "phone": "+91-9876543210",
      "qualifications": ["MD", "DNB Orthopedics"],
      "specialization": "Orthopedics",
      "yearsOfExperience": 18,
      "registrationNumber": "ORG-12345-IN",
      "bio": "Senior Orthopaedist..."
    }
  ]
}
```

### Get Doctor by ID
```
GET /api/doctors/:id

Response: Single doctor object
```

### Filter by Specialization
```
GET /api/doctors?specialization=Orthopedics

Response: Array of doctors with that specialization
```

## Styling System

### Colors
- **Primary**: #0ea5e9 (Pristine Blue)
- **Dark**: #075985 (Pristine Dark)
- **Accent**: #e0f2fe (Light Blue)

### CSS Classes (from globals.css)
```css
.btn                    - Base button
.btn-primary           - Blue button
.btn-secondary         - Gray button
.card                  - Basic card
.card-premium          - Premium card with padding
.divider               - Gradient divider
.smooth-transition     - Transition animations
```

### Tailwind Utilities
```css
@apply btn btn-primary              /* Primary button */
@apply card card-premium            /* Premium card */
@apply smooth-transition            /* Smooth animations */
@apply shadow-premium               /* Premium shadow */
```

## Adding New Doctors (No Code Changes!)

The frontend is completely data-driven. To add new doctors:

1. **Backend Only**:
   ```sql
   INSERT INTO doctors (
     first_name, last_name, email, phone,
     qualifications, specialization, years_of_experience
   ) VALUES (
     'Sarah', 'Williams', 'sarah@hospital.com', '+91-...',
     'MD,DM Cardiology', 'Cardiology', 15
   );
   ```

2. **Frontend Automatically**:
   - New doctor appears in "Cardiology" section
   - Card displays with correct styling
   - No code changes needed!

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

### 2. State Management
- Uses React hooks (useState, useEffect)
- Data fetched on component mount
- Loading/error states managed locally

### 3. API Calls
All API interactions through `lib/api-client.ts`:
```typescript
import apiClient from '@/lib/api-client';

// In component
const doctors = await apiClient.fetchDoctors();
```

### 4. Styling
- Tailwind CSS for styling
- Custom CSS in globals.css
- Component-scoped classes

## Build & Deployment

### Development Build
```bash
npm run dev      # Start dev server
```

### Production Build
```bash
npm run build    # Build Next.js
npm start        # Start production server
```

### Environment Setup (Production)
1. Set `NEXT_PUBLIC_API_URL` to production backend
2. Run `npm run build`
3. Run `npm start`

## Troubleshooting

### Doctors Not Loading
**Error**: "Failed to load doctor information"

**Solutions**:
1. Check backend is running: `http://localhost:3001`
2. Check CORS is enabled in backend
3. Check API logs for errors
4. Verify `/api/doctors` endpoint works:
   ```bash
   curl http://localhost:3001/api/doctors
   ```

### CORS Issues
**Error**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**: Backend needs CORS enabled (already in main.ts):
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### Styling Issues
**Problem**: Tailwind styles not applied

**Solutions**:
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Restart dev server: `npm run dev`

### TypeScript Errors
**Problem**: "Cannot find module '@/lib/api-client'"

**Solutions**:
1. Verify tsconfig.json has correct paths
2. Ensure all imports have correct extensions (.ts)
3. Run type check: `npm run type-check`

## Performance Optimization

Currently optimized for:
- ✅ Zero unnecessary re-renders
- ✅ Single API call on mount
- ✅ Efficient grouping algorithm
- ✅ CSS-in-JS optimizations
- ✅ Responsive images ready

Future improvements:
- [ ] Pagination for large doctor lists
- [ ] Search and filtering
- [ ] Doctor caching
- [ ] Image CDN optimization

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing (Optional)

### Manual Testing Checklist
- [ ] Page loads without errors
- [ ] Doctor data displays correctly
- [ ] Doctors grouped by specialization
- [ ] Doctor cards show all information
- [ ] Contact links work (email/phone)
- [ ] Responsive on mobile/tablet
- [ ] Loading spinner appears during fetch
- [ ] Error message displays on API failure

## Next Steps

After setup:

1. **View the website**: http://localhost:3000
2. **See HM Prasanna** (sample doctor from backend)
3. **Add more doctors** through backend admin panel
4. **Frontend automatically updates** - no code changes!

## Support

For issues or questions:
- Check backend logs for API errors
- Verify network tab in browser DevTools
- Check console for JavaScript errors
- Review backend API responses

---

**Status**: ✅ **READY TO USE** - Data-driven, production-ready hospital website!
