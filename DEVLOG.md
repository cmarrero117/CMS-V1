# CMS-V1 — Developer Log

A running record of all significant decisions, bugs, and fixes made during development.
Always update this file after any meaningful change.

---

## Project Overview

**Goal:** A multi-tenant CMS that allows clients to make live content edits (text, logos, images) on their websites. Changes publish instantly. Admin has a separate view to manage all clients without work spilling between them.

**Stack:** Next.js · MongoDB (Mongoose) · NextAuth.js (Credentials) · GitHub · Vercel (target deployment)

**Repo:** https://github.com/cmarrero117/CMS-V1

**Demo client site:** Apex Pain Clinic (`apex-pain-clinic` slug)
- Client user: `drjohn117@gmail.com` (role: client, tenantId set)
- Admin user: `cmarrerow117@gmail.com` (role: admin, no tenantId)

---

## Account Structure (Important)

| Email | Role | Notes |
|---|---|---|
| `cmarrerow117@gmail.com` | admin | Manages all clients. No tenantId. |
| `drjohn117@gmail.com` | client | Apex Pain Clinic tenant. |
| `cmarrero117@gmail.com` | client | Christopher Marrero Portfolio tenant. |

> ⚠️ Note: `cmarrerow117` (with a **w**) is the admin. `cmarrero117` (without) is a client account. Easy to confuse.

---

## Session Log

---

### 2026-07-05 — Initial CMS Build

**Decisions made:**
- Stack chosen: Next.js + MongoDB + NextAuth + Vercel
- GitHub as backbone for all code management
- Multi-tenant architecture: each client is a `Tenant` document; users have a `tenantId` reference
- Admin dashboard at `/admin` — lists all clients, links to manage each
- Client dashboard at `/client` — scoped to their own site only
- Site editing at `/site/[slug]` — public-facing site with edit mode toggle

**Models created:**
- `User` — email, password (bcrypt), role (admin/client), tenantId
- `Tenant` — name, slug, plan
- `SiteContent` — all editable fields per site (headline, about, services, contact, SEO, images)

---

### 2026-07-06 — Edit Mode & Inline Editing

**Decisions made:**
- Edit mode toggled via "Edit Site" button on the site page
- Editable fields use `contentEditable` divs (later replaced — see below)
- Save button POSTs all content to `/api/site-content/[slug]`
- Admin can edit any site; clients can only edit their own

**Features added:**
- Edit mode UI with dashed outlines on editable elements
- Save / Cancel controls
- API route `pages/api/site-content/[slug].js` for GET (public) and POST (protected)

---

### 2026-07-08 — SEO Fields & Sidebar Planning

**Decisions made:**
- SEO fields added to `SiteContent` model: `seoTitle`, `seoDescription`, `seoKeywords`, `ogTitle`, `ogDescription`, `ogImageUrl`
- Plan to add inline editing sidebar with font controls, image upload, and advanced options
- Client deletion flow needed so new clients can be created cleanly
- AI chatbot assistant discussed but deferred (cost concern)

---

### 2026-07-09 — Bug Fix Session (Cursor + Save 403)

#### Bug 1: Cursor jumping to start of field while typing
**Symptom:** Every keystroke moved the cursor to position 0 in editable fields.
**Root cause:** `contentEditable` + React state is fundamentally broken — React re-renders the DOM on every keystroke and physically repositions the cursor.
**Fix:** Replaced all `contentEditable` elements with native `<input>` (single-line) and `<textarea>` (multi-line) elements. Native inputs have no cursor conflict with React.
**Files changed:** `EditableText` component (or equivalent inline component in site page)

---

#### Bug 2: Save failing with 403 Forbidden — `session siteSlug "undefined"`
**Symptom:** Every save attempt returned: `Save failed: Forbidden — session siteSlug "undefined" does not match "apex-pain-clinic"`
**Investigation path:**
1. First suspected wrong field name (`tenantId` vs `siteSlug`) in session callback → fixed callbacks
2. Still failing → discovered `siteSlug` was never on the `User` model at all
3. Added tenant lookup in `authorize` to fetch `slug` from `Tenant` by `user.tenantId`
4. Still failing → session showed only `{"email":"..."}` with no role or siteSlug
5. Added debug `console.log` to POST handler → confirmed session was bare

**Root cause (final):** `pages/api/site-content/[slug].js` was importing `authOptions` from `../auth/[...nextauth]`. That file only does `export default NextAuth(authOptions)` — it has **no named export**. So `authOptions` resolved to `undefined` silently, and `getServerSession` ran with bare NextAuth defaults (no JWT/session callbacks), meaning only `email` ever appeared in the session.

**Fix:** Changed import in `pages/api/site-content/[slug].js` line 5 from:
```js
import { authOptions } from '../auth/[...nextauth]'   // ❌ no named export
```
to:
```js
import { authOptions } from '../../../lib/authOptions' // ✅ correct
```

**Rule going forward:** Any API route calling `getServerSession` must import directly from `lib/authOptions`. Never import from `pages/api/auth/[...nextauth].js`.

**Files changed:** `lib/authOptions.js`, `pages/api/site-content/[slug].js`

---

#### Feature: Sign Out button
**Added to:** `pages/admin/index.js`
**Implementation:** `signOut({ callbackUrl: '/login' })` from `next-auth/react`, red button top-right of dashboard header row.

---

## Open Items / Next Steps

- [ ] Inline editing sidebar (font controls, image upload, advanced options)
- [ ] Client deletion flow in admin dashboard
- [ ] Image upload support (heroImageUrl, logoUrl)
- [ ] Mobile QA pass on site editor
- [ ] Remove debug `console.log` lines from `pages/api/site-content/[slug].js` once confirmed stable
- [ ] SEO panel UI in edit mode
- [ ] Vercel deployment + environment variables setup
- [ ] AI chatbot assistant (deferred — cost dependent)

---

## Key Rules & Conventions

1. Always import `authOptions` from `lib/authOptions` directly — never from the NextAuth handler file.
2. Admin accounts have no `tenantId` — they bypass slug checks via `role === 'admin'`.
3. Client accounts get their `siteSlug` from the `Tenant` document looked up at login time.
4. Read file + SHA from GitHub before any edit — never write blind.
5. Restart `npm run dev` after any changes to `lib/authOptions.js` or API routes.
6. After sign-out/sign-in cycles during debugging, always verify session contents via the debug log before assuming the fix worked.
