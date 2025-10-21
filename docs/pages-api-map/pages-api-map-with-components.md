# Next.js Pages, Nested Components, and API Usage Map

This document lists each page in the project, the nested components it uses (directly via imports), and the API endpoints it calls.

---

## /app/admin/properties/page.tsx
**Page:** /admin/properties
**Nested Components:**
- components/layout/admin-layout.tsx
- components/ui/button.tsx
- components/ui/input.tsx
- components/ui/label.tsx
- components/ui/select.tsx
- components/ui/dialog.tsx
- components/ui/badge.tsx
- components/ui/card.tsx
- components/ui/table.tsx
- components/MediaSelector.tsx
- components/RichTextEditor.tsx
- components/ui/textarea.tsx
**APIs Called:**
- `/api/fieldSearch/advancedSearch/Property` (POST)
- `/api/admin/properties/:id` (GET, PUT, DELETE)
- `/api/admin/properties` (POST)

---

## /app/admin/reports/page.tsx
**Page:** /admin/reports
**Nested Components:**
- components/charts/ViewTrend.tsx
- components/charts/UserAgentStats.tsx
- components/charts/TopProperties.tsx
- components/layout/admin-layout.tsx
- components/ui/card.tsx
**APIs Called:**
- (No direct API calls found)

---

## /app/admin/notifications/page.tsx
**Page:** /admin/notifications
**Nested Components:**
- components/ui/card.tsx
- components/ui/button.tsx
- components/ui/input.tsx
- components/ui/textarea.tsx
- components/ui/label.tsx
- components/ui/badge.tsx
- components/ui/alert.tsx
- components/layout/admin-layout.tsx
**APIs Called:**
- `/api/admin/notifications` (POST)
- `/api/public/recentNotifications` (GET)

---

## /app/admin/analytics/page.tsx
**Page:** /admin/analytics
**Nested Components:**
- components/layout/admin-layout.tsx
- components/ui/button.tsx
- components/ui/card.tsx
- components/ui/input.tsx
- components/ui/label.tsx
- components/ui/alert.tsx
- components/PageComponentSkeletonLoader.tsx
**APIs Called:**
- `/api/admin/ga-config` (GET, POST)
- `/api/admin/ga-config/:id` (PUT)

---

## /app/admin/media/page.tsx
**Page:** /admin/media
**Nested Components:**
- components/ui/card.tsx
- components/ui/button.tsx
- components/ui/input.tsx
- components/ui/dialog.tsx
- components/ui/dropdown-menu.tsx
- components/FileCard.tsx
- components/MediaSelector.tsx
**APIs Called:**
- `/api/media/files` (GET)
- `/api/media/folders` (POST)
- `/api/media/delete` (POST)
- `/api/media/upload` (POST)

---

## /app/admin/pages/page.tsx
**Page:** /admin/pages
**Nested Components:**
- components/ui/card.tsx
- components/ui/button.tsx
- components/ui/input.tsx
- components/ui/dialog.tsx
- components/ui/label.tsx
- components/layout/admin-layout.tsx
**APIs Called:**
- `/api/admin/services/:id` (PUT, DELETE)
- `/api/admin/services` (POST, GET)
- `/api/admin/legal-content/:id` (PUT, DELETE)
- `/api/admin/legal-content` (POST, GET)
- `/api/admin/about-us-content` (GET)
- `/api/admin/team-members` (GET)
- `/api/admin/company-values` (GET)

---

## /app/admin/dashboard/page.tsx
**Page:** /admin/dashboard
**Nested Components:**
- components/layout/admin-layout.tsx
- components/ui/card.tsx
- components/ui/table.tsx
- components/ui/button.tsx
**APIs Called:**
- `/api/fieldSearch/count/:field` (GET)
- `/api/fieldSearch/advancedSearch/ActivityLog` (POST)
- `/api/fieldSearch/advancedSearch/Blog` (POST)

---

## /app/admin/cache-management/page.tsx
**Page:** /admin/cache-management
**Nested Components:**
- components/layout/admin-layout.tsx
- components/ui/card.tsx
- components/ui/button.tsx
- components/ui/badge.tsx
**APIs Called:**
- `/api/admin/cache/cacheInfo` (GET)

---

## /app/login/page.tsx
**Page:** /login
**Nested Components:**
- (Check file for details)
**APIs Called:**
- `/api/public/login` (POST)

---

## /app/admin/recover-password/page.tsx
**Page:** /admin/recover-password
**Nested Components:**
- (Check file for details)
**APIs Called:**
- `/api/public/recover-password` (POST)

---

## /app/page.tsx
**Page:** /
**Nested Components:**
- (Check file for details)
**APIs Called:**
- (No direct API calls found)

---

(For other pages, check the file for details. This document lists the main pages, their direct nested components, and API usage. For deeper component nesting, see the respective component files.)
