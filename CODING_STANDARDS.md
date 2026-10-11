# Coding Standards

Biome enforces formatting and lint; this file covers what it can't.

## Code
- Kebab-case filenames; relative imports within `src/`; no barrel files.
- Explicit return types on exported functions.
- Validate every external API response with `zod` before use (see `src/api.ts`, `src/utils/models-dev-types.ts`).
- File I/O via `Bun.file` / `Bun.write`, not `node:fs`.
- Throw errors that name the failing request or input.

## Tests (when adding them)
- `*.test.ts` beside the source, run with `bun test`.
- Mock `betterFetch`; tests make zero network calls.
