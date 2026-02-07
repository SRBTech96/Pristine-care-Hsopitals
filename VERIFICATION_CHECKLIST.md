# ✅ Performance Optimization - Verification Checklist

Use this checklist to verify all optimizations are working correctly.

---

## 🔍 Pre-Deployment Verification

### Build & Compilation
- [ ] Run `npm run build` → succeeds with no errors
- [ ] Build output includes: `.next/`, `public/`, `src/`
- [ ] No TypeScript errors: `npm run type-check` ✅
- [ ] No ESLint errors: `npm run lint` ✅
- [ ] No warnings in console

### Configuration Files
- [ ] `next.config.ts` has image optimization enabled
- [ ] `next.config.ts` has headers configured
- [ ] `src/middleware.ts` exists with security headers
- [ ] `public/sw.js` exists (Service Worker)
- [ ] `public/robots.txt` exists

### New Files Exist
- [ ] `src/lib/api-cache.ts` - Caching layer
- [ ] `src/lib/server-data.ts` - Server data fetching
- [ ] `src/lib/seo.ts` - SEO utilities
- [ ] `src/lib/performance.ts` - Performance monitoring
- [ ] `src/app/api/doctors/route.ts` - API proxy
- [ ] `src/app/sitemap.xml/route.ts` - Dynamic sitemap
- [ ] `src/app/doctors/page.tsx` - Doctors page
- [ ] `src/app/about/page.tsx` - About page
- [ ] `src/app/services/page.tsx` - Services page
- [ ] `src/app/contact/page.tsx` - Contact page
- [ ] `src/components/ContactForm.tsx` - Contact form

### Page Configuration
- [ ] `src/app/page.tsx` has `export const revalidate`
- [ ] `src/app/page.tsx` has `export const dynamic`
- [ ] `src/app/doctors/page.tsx` has ISR config
- [ ] `src/app/about/page.tsx` has ISR config
- [ ] `src/app/services/page.tsx` has ISR config
- [ ] `src/app/contact/page.tsx` has ISR config

---

## 🚀 Production Build Test

### Run Production Build
```bash
npm run build
```

Verify output:
- [ ] Build completes successfully
- [ ] No errors in output
- [ ] `.next` folder created
- [ ] File build size shows optimization

### Start Production Server
```bash
npm start
```

Verify server:
- [ ] Server starts on port 3000
- [ ] No errors in startup logs
- [ ] Server ready for requests

---

## 📄 Page Rendering Tests

### Test Home Page
```bash
curl http://localhost:3000/
```

Verify:
- [ ] Returns 200 status
- [ ] Contains full HTML (not blank)
- [ ] Shows header and footer
- [ ] Shows hero section
- [ ] Response time < 100ms

### Test Doctors Page
```bash
curl http://localhost:3000/doctors
```

Verify:
- [ ] Returns 200 status
- [ ] Contains doctor listing
- [ ] Response time < 100ms
- [ ] Has proper meta tags

### Test About Page
```bash
curl http://localhost:3000/about
```

Verify:
- [ ] Returns 200 status
- [ ] Contains mission/vision section
- [ ] Response time < 100ms

### Test Services Page
```bash
curl http://localhost:3000/services
```

Verify:
- [ ] Returns 200 status
- [ ] Shows service cards
- [ ] Response time < 100ms

### Test Contact Page
```bash
curl http://localhost:3000/contact
```

Verify:
- [ ] Returns 200 status
- [ ] Contains contact form
- [ ] Response time < 100ms

---

## 🔗 API Route Tests

### Test Sitemap
```bash
curl http://localhost:3000/sitemap.xml
```

Verify:
- [ ] Returns 200 status
- [ ] XML format is valid
- [ ] Contains all pages
- [ ] Has proper priorities

### Test OpenAPI
```bash
curl http://localhost:3000/api/openapi
```

Verify:
- [ ] Returns 200 status
- [ ] Valid JSON schema
- [ ] Contains doctor endpoints

### Test Doctors API Proxy
```bash
curl http://localhost:3000/api/doctors
```

Verify:
- [ ] Returns 200 status
- [ ] Has Cache-Control header
- [ ] Returns cached data

---

## 🌐 Browser DevTools Checks

### Lighthouse Audit
1. Open DevTools → Lighthouse
2. Run Audit for "Mobile" and "Desktop"
3. Verify scores:
   - [ ] Performance: > 90
   - [ ] Accessibility: > 90
   - [ ] Best Practices: > 90
   - [ ] SEO: > 90

### Network Tab
1. Open DevTools → Network
2. Reload page (Cmd/Ctrl+Shift+R)
3. Check cache behavior:
   - [ ] Static assets: 304 (cached)
   - [ ] HTML pages: 200 < 100ms
   - [ ] No 404 errors

### Performance Tab
1. Open DevTools → Performance
2. Record page load (3-5 seconds)
3. Check metrics:
   - [ ] First Paint: < 1000ms
   - [ ] First Contentful Paint: < 1500ms
   - [ ] Largest Contentful Paint: < 2500ms
   - [ ] Cumulative Layout Shift: < 0.1

### Application Tab - Service Worker
1. Open DevTools → Application
2. Check Service Workers:
   - [ ] Service Worker registered
   - [ ] Status: "activated and running"
   - [ ] Shows /sw.js
3. Check Cache Storage:
   - [ ] pristine-static-v1 exists
   - [ ] pristine-dynamic-v1 exists
   - [ ] Contains cached pages/APIs

### Application Tab - Offline Test
1. Open DevTools → Application
2. Check Offline checkbox
3. Reload page:
   - [ ] Page loads from cache
   - [ ] Content visible
   - [ ] No error messages
4. Uncheck Offline
5. Verify page re-syncs

---

## 📊 Core Web Vitals Check

### Chrome DevTools
1. Open website
2. Open DevTools Console
3. Monitor Core Web Vitals:
```javascript
// View performance entries
performance.getEntriesByType('largest-contentful-paint');
performance.getEntriesByType('layout-shift');
performance.getEntriesByType('first-input');
```

Verify:
- [ ] LCP < 1500ms
- [ ] CLS < 0.05
- [ ] FID < 100ms

### Web.dev Measure
1. Visit https://web.dev/measure
2. Enter: http://localhost:3000
3. Check results:
   - [ ] Performance > 90
   - [ ] All Core Web Vitals "Good"

---

## 🔒 Security Headers Check

### Using curl
```bash
curl -i http://localhost:3000/ | grep -i "strict-transport\|x-content\|x-frame\|x-xss\|referrer"
```

Verify headers present:
- [ ] Strict-Transport-Security
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] X-XSS-Protection
- [ ] Referrer-Policy

### Using Browser DevTools
1. DevTools → Network
2. Click on page request
3. Go to "Response Headers"
4. Verify headers listed above

---

## 📱 Mobile Responsiveness

### Mobile View (DevTools)
1. DevTools → Toggle Device Toolbar
2. Test devices:
   - [ ] iPhone 12 (390x844)
   - [ ] iPhone XR (414x896)
   - [ ] Pixel 5 (393x851)
   - [ ] iPad (1024x1366)

Verify on each:
- [ ] Content readable (no overflow)
- [ ] Images responsive
- [ ] Hamburger menu works
- [ ] Forms usable
- [ ] Touch targets > 48px

### Actual Mobile Device
1. Access: http://[YOUR_IP]:3000
2. Test on iOS device:
   - [ ] Loads correctly
   - [ ] Performance acceptable
   - [ ] Touch interactions smooth
3. Test on Android device:
   - [ ] Loads correctly
   - [ ] No layout issues
   - [ ] Forms work

---

## 🎯 SEO Verification

### Page Titles
1. View source (Cmd/Ctrl+U)
2. Search for `<title>`
3. Verify:
   - [ ] Home: "Pristine Hospital - Excellence in Healthcare"
   - [ ] Doctors: "Meet Our Doctors - Pristine Hospital"
   - [ ] Services: "Healthcare Services - Pristine Hospital"
   - [ ] About: "About Pristine Hospital - Healthcare Excellence"
   - [ ] Contact: "Contact Pristine Hospital - Get In Touch"

### Meta Descriptions
View source and verify all pages have:
- [ ] `<meta name="description">`
- [ ] Content is 150-160 characters
- [ ] Content is unique per page

### Open Graph Tags
View source and verify:
- [ ] `<meta property="og:title">`
- [ ] `<meta property="og:description">`
- [ ] `<meta property="og:image">`
- [ ] `<meta property="og:url">`

### Structured Data
1. Visit https://schema.org/validator
2. Paste source code
3. Verify:
   - [ ] Organization schema valid
   - [ ] Doctor schema valid (if present)
   - [ ] No errors or warnings

---

## 🔄 Caching Verification

### Browser Cache
1. DevTools → Network
2. Reload page (normal)
3. Check response:
   - [ ] Initial: 200 (from network)
4. Reload again:
   - [ ] Second: 304 (from cache)
5. Third party assets:
   - [ ] 304 responses = cached

### API Cache Layer
```typescript
// In browser console:
import apiClient from "@/lib/api-client";
console.log(apiClient.getCacheStats());
```

Verify output shows:
- [ ] Cache size > 0
- [ ] Multiple entries cached
- [ ] Memory usage reasonable

### Service Worker Cache
1. DevTools → Application → Cache Storage
2. Expand caches:
   - [ ] pristine-static-v1
   - [ ] pristine-dynamic-v1
3. Click each:
   - [ ] Shows cached resources
   - [ ] Includes HTML pages
   - [ ] Includes API responses

---

## 📈 Performance Monitoring

### Check Performance API
```javascript
// In console:
performance.timing.loadEventEnd - performance.timing.navigationStart
// Should be < 3000ms for production
```

Verify:
- [ ] Page load < 3000ms (development)
- [ ] Page load < 1000ms (production)

### Monitor ISR
1. Edit a backend doctor record
2. Wait < 15 minutes
3. Reload `/doctors` page:
   - [ ] Shows updated information
4. Check server logs:
   - [ ] See ISR revalidation happening

---

## 🐛 Troubleshooting

### If Lighthouse Score < 90:
1. Run full audit (3+ times to stabilize)
2. Check "Opportunities" section
3. Address top issues:
   - [ ] Defer unused JavaScript
   - [ ] Optimize images
   - [ ] Minify CSS
   - [ ] Preconnect to required origins

### If Core Web Vitals Bad:
1. Check LCP:
   - [ ] Verify images optimized (AVIF/WebP)
   - [ ] Check Server responding < 600ms
2. Check CLS:
   - [ ] Look for unsized images
   - [ ] Check banner height variations
3. Check FID/INP:
   - [ ] Minimize JavaScript
   - [ ] Break long tasks into chunks

### If Service Worker Won't Register:
1. Check browser console for errors
2. Verify `public/sw.js` exists
3. Check `src/middleware.ts` not blocking
4. Try: `navigator.serviceWorker.getRegistrations()`

### If Cache Not Working:
1. Clear browser cache: DevTools → Clear all
2. Close DevTools (can interfere with caching)
3. Reload page
4. Check Network tab for 304 responses

### If ISR Not Updating:
1. Verify ISR config: `export const revalidate = 600`
2. Wait specified time (e.g., 10 min for home)
3. Check server logs for "Revalidating page"
4. Manual test: `curl http://localhost:3000/` twice

---

## ✅ Final Checklist

Before declaring ready:

```bash
# Run all checks
npm run build                  # ✅ Must succeed
npm run type-check             # ✅ Must pass
npm run lint                   # ✅ No errors
npm run lighthouse             # ✅ Score > 90
```

In browser:
```bash
# Performance tests
- [ ] Home loads < 100ms
- [ ] All pages load < 200ms
- [ ] API responses cached
- [ ] Service Worker active
- [ ] Offline mode works
- [ ] Core Web Vitals good
- [ ] Lighthouse > 90
- [ ] Security headers present
- [ ] Mobile responsive
- [ ] SEO metadata complete
```

---

## 🎉 Done!

If all checks pass, you're ready for:
1. ✅ Staging deployment
2. ✅ Production deployment
3. ✅ Scale testing
4. ✅ Real-user monitoring

**Status**: Ready for Enterprise Deployment 🚀
