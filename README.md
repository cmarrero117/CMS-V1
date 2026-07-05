# CMS-V1

A white-label content management system built on Next.js, Vercel, and MongoDB.

## Stack
- **Next.js 14** — React framework, file-based routing, API routes
- **MongoDB + Mongoose** — Content and tenant storage
- **NextAuth.js** — Authentication with role-based access (admin / client)
- **Vercel** — Deployment and hosting

## Architecture
- `pages/admin/` — Admin-only views (manage clients, sites, content)
- `pages/client/` — Client-only views (edit their own site content)
- `pages/api/` — API routes for tenants, content, and auth
- `lib/models/` — Mongoose schemas: Tenant, User, ContentEntry
- `lib/db.js` — MongoDB connection singleton

## Getting Started
1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and fill in your values
3. Run `npm install`
4. Run `npm run dev`

## Environment Variables
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Random secret for NextAuth session encryption |
| `NEXTAUTH_URL` | Base URL of the app (e.g. http://localhost:3000) |
