# Portfolio — project notes

Next.js 16 App Router · React 19 (React Compiler on) · Tailwind v4 (CSS-first, no tailwind.config) · Framer Motion (`LazyMotion` + `m`) · lucide-react · TypeScript strict. npm only.

## Commands

- Dev: `npm run dev` · Build: `npm run build`
- Verify (narrowest first): `npx eslint <files>` · `npm run type-check` · `npx vitest run <file>`
- E2E: `npm run test:e2e` (Playwright, starts `npm run start`, so build first)
- Hooks: pre-commit = lint-staged + unit tests; pre-push = lint + type-check; commits must be Conventional (commitlint).

## Layout

- `src/app/[lang]/` — routes: `/`, `/projects`, `/resume` (plus `layout`, `template`, `error`, `not-found`, `[...rest]` catch-all 404). `src/app/` keeps `manifest.ts`, `robots.ts`, `sitemap.ts`.
- `src/i18n/` — `config.ts` (locales `en`/`bn`/`ar`, `LOCALE_META` dir, `localePath`), `messages/{en,bn,ar}.ts` (UI strings), `content/{bn,ar}.ts` (text overrides for CV/projects/skills), `server.ts` (`getDictionary`), `provider.tsx` (`useDictionary`), `use-locale.ts`.
- `src/proxy.ts` — 410s for removed sections, rewrites unprefixed URLs to `/en/*`, 308s `/en/*` to unprefixed.
- `src/components/{home,projects,resume}/` — page sections. `layout/` — shell, navbar, command menu, footer. `ui/` — primitives (button, badge, section, motion, spotlight-card). `reusable/` — theme provider, GA, JSON-LD, skip link.
- `src/lib/` — **content**: `cv-data.ts` (CV), `data/projects.ts`, `data/skills.ts`; **config**: `site.ts` (URL, nav, GA, OG image), `metadata.ts` (`pageMetadata`), `schema.ts` (JSON-LD), `theme.ts`; helpers `cn.ts`, `use-copy-to-clipboard.ts`.
- `src/app/globals.css` — all design tokens (`:root` / `[data-theme]` CSS vars mapped in `@theme`), `.btn-*`, `.enter-*` entrance classes, print styles.

## Conventions

- Import via `@/…`. Prettier: single quotes, semicolons, width 100, Tailwind class sorting.
- Colors/spacing come from tokens in `globals.css` (`bg-surface`, `text-fg-muted`, `border-line`, `text-primary`…); avoid raw hex in components.
- Animation: above-the-fold uses CSS `<Enter>`; below-fold uses `Stagger`/`StaggerItem` (plus `WordReveal`, `CountUp`, `DrawLine`, `ScrollRail`) from `components/ui/motion.tsx`. Use `m.*` (not `motion.*`) — `LazyMotion` loads `domMax` from `motion-features.ts`.
- Pages are statically prerendered; keep them server components and push `'use client'` down to leaf components.
- Text content changes go in `src/lib/cv-data.ts` / `src/lib/data/*`, not in components. UI strings go in `src/i18n/messages/*` (all three locales). Adding/reordering items in the English data requires the same change in `src/i18n/content/{bn,ar}.ts` (`dictionary.test.ts` catches drift).
- i18n: English is unprefixed, `bn`/`ar` are prefixed. Server code uses `getDictionary(lang)`; client code uses `useDictionary()` (never import `i18n/server` in client code). Internal links use `LocaleLink` with an unprefixed `href`; cross-locale links must be plain `<a>`.
- RTL (`ar`): use logical classes (`ms/ps/start/end/border-s/rounded-s/text-start`), `rtl:` for the rest (`rtl:-scale-x-100` on directional arrows). Motion `left`/`right` mean inline start/end. Wrap Latin-only strings shown in RTL text (names, companies, phone) in `<bdi>` or `dir="ltr"`.
- CSP lives in `next.config.ts`; adding any third-party origin (scripts, images, fonts) requires updating it.

## Don't read

`node_modules`, `.next`, `package-lock.json`, `tsconfig.tsbuildinfo`, `public/*.pdf|png|ico`, `playwright-report`, `test-results`, `coverage`.
