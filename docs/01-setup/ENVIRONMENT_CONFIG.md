# Environment Configuration Guide

This guide covers all environment variables and configuration options for optimal performance, SEO, and scalability.

## 🔧 Development Environment

### `.env.local` (for development)

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=

# Feature flags
NEXT_PUBLIC_ENABLE_SERVICE_WORKER=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Running Development Server

```bash
npm run dev
# Starts on http://localhost:3000
# HMR (Hot Module Replacement) enabled
# Full sourcemaps for debugging
```

---

## 🚀 Production Environment

### `.env.production` (for production)

```bash
# Backend API URL - must be your production API
NEXT_PUBLIC_API_URL=https://api.pristinehospital.com

# Google Analytics
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-google-verification-code

# Application Settings
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://pristinehospital.com
NEXT_PUBLIC_SITE_NAME=Pristine Hospital
```

### Building for Production

```bash
# Install dependencies
npm ci --production

# Build optimized bundle
npm run build

# Start production server
npm start
```

---

## 🎯 Advanced Configuration Options

### Performance Settings

```bash
# Cache TTL for different content types (milliseconds)
CACHE_DURATION_DOCTORS=600000      # 10 minutes
CACHE_DURATION_DOCTORS_BY_ID=1800000  # 30 minutes
CACHE_DURATION_DEPARTMENTS=900000  # 15 minutes

# ISR Revalidation (seconds)
ISR_REVALIDATE_HOME=600            # 10 minutes
ISR_REVALIDATE_DOCTORS=900         # 15 minutes
ISR_REVALIDATE_SERVICES=86400      # 24 hours
ISR_REVALIDATE_ABOUT=86400         # 24 hours
ISR_REVALIDATE_CONTACT=3600        # 1 hour

# Service Worker settings
SERVICE_WORKER_ENABLED=true
SERVICE_WORKER_CACHE_VERSION=v1
```

### Security Settings

```bash
# Security headers
SECURITY_HSTS_MAX_AGE=31536000     # 1 year
SECURITY_CSP_POLICY="default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com"

# CORS settings
CORS_ORIGIN=https://pristinehospital.com
CORS_CREDENTIALS=true

# Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100            # 100 requests
RATE_LIMIT_WINDOW=900000           # per 15 minutes
```

### Analytics & Monitoring

```bash
# Analytics endpoint
ANALYTICS_ENDPOINT=https://analytics.pristinehospital.com

# Error tracking (optional)
SENTRY_DSN=

# Request logging
LOG_REQUESTS=true
LOG_ERRORS=true
LOG_LEVEL=info                     # debug, info, warn, error
```

### Feature Flags

```bash
# Feature toggles
FEATURE_APPOINTMENT_BOOKING=false  # Enable when ready
FEATURE_PATIENT_PORTAL=false       # Enable when ready
FEATURE_AI_CHATBOT=false           # Enable when ready

# Experimental features
EXPERIMENTAL_CONCURRENT_RENDERING=true
EXPERIMENTAL_EDGE_FUNCTIONS=false
```

---

## 🌍 Environment-Specific Configuration

### Local Development

```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_SERVICE_WORKER=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
DEBUG=*
```

### Staging

```bash
# .env.staging
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://staging-api.pristinehospital.com
NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_APP_ENV=staging
```

### Production

```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.pristinehospital.com
NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_APP_ENV=production
SECURITY_HSTS_MAX_AGE=31536000
```

---

## ⚡ Performance Tuning

### Optimize for Different Server Capabilities

#### High-Performance Server (SLA: 99.9%)
```bash
# Aggressive caching
CACHE_DURATION_DOCTORS=1800000     # 30 minutes
ISR_REVALIDATE_HOME=1200           # 20 minutes

# More aggressive ISR
ISR_REVALIDATE_DOCTORS=1800        # 30 minutes
```

#### Standard Server (SLA: 99%)
```bash
# Balanced caching
CACHE_DURATION_DOCTORS=600000      # 10 minutes
ISR_REVALIDATE_HOME=600            # 10 minutes

# Standard ISR
ISR_REVALIDATE_DOCTORS=900         # 15 minutes
```

#### Basic Server (SLA: 95%)
```bash
# Conservative caching
CACHE_DURATION_DOCTORS=300000      # 5 minutes
ISR_REVALIDATE_HOME=300            # 5 minutes

# More frequent revalidation
ISR_REVALIDATE_DOCTORS=600         # 10 minutes
```

---

## 🔐 Securing Environment Variables

### DO NOT commit to git:
```bash
# ❌ NEVER commit .env.local/.env.production
# ❌ NEVER commit API keys or secrets

# Add to .gitignore:
.env.local
.env.production.local
.env.*.local
secrets/
credentials/
```

### Safe environment variable management:

**Option 1: Vercel (Recommended)**
```bash
# All vars stored securely in Vercel dashboard
vercel env pull  # Pull vars locally for testing
vercel env add   # Add new variables
```

**Option 2: GitHub Secrets**
```bash
# For CI/CD pipelines
# Settings → Secrets and variables → Actions
# Reference in workflows: ${{ secrets.SECRET_NAME }}
```

**Option 3: Secure .env files**
```bash
# Encrypt before committing
openssl enc -aes-256-cbc -in .env.production -out .env.production.enc

# Decrypt in CI/CD
openssl enc -d -aes-256-cbc -in .env.production.enc -out .env.production
```

---

## 📊 Environment Variable Usage in Code

### Accessing in Next.js

```typescript
// Public variables (client & server)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server-only variables
import { dbHost } = from "process.env";

// In routes and server components
export async function getServerData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // ...
}
```

### Using in API routes

```typescript
// src/app/api/route.ts
export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${apiUrl}/endpoint`);
  // ...
}
```

---

## ✅ Configuration Checklist

### Before Development
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_API_URL` to your backend
- [ ] Set `NEXT_PUBLIC_ENABLE_SERVICE_WORKER=false` for dev
- [ ] Verify `npm run dev` works

### Before Staging Deployment
- [ ] Create `.env.staging` file
- [ ] Set `NEXT_PUBLIC_API_URL` to staging API
- [ ] Set `NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true`
- [ ] Run `npm run build` and verify success
- [ ] Test manually on staging server

### Before Production Deployment
- [ ] Update `NEXT_PUBLIC_API_URL` to production
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Enable all security headers
- [ ] Run full Lighthouse audit (`npm run lighthouse`)
- [ ] Test Cache-Control headers
- [ ] Verify ISR revalidation working
- [ ] Test Service Worker offline capability
- [ ] Submit sitemap to Google Search Console

---

## 🚨 Troubleshooting Configuration

### Variables not loading?

```typescript
// ❌ Wrong - variables prefixed with NEXT_PUBLIC_ only available client-side
const secret = process.env.SECRET_KEY; // undefined in browser!

// ✅ Correct - for client use, prefix with NEXT_PUBLIC_
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // works in browser!
```

### Changed .env but not loading?

```bash
# Restart dev server
# 1. Stop: Ctrl+C
# 2. Restart: npm run dev

# Note: .env changes take effect on next restart
```

### Staging uses production config?

```bash
# Check which environment is active
echo $NODE_ENV

# Force environment
NODE_ENV=production npm start
NODE_ENV=staging npm start
NODE_ENV=development npm run dev
```

---

## 📚 References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Security Best Practices](https://owasp.org/www-project-secure-coding-practices/)
