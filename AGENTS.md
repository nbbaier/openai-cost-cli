# openai-cost-cli

Bun CLI reporting OpenAI org costs and token usage. Runs TypeScript directly via Bun (no build); use `bun`/`bunx` for all scripts and installs. Scripts live in `package.json`.

- **Writing or changing code**: read `CODING_STANDARDS.md` first.
- **Price data**: `src/utils/price-data.json` and `models-dev.json` are generated from models.dev by `bun run update-prices`. Regenerate them; never hand-edit.
- **Secrets**: `OPENAI_ADMIN_KEY` comes from `.env`, which Bun loads automatically (no `dotenv`). CLI runs hit the live org API with an admin key, so keep the key out of output and logs.
- **Done** means `bun run lint` and `bun run typecheck` both pass.
