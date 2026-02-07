# 🚀 Quick Start - Pristine Hospital

Get the complete hospital platform running in **10 minutes**.

## Prerequisites 📦

Before starting, ensure you have:
- Node.js 18+ (download from https://nodejs.org/)
- PostgreSQL 13+ (download from https://postgresql.org/)

## Step 1: Database Setup (2 minutes) 🗄️

```bash
# Open PostgreSQL command line
psql -U postgres

# Create database and user
CREATE DATABASE pristine_hospital;
CREATE USER pristine WITH PASSWORD 'change-me';
ALTER ROLE pristine WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE pristine_hospital TO pristine;

# Exit
\q

# Create schema
psql -U pristine -d pristine_hospital -f database/schema.sql
```

**Expected Output**: No errors, tables created ✅

## Step 2: Backend Setup (3 minutes) 🏗️

```bash
cd backend

# Create environment file
cp .env.example .env

# Install dependencies
npm install

# Start backend
npm run dev
```

**Expected Output**:
```
✓ Seeded sample doctor: HM Prasanna
Server listening on http://localhost:3001
```

## Step 3: Frontend Setup (3 minutes) 🌐

Open a **new terminal window** and run:

```bash
cd frontend

# Create environment file
cp .env.example .env.local

# Install dependencies
npm install

# Start frontend
npm run dev
```

**Expected Output**:
```
▲ Next.js 14.1.0
  ○ Localhost:3000
  ✓ Ready in 1.23s
```

## Step 4: View the Website (2 minutes) 👀

Open your browser and visit:

### **http://localhost:3000**

You should see:
- ✅ Premium hospital website
- ✅ Hero section with statistics
- ✅ "Meet Our Medical Team" section
- ✅ HM Prasanna card in Orthopedics department
- ✅ All responsive on mobile/tablet/desktop

---

## 🎯 What You Have

### Frontend (http://localhost:3000)
- 📱 Premium hospital website
- 👨‍⚕️ Data-driven doctor listing
- 🏥 Professional UI
- 📊 Automatic department grouping

### Backend (http://localhost:3001)
- 📡 10 complete API modules
- 👨‍💼 Complete hospital management system
- 🔐 Authentication & RBAC
- 📋 11 business modules

### Database
- 🗄️ 44 tables
- 👥 MDM-compliant patient data
- 📝 Complete audit trail
- 🔒 Row-level access control

---

## 🎓 Key Features Explained

### 1. Data-Driven Doctor Listing ✨

The website **automatically fetches** doctors from the backend:

```
Backend Database → API (/api/doctors) → Frontend
                                          ↓
                                    Auto-groups by
                                    specialization
                                          ↓
                                    Renders Orthopedics,
                                    Cardiology, etc.
```

**No hardcoded doctor names in code!** 🎉

### 2. Adding New Doctors (Super Simple!)

Want to add a cardiologist? Just one SQL command:

```sql
-- Run this in PostgreSQL
INSERT INTO doctors (
  first_name, last_name, email, phone,
  specialization, years_of_experience, created_by, created_at
) VALUES (
  'Sarah', 'Williams', 'sarah@hospital.com', '+91-9876543211',
  'Cardiology', 15, '00000000-0000-0000-0000-000000000000', NOW()
);
```

**Result**: 
- Refresh the website
- New "Cardiology" section automatically appears! ✨
- No code changes needed!

### 3. Premium UI Features

- 🎨 Professional color scheme (Blue & White)
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Fast loading with Next.js 14
- 🎯 Clean, high-end hospital UX
- 🔄 Smooth animations and transitions

---

## 🔍 Verification Steps

### Backend Running?
```bash
# In a new terminal
curl http://localhost:3001/api/doctors
```

Should show:
```json
{
  "status": 200,
  "data": [
    {
      "id": "...",
      "firstName": "HM",
      "lastName": "Prasanna",
      "specialization": "Orthopedics",
      ...
    }
  ]
}
```

### Frontend Working?
- Visit http://localhost:3000
- See "Meet Our Medical Team" heading
- See HM Prasanna in Orthopedics section
- Can click email/phone links

### All Green? ✅
Congratulations! Your hospital platform is up and running!

---

## 🆘 Troubleshooting

### "Cannot find PostgreSQL"
```bash
# Windows: Check if PostgreSQL is running
Get-Service | grep postgres

# macOS: Start PostgreSQL
brew services start postgresql

# Linux: Check service
sudo service postgresql status
```

### "Port 3001 already in use" (Backend)
```bash
# Windows: Find process using port 3001
netstat -ano | findstr :3001

# Kill it
taskkill /PID <PID> /F
```

### "Cannot find module" (Frontend)
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### "Doctors not showing"
1. Check backend is running: `http://localhost:3001`
2. Check API works: `curl http://localhost:3001/api/doctors`
3. Check browser console for errors (F12)
4. Restart frontend server

---

## 📚 Learn More

- **Full Setup Guide**: See `INTEGRATION_GUIDE.md`
- **Frontend Details**: See `FRONTEND_SETUP.md`
- **Backend Docs**: See `backend/README.md`
- **Database Schema**: See `database/schema.sql`

---

## 💡 Next Steps

1. **Explore the Website** 🌐
   - Browse different sections
   - Test responsive design (F12 → mobile view)
   - Click contact links

2. **Add More Doctors** 👨‍⚕️
   - Use SQL commands above
   - Watch website update automatically!

3. **Backend Customization** 🔧
   - Explore `/backend/src` modules
   - Read module documentation (BILLING.md, LAB.md, etc.)
   - Try API endpoints

4. **Frontend Customization** 🎨
   - Change hospital name in Header.tsx
   - Update colors in tailwind.config.ts
   - Add your logo

5. **Production Deployment** 🚀
   - See `INTEGRATION_GUIDE.md` for deployment steps

---

## ⚡ Commands Reference

### Backend
```bash
cd backend
npm run dev          # Development mode
npm run build        # Production build
npm start            # Production start
npm run test         # Run tests
npm run type-check   # TypeScript check
```

### Frontend
```bash
cd frontend
npm run dev          # Development mode
npm run build        # Production build
npm start            # Production server
npm run lint         # Linting
npm run type-check   # TypeScript check
```

### Database
```bash
# Connect to database
psql -U pristine -d pristine_hospital

# View all doctors
SELECT * FROM doctors;

# View sample data
SELECT COUNT(*) FROM doctors;
\dt                  # List all tables
```

---

## 🎉 Success Indicators

You're all set when you see:

```
✅ Backend console: "Server listening on http://localhost:3001"
✅ Frontend console: "Ready in X.XXs"
✅ Browser: Hospital website loads at http://localhost:3000
✅ Doctor card: HM Prasanna visible in Orthopedics section
✅ Responsive: Website works on mobile view
```

---

## 🏆 What You've Built

A **complete, production-ready hospital management platform**:

- 🌐 Premium public website with data-driven doctors
- 🏗️ Complete backend with 11 business modules
- 🗄️ Enterprise database with 44 tables
- 🔐 Security (RBAC, JWT, audit trails)
- 📱 Responsive mobile-first design
- ⚡ High-performance architecture

**All in less than 10 minutes of setup!** 🚀

---

## 📞 Need Help?

1. Check the troubleshooting section above
2. Review `INTEGRATION_GUIDE.md` for detailed setup
3. Check backend/frontend logs for error details
4. Verify all prerequisites are installed

---

**Ready to go!** 🎊

Visit http://localhost:3000 and explore your hospital platform!

---

**Last Updated**: February 7, 2026
**Status**: ✅ Ready to Use
