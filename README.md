# Saniuzzaman Robin — Portfolio

Personal portfolio and résumé site built with Next.js (App Router), React 19, Tailwind CSS v4 and Framer Motion. Deployed on Vercel.

## Development

```bash
npm install
cp .env.example .env.local   # optional: override site URL / GA ID
npm run dev                  # http://localhost:3000
```

## Scripts

| Command                       | Purpose                                |
| ----------------------------- | -------------------------------------- |
| `npm run build` / `start`     | Production build / serve               |
| `npm run lint` / `type-check` | ESLint / TypeScript                    |
| `npm run format`              | Prettier (with Tailwind class sorting) |
| `npm run test:run`            | Unit tests (Vitest + Testing Library)  |
| `npm run test:e2e`            | E2E tests (Playwright, needs a build)  |

Content (CV, projects, skills) lives in `src/lib/cv-data.ts` and `src/lib/data/`.
