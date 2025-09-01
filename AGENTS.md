# Repository Guidelines

## Project Structure & Module Organization
- `src/index.ts`: CLI entry; runs monthly cost calculation.
- `src/api.ts`: OpenAI org API client using `betterFetch` and `Bun.env`.
- `src/getMonthlyCost.ts`: Orchestrates monthly total cost.
- `src/tokenUsage.ts`, `src/tokenCosts.ts`: Token usage summaries (by model, with cost).
- `src/utils/`: Shared helpers (`dates.ts`, `utils.ts`, `priceData.ts`).
- No build artifacts; TypeScript runs directly via Bun (ESM).

## Build, Test, and Development Commands
- Install: `bun install`
- Cost (default CLI): `bun run cost` (runs `src/index.ts`)
- Token usage: `bun run tokens`
- Token costs: `bun run token-costs`
- Lint/format check: `bunx biome check .`
- Auto-format: `bunx biome format . --write`

## Coding Style & Naming Conventions
- Language: TypeScript (ES modules). Prefer small, pure functions.
- Indentation: tabs (configured in `biome.json`).
- Quotes: double quotes (Biome-enforced).
- Filenames: `camelCase.ts` (e.g., `getMonthlyCost.ts`); utilities in `src/utils/`.
- Imports: use relative paths within `src/`; keep barrel files minimal.

## Testing Guidelines
- No test runner is configured yet. If adding tests:
  - Place tests alongside code as `*.test.ts` in `src/`.
  - Use `bun test` or Vitest; avoid real network calls (mock `fetch`/`betterFetch`).
  - Prefer deterministic tests; validate sample outputs for token and cost summaries.

## Commit & Pull Request Guidelines
- Commit style: Conventional Commits (e.g., `feat: ...`, `refactor: ...`, `chore: ...`) as seen in history.
- PRs should include:
  - Clear description and rationale; link related issues.
  - How to run (commands) and expected output snippets.
  - Notes on breaking changes or config needs.
  - Kept small and focused; update docs when behavior changes.

## Security & Configuration Tips
- Secrets: set `OPENAI_ADMIN_KEY` in `.env` (gitignored) and never commit keys.
- Runtime: Bun reads env via `Bun.env`; ensure the key has least privilege.
- Safety: don’t log secrets; add sample `.env.example` in PRs if adding vars.
- Networking: commands call OpenAI APIs; be mindful of rate limits and usage.

