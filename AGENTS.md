# Repository Guidelines

## Project Structure & Module Organization
- App code lives in `src/`:
  - `components/` (PascalCase components), `pages/` (route views), `services/` (Axios APIs), `store/` (Redux Toolkit slices), `hooks/`, `types/`.
- Static assets: `public/` (served as-is). Build output: `build/`.
- Specs and docs: `design/` (API_SPECIFICATION.md, IMPLEMENTATION_GUIDE.md, etc.).
- Tests belong under `src/` next to code (e.g., `ComponentName.test.tsx`) or in `src/__tests__/`.

## Build, Test, and Development Commands
- `npm start` — start CRA dev server with hot reload.
- `npm run build` — production build to `build/`.
- `npm test` — run Jest in watch mode. Add `-- --coverage` for coverage.
- `./start.sh` — convenience script (bash) to bootstrap and start locally.

## Coding Style & Naming Conventions
- Language: TypeScript (`strict: true`). Indent 2 spaces.
- React components: PascalCase files (e.g., `AppLayout.tsx`). Hooks: `useXxx.ts` in `src/hooks/`.
- Redux slices: `SomethingSlice.ts` in `src/store/slices/`; export actions/selectors.
- Services: one module per domain in `src/services/` using the shared `api.ts` client.
- Linting: CRA ESLint config (`react-app`, `react-app/jest`). Fix warnings before PR.

## Testing Guidelines
- Framework: Jest (via `react-scripts`) + React Testing Library.
- File names: `*.test.ts` / `*.test.tsx` near the unit under test.
- Focus on reducers, hooks, and critical UI states. Keep tests deterministic (mock network via Axios mocks).
- Run `npm test` locally; ensure type checks pass (`tsc --noEmit`).

## Commit & Pull Request Guidelines
- Commits: imperative, concise; prefer Conventional Commits (e.g., `feat:`, `fix:`, `docs:`) when possible.
- PRs must include: clear description, linked issue, screenshots/GIFs for UI, and notes on testing. Ensure `npm run build` and `npm test` succeed.

## Security & Configuration Tips
- Do not commit secrets. Configure environment in `.env.local` (ignored by Git):
  - `REACT_APP_API_BASE_URL=https://your-api.example.com/api/v2`
  - `REACT_APP_API_KEY=xxxx`
- The shared Axios client is in `src/services/api.ts`; avoid hardcoded URLs elsewhere.
