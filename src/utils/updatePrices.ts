import type { openaiPrices, ProviderConfig } from "../types";

const filename = "./src/utils/priceData.json";

const url =
	"https://raw.githubusercontent.com/BerriAI/litellm/refs/heads/main/model_prices_and_context_window.json";

const res = await fetch(url);
const data = (await res.json()) as Record<string, ProviderConfig>;

const pricing: openaiPrices = Object.fromEntries(
	Object.entries(data)
		.filter(
			(entry) =>
				entry[1].litellm_provider === "openai" &&
				["chat", "completion"].includes(entry[1].mode),
		)
		.map((entry) => {
			const { output_cost_per_token, input_cost_per_token } = entry[1];
			return [entry[0], { output_cost_per_token, input_cost_per_token }];
		}),
);

await Bun.write(
	filename,
	JSON.stringify({ updatedAt: Date.now(), pricing }, null, 2),
);
