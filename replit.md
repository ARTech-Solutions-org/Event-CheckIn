# Gatepass — QR Code Event Check-in System

A mobile-first web app for event check-in using QR code scanning. Organizers log in, scan attendee QR codes, prevent duplicate check-ins, and monitor live attendance counts.

## Run & Operate

- **API Server** workflow — `PORT=8080 pnpm --filter @workspace/api-server run dev` (port 8080)
- **Start application** workflow — `PORT=5000 BASE_PATH=/ pnpm --filter @workspace/event-checkin run dev` (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required secret: `NEON_DATABASE_URL` — Neon PostgreSQL connection string (set as Replit Secret)

## Vercel deployment

- The root `vercel.json` builds the frontend with `pnpm run vercel-build` and routes `/api/*` to `api/index.ts`.
- Set `NEON_DATABASE_URL` in the Vercel project environment variables for the API.
- Set `VITE_API_URL` to the deployed API base URL when the API and frontend are deployed as separate Vercel projects. If using the root configuration's `/api` rewrite, use `/api` for same-deployment requests.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
