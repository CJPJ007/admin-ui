# Next.js Pages and API Usage Map

This document lists each page in the project and the API endpoints it calls.

---

## /app/admin/properties/page.tsx
**Page:** /admin/properties
**APIs Called:**
- `/api/fieldSearch/advancedSearch/Property` (POST)
- `/api/admin/properties/:id` (GET, PUT, DELETE)
- `/api/admin/properties` (POST)

---

## /app/admin/notifications/page.tsx
**Page:** /admin/notifications
**APIs Called:**
- `/api/admin/notifications` (POST)
- `/api/public/recentNotifications` (GET)

---

## /app/admin/change-password/page.tsx
**Page:** /admin/change-password
**APIs Called:**
- `/api/admin/change-password` (POST)

---

## /app/admin/internationlization/page.tsx
**Page:** /admin/internationlization
**APIs Called:**
- `/api/admin/i18n/locales` (GET)
- `/api/admin/i18n/:locale` (GET, POST, DELETE)

---

## /app/admin/analytics/page.tsx
**Page:** /admin/analytics
**APIs Called:**
- `/api/admin/ga-config` (GET, POST)
- `/api/admin/ga-config/:id` (PUT)

---

## /app/admin/media/page.tsx
**Page:** /admin/media
**APIs Called:**
- `/api/media/files` (GET)
- `/api/media/folders` (POST)
- `/api/media/delete` (POST)
- `/api/media/upload` (POST)

---

## /app/admin/pages/page.tsx
**Page:** /admin/pages
**APIs Called:**
- `/api/admin/services/:id` (PUT, DELETE)
- `/api/admin/services` (POST, GET)
- `/api/admin/legal-content/:id` (PUT, DELETE)
- `/api/admin/legal-content` (POST, GET)
- `/api/admin/about-us-content` (GET)
- `/api/admin/team-members` (GET)
- `/api/admin/company-values` (GET)

---

## /app/admin/recover-password/page.tsx
**Page:** /admin/recover-password
**APIs Called:**
- `/api/public/recover-password` (POST)

---

## /app/login/page.tsx
**Page:** /login
**APIs Called:**
- `/api/public/login` (POST)

---

## /app/admin/reports/page.tsx
**Page:** /admin/reports
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/dashboard/page.tsx
**Page:** /admin/dashboard
**APIs Called:**
- `/api/fieldSearch/count/:field` (GET)
- `/api/fieldSearch/advancedSearch/ActivityLog` (POST)
- `/api/fieldSearch/advancedSearch/Blog` (POST)

---

## /app/admin/cache-management/page.tsx
**Page:** /admin/cache-management
**APIs Called:**
- `/api/admin/cache/cacheInfo` (GET)

---

## /app/admin/users/page.tsx
**Page:** /admin/users
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/sliders/page.tsx
**Page:** /admin/sliders
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/administration/page.tsx
**Page:** /admin/administration
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/client-stories/page.tsx
**Page:** /admin/client-stories
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/faqs/page.tsx
**Page:** /admin/faqs
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/agents/page.tsx
**Page:** /admin/agents
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/referrals/page.tsx
**Page:** /admin/referrals
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/blogs/page.tsx
**Page:** /admin/blogs
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/activity/page.tsx
**Page:** /admin/activity
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/gallery-videos/page.tsx
**Page:** /admin/gallery-videos
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/inquiries/page.tsx
**Page:** /admin/inquiries
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/settings/page.tsx
**Page:** /admin/settings
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/properties/page.tsx
**Page:** /admin/properties
**APIs Called:**
- `/api/fieldSearch/advancedSearch/Property` (POST)
- `/api/admin/properties/:id` (GET, PUT, DELETE)
- `/api/admin/properties` (POST)

---

## /app/admin/administration/page.tsx
**Page:** /admin/administration
**APIs Called:**
- (No direct API calls found)

---

## /app/page.tsx
**Page:** /
**APIs Called:**
- (No direct API calls found)

---

