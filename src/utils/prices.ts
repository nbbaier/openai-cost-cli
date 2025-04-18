import type { openaiPrices, ProviderConfig } from "../types";

const url =
	"https://raw.githubusercontent.com/BerriAI/litellm/refs/heads/main/model_prices_and_context_window.json";

const res = await fetch(url);
const pricing = (await res.json()) as Record<string, ProviderConfig>;

const openai: openaiPrices = Object.fromEntries(
	Object.entries(pricing)
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

console.log(JSON.stringify(openai));
