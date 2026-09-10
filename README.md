# KooMi

KooMi is Hussain's private career workspace and public software portfolio.

## Stack

Next.js, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Auth.js, React Three Fiber, Three.js, Framer Motion and Zod.

## Local setup

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env` and fill in the values.
3. Install dependencies with `npm install`.
4. Generate Prisma Client with `npm run db:generate`.
5. Apply the schema with `npx prisma db push` for local development.
6. Start with `npm run dev`.

## Production notes

- Never commit `.env` or secrets.
- Set a strong `AUTH_SECRET` and the real `OWNER_EMAIL`.
- Configure Google OAuth only if Google login is desired.
- Configure durable private document storage before production uploads.
- Run CI before deployment.
- Only content explicitly marked published is exposed by public routes.

Personal credentials, achievements, education, employers and other biographical facts are intentionally not fabricated in seed data.
