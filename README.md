# Kērux frontend

The owner control room for programmable AI-agent accounts. Built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, and Clerk.

## Start locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

The dashboard defaults to the deployed Kērux API. Add Clerk development keys to enable protected owner routes:

```env
NEXT_PUBLIC_API_URL=https://kerux-backend.onrender.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

You can also let the Clerk CLI create an accountless development application and write the keys locally:

```bash
npx -y clerk@latest init --framework next -y --accountless
```

When Clerk keys are present, `proxy.ts` protects the dashboard while leaving `/sign-in` and `/sign-up` public. Browser requests use `useAuth().getToken()` for the bearer header, and the live EventSource sends the same session token in its query string. The stream is renewed with a fresh token and the REST ledger is refetched whenever it reconnects.

For backend development without Clerk, run the API with `DEV_OWNER_ID=dev_owner` and point `NEXT_PUBLIC_API_URL` at `http://localhost:8000`. The UI deliberately shows live API errors instead of substituting fake activity.

Money values stay as strings at the API boundary and use `decimal.js` for aggregate arithmetic. Backend timestamps without a timezone suffix are treated as UTC.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

The product-wide visual direction is stored in `design-system/kerux/MASTER.md`.
