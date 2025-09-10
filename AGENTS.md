# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js 14 App Router (routes, layouts, API).
- `components/`: Reusable UI (e.g., `ErrorBoundary.tsx`).
- `hooks/`: React hooks (prefix with `use*`).
- `lib/`: Utilities, clients, helpers (path alias `@/` → repo root).
- `types/`: Shared TypeScript types.
- `public/`: Static assets.
- `__tests__/`: Unit/integration tests (mirrors `components/`, `lib/`).
- `scripts/`, `docs/`, `supabase/`, `chrome-extension/`: tooling, docs, backend config, extension.

## Build, Test, and Development Commands
- `npm run dev`: Start local dev server.
- `npm run build`: Production build.
- `npm start`: Serve production build.
- `npm run lint`: ESLint (Next.js config).
- `npm test`: Run Jest.
- `npm run test:watch`: Jest watch mode.
- `npm run test:ci`: CI mode with coverage.

Requirements: Node 18+. Configure secrets in `.env.local` (e.g., Supabase, Stripe, Slack). Do not commit secrets.

## Coding Style & Naming Conventions
- Language: TypeScript, strict mode (`tsconfig.json`).
- Imports: Use alias `@/` (e.g., `import x from '@/lib/x'`).
- Components: PascalCase files in `components/` (e.g., `UserCard.tsx`).
- Hooks: `useSomething.ts` in `hooks/`.
- App routes: folder/file names kebab-case; add `"use client"` where needed.
- Run `npm run lint` and address warnings before PRs.

## Testing Guidelines
- Framework: Jest + Testing Library (`jsdom`).
- Location: `__tests__/` mirroring source structure; name files `*.test.ts(x)`.
- Coverage: Global 70% thresholds (see `jest.config.js`).
- Setup: Auto-mocks for Next router and Supabase in `jest.setup.js`.
- Commands: `npm test` locally; `npm run test:ci` to check coverage.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (e.g., `feat:`, `fix:`, `chore:`, `docs:`, `perf:`). Examples in `git log`.
- PRs must include:
  - Clear description and linked issues (e.g., `Closes #123`).
  - Screenshots/GIFs for UI changes.
  - Tests for new/changed behavior; updated docs when relevant.
  - Passing `lint` and `test` locally.

## Security & Configuration Tips
- Keep `.env.local` local; rotate leaked keys.
- Be cautious in `middleware.ts` and API routes; validate inputs (prefer `zod`).
- Avoid storing PII in logs; scrub errors before sending to analytics.
