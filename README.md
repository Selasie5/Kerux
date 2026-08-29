# Kērux frontend

The owner control room for programmable AI-agent accounts. Built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, and Clerk.

## Start locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

The UI opens with realistic sandbox data when Clerk and the backend are not configured. Add the environment variables below to enable owner authentication and connect the API:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

When Clerk keys are present, `proxy.ts` protects the application. `createOwnerClient()` in `lib/api/server.ts` forwards the Clerk session token to owner endpoints as a bearer token.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

The generated product-wide visual direction is stored in `design-system/kerux/MASTER.md`.
