# Contributing to TrackFlow V2

Thank you for contributing! This guide keeps changes consistent and easy to review.

## Quick Start
- Requirements: Node 18+, npm 9+, Git.
- Install: `npm ci`
- Develop: `npm run dev` (http://localhost:3000)
- Lint: `npm run lint`
- Test: `npm test`, `npm run test:watch`, `npm run test:ci`
- Build/Run: `npm run build` then `npm start`
- Env: Create `.env.local` (Supabase, Stripe, Slack). Never commit secrets. See `DEPLOYMENT_GUIDE.md`.

## Branches & Commits
- Branch names: `feature/<area>-<short-desc>`, `fix/<bug>-<short-desc>`, `chore/<scope>-<short-desc>`, `docs/<area>-<short-desc>`.
- Conventional Commits (used in history): `feat:`, `fix:`, `perf:`, `docs:`, `chore:`.
  - Examples: `feat(api): normalize error handling`, `perf: major LCP/CLS improvements`.

## Code Style
- TypeScript (strict). Use alias `@/` (e.g., `@/lib/...`).
- Components: PascalCase in `components/` (e.g., `UserCard.tsx`).
- Hooks: `useSomething.ts(x)` in `hooks/`.
- App Router: kebab-case route segments; add `"use client"` when required.
- Run `npm run lint` and resolve warnings before opening a PR. See `AGENTS.md` for more.

## Tests
- Framework: Jest + Testing Library (`jsdom`).
- Location: `__tests__/` mirroring source; name `*.test.ts(x)`.
- Coverage: Global 70% thresholds enforced in CI (`npm run test:ci`).
- Mocks: Next router and Supabase are pre-configured in `jest.setup.js`.

## Pull Requests
- Use the PR template; include a clear summary and linked issues (`Closes #123`).
- Add screenshots/GIFs for UI changes.
- Include/Update tests and docs where applicable.
- Ensure `lint` and `test:ci` pass locally.
