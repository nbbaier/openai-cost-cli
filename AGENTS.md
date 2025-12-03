# Repository Guidelines

## Commands
- `bun install` - Install dependencies
- `bun run cost` - Run monthly cost calculation (default CLI)
- `bun run tokens` - Show token usage summary
- `bun run token-costs` - Show token costs breakdown
- `bun test` - Run tests (single test: `bun test path/to/file.test.ts`)
- `bunx biome check .` - Lint/format check
- `bunx biome format . --write` - Auto-format code

## Code Style
- TypeScript ESM, Bun runtime, tabs, double quotes
- Small pure functions, descriptive names, camelCase files
- Relative imports within `src/`, no barrel files
- Error handling: throw descriptive errors, handle API failures gracefully
- Types: explicit return types, avoid `any`, use `zod` for API validation

## Project Structure
- `src/index.ts` - CLI entry point
- `src/api.ts` - OpenAI API client with `betterFetch`
- `src/getMonthlyCost.ts` - Cost orchestration
- `src/tokenUsage.ts`, `src/tokenCosts.ts` - Usage summaries
- `src/utils/` - Shared utilities (dates, utils, priceData)
- No build step - TypeScript runs directly via Bun

## Testing
- Place `*.test.ts` files alongside source
- Mock external APIs (`betterFetch`), avoid network calls
- Use `bun test` with descriptive test names
- Test deterministic outputs, edge cases, error scenarios

## Security
- `OPENAI_ADMIN_KEY` in `.env` (gitignored)
- Never log secrets, use least privilege API keys
- Mind OpenAI rate limits and usage costs

