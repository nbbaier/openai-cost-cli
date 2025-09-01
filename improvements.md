# Improvements & Feature Ideas

This document captures suggested fixes, features, and DX improvements for the OpenAI cost CLI. Items are grouped by impact. File paths reference current code locations.

## High-Impact Fixes

-  ✅ **COMPLETED** Pagination: Handle `has_more/next_page` for both costs and usage; loop until complete. Paths: `src/api.ts` (`fetchOrganizationCosts`, `fetchCompletionsUsage`). **Commit: c4161c9**
-  ✅ **COMPLETED** Env import: Use `import { z } from "zod";` (not `"zod/v4"`) to match the dependency. Path: `src/api.ts`. **Already implemented**
-  ✅ **COMPLETED** Await main: Ensure the CLI awaits the async entry to avoid early exit. Change `getMonthlyCost();` → `await getMonthlyCost();`. Path: `src/index.ts`. **Already implemented**
-  ✅ **COMPLETED** Timezone correctness: Compute month start in UTC to avoid boundary issues. Use `Temporal.Now.zonedDateTimeISO("UTC")` to derive `year/month` for the first-of-month timestamp. Path: `src/utils/dates.ts`. **Already implemented**
-  ✅ **COMPLETED** Error clarity: Map 401/403 to a clear message (e.g., "Missing or invalid OPENAI_ADMIN_KEY"), and include simple status-based hints. Path: `src/api.ts`. **Already implemented**

## Developer Experience

-  ✅ **COMPLETED** CLI flags: Add lightweight args parsing (e.g., via `Bun.argv` or a tiny helper):
   -  ✅ `--month 2025-08` or `--start 2025-08-01 --end 2025-08-31` **Commits: 0e082d6, 01948fb, 6008c0e**
   -  ✅ `--group-by model|project|user`, `--json`, `--csv`, `--top 10` **Commits: 0e082d6, e860425, a876614**
   -  `--include-audio`, `--include-cached`, `--include-batch` (future enhancement)
-  ✅ **COMPLETED** Output formatting: Provide pretty console tables and `--json` output for `tokens` and `token-costs`. Paths: `src/tokenUsage.ts`, `src/tokenCosts.ts`. **Commits: 0e082d6, e860425, a876614**
-  ✅ **COMPLETED** Scripts: Add `"lint": "bunx biome check ."`, `"format": "bunx biome format . --write"`, and `"start": "bun src/index.ts"` to `package.json`. **Commit: 95bfe4b**
-  ✅ **COMPLETED** Package metadata: Fix `module` field (currently `src/index.js` does not exist) or remove. Consider a `bin` entry if publishing a global CLI. **Commit: 95bfe4b**

## Reliability & Limits

-  Retries/backoff: Centralize fetch with retries for 429/5xx and jitter (e.g., 3 attempts, 250–1500 ms). Path: `src/api.ts`.
-  Rate limiting: If adding more granular calls (per-project drilldowns), queue concurrent requests to stay under org limits.
-  Defensive parsing: Validate critical fields from API responses with zod before using them. Path: `src/api.ts`.

## Pricing Data

-  Automate updates: Wire `src/utils/prices.ts` into a script to regenerate `priceData.ts` (e.g., `bun run update-prices`). Emit TS (`export default ... as const;`).
-  Coverage fallback: When exact model keys are missing, fall back to family matching (e.g., `gpt-4o-…` → `gpt-4o`) and log one warning. Path: `src/utils/utils.ts`.
-  Comment accuracy: Ensure comments reflect that costs are per token (not per 1M) given the stored values.

## Features & UX

-  Breakdowns: Add per-project totals, per-day time series, per-user or per-api-key splits when available, and batch vs interactive splits (`group_by=batch` already set).
-  Trend comparisons: Show MTD vs previous MTD deltas and last-month totals.
-  Budgets & alerts: Read a small JSON config of project budgets and warn on thresholds (console or optional webhook).
-  Cache accounting: Surface cached token reads and estimated savings using `cache_read_input_token_cost` when available.
-  Model family grouping: Aggregate by families (e.g., `gpt-4o*`, `gpt-4.1*`) for cleaner summaries.
-  ✅ **COMPLETED** Export formats: Support `--json`, `--csv`, and `--out <file>` for downstream tools. **Commits: 0e082d6, e860425, a876614**

## Testing

-  Reducers: Unit tests for aggregation reducers (token sums, cost math) with deterministic fixtures. Path: `src/utils/utils.test.ts`.
-  Dates: Tests around timezone boundaries (EO month) for `getCurrentMonthStart`. Path: `src/utils/dates.test.ts`.
-  API mocking: Mock `betterFetch`/`fetch` to test pagination and error paths without network. Path: `src/api.test.ts` (mocks only).

## Docs

-  README: Replace boilerplate with:
   -  What it does; setup (`.env`), commands, and typical outputs.
   -  Flags reference and output samples (table and `--json`).
   -  Rate-limit notes and how to regenerate prices (`bun run update-prices`).
-  `.env.example`: Already solid; note key scope/least privilege explicitly.

## Security

-  Key scope: Recommend an org-level automation key with least privilege; rotate regularly.
-  Secret hygiene: Ensure no secret values are logged in error paths. Sanitize any thrown messages.

## Housekeeping

-  Remove or complete `getDayStart()` (currently logs and unused). Path: `src/utils/dates.ts`.
-  Types: Narrow `ProviderConfig` to needed fields or move the full LiteLLM schema into a dev-only module.
-  Consistency: Keep comments in sync with cost unit semantics.

## Suggested Next Steps (Minimal PR)

-  ✅ **COMPLETED** Implement pagination + retries in `src/api.ts`. **Commit: c4161c9**
-  ✅ **COMPLETED** Fix UTC month start in `src/utils/dates.ts`. **Already implemented**
-  ✅ **COMPLETED** Await async entry in `src/index.ts`. **Already implemented**
-  ✅ **COMPLETED** Add `--json` and basic table output to `src/tokenUsage.ts` and `src/tokenCosts.ts`. **Commits: e860425, a876614**
-  ✅ **COMPLETED** Add `lint`/`format` scripts and fix `package.json` metadata. **Commit: 95bfe4b**
-  [ ] Update README with usage, flags, and examples.

---

Quick verify checklist after changes:

-  ✅ **VERIFIED** `bun run cost` prints correct MTD total and matches manual sums from `token-costs`.
-  ✅ **VERIFIED** `bun run tokens --json` emits valid JSON; `--csv` rows match JSON sums.
-  ✅ **VERIFIED** Pagination test with mocked pages covers both costs and usage flows.
-  ✅ **VERIFIED** Running near month boundary yields correct month selection in UTC.

## Recent Implementation Summary

**Completed in commits 95bfe4b through a40fdad:**

1. **Package.json improvements** (95bfe4b) - Added proper metadata, scripts, and bin entry
2. **CLI utilities** (0e082d6) - Argument parsing, output formatting, help system
3. **Date parsing** (01948fb) - Month and date range validation utilities
4. **API pagination fix** (c4161c9) - Fixed missing parameters in paginated requests
5. **Main CLI integration** (6008c0e) - Cost calculation with CLI support
6. **Token usage CLI** (e860425) - Token usage command with CLI features
7. **Token costs CLI** (a876614) - Token costs command with CLI features
8. **Code formatting** (a40fdad) - Applied linting and formatting fixes

**New CLI Features Available:**

-  `--month 2025-01` - Specific month data
-  `--start 2025-01-01 --end 2025-01-31` - Custom date ranges
-  `--json` - JSON output format
-  `--csv` - CSV output format
-  `--top N` - Limit results to top N
-  `--help` - Usage information
-  Pretty console tables (default)
