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
6. Run `npm run db:seed` to load the supplied source-backed profile, education, skills and certificate records as **DRAFT** content.
7. Start with `npm run dev`.

## Production notes

- Never commit `.env` or secrets.
- Set a strong `AUTH_SECRET` and the real `OWNER_EMAIL`.
- Configure Google OAuth only if Google login is desired.
- Configure durable private document storage before production uploads.
- Run CI before deployment.
- Only content explicitly marked published is exposed by public routes.

## Source-backed content

The seed data is limited to information supplied in the owner's resume, academic grade card, certificates and internship documents. It deliberately keeps imported records in draft state so nothing is publicly published without owner approval. Uploaded binary assets still need to be placed in the application's configured private/public storage before their `assetUrl`, `documentUrl` or `pdfUrl` fields are populated.
