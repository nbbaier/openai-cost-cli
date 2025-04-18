import { fetchCompletionsUsage } from "./api";
import { formatCurrency, getCurrentMonthStart } from "./dates";
import type { CompletionsObject } from "./types";

async function main() {
	try {
		// Get current month information
		const { startTimestamp, daysInMonth } = getCurrentMonthStart();

		// Fetch usage data
		const allResults = await fetchCompletionsUsage(startTimestamp, daysInMonth);

		// Filter for batch completions
		// const batchCompletions = allResults.filter((item) => item.batch);
		// console.log("Batch completions:", batchCompletions);

		const sumByModel = summarizeTokenUsageByModel(allResults);
		const sumByModelWithCost = summarizeTokenUsageByModelWithCost(allResults);

		console.log("Token usage by model:", sumByModel);
		// console.log("Token usage by model with cost:", sumByModelWithCost);
		// console.log(
		// 	"Total cost:",
		// 	formatCurrency(
		// 		Object.entries(sumByModelWithCost).reduce(
		// 			(acc, [model, { cost }]) => acc + cost,
		// 			0,
		// 		),
		// 	),
		// );
	} catch (error) {
		console.error("Error fetching token usage:", error);
	}
}

// Helper function to summarize token usage by model
function summarizeTokenUsageByModel(completions: CompletionsObject[]) {
	// Extract and sort model information
	const filteredResults = completions
		.map((item) => {
			const { model, input_tokens, output_tokens } = item;
			return { model, input_tokens, output_tokens };
		})
		.sort((a, b) => {
			if (a.model < b.model) return -1;
			if (a.model > b.model) return 1;
			return 0;
		});

	// Summarize by model
	return filteredResults.reduce(
		(acc, curr) => {
			if (!acc[curr.model]) {
				acc[curr.model] = {
					input_tokens: 0,
					output_tokens: 0,
				};
			}

			acc[curr.model].input_tokens += curr.input_tokens;
			acc[curr.model].output_tokens += curr.output_tokens;

			return acc;
		},
		{} as Record<string, { input_tokens: number; output_tokens: number }>,
	);
}

main();

import type { ProviderConfig } from "./types";

const url =
	"https://raw.githubusercontent.com/BerriAI/litellm/refs/heads/main/model_prices_and_context_window.json";

const res = await fetch(url);
const pricing = (await res.json()) as Record<string, ProviderConfig>;

function calculateTokenCost(
	model: keyof typeof pricing,
	inputTokens: number,
	outputTokens: number,
): number {
	const modelPricing = pricing[model];
	if (!modelPricing) {
		console.warn(`No pricing found for model: ${model}`);
		return 0;
	}

	// Convert token counts to thousands (pricing is per 1Million tokens)
	const inputCost = inputTokens * modelPricing.input_cost_per_token;
	const outputCost = outputTokens * modelPricing.output_cost_per_token;

	return inputCost + outputCost;
}

// Update the summarizeTokenUsageByModel function to include cost calculation
function summarizeTokenUsageByModelWithCost(completions: CompletionsObject[]) {
	// Extract and sort model information
	const filteredResults = completions
		.map((item) => {
			const { model, input_tokens, output_tokens } = item;
			return { model, input_tokens, output_tokens };
		})
		.sort((a, b) => {
			if (a.model < b.model) return -1;
			if (a.model > b.model) return 1;
			return 0;
		});

	return filteredResults.reduce(
		(acc, curr) => {
			if (!acc[curr.model]) {
				acc[curr.model] = {
					input_tokens: 0,
					output_tokens: 0,
					cost: 0,
				};
			}

			acc[curr.model].input_tokens += curr.input_tokens;
			acc[curr.model].output_tokens += curr.output_tokens;
			acc[curr.model].cost = calculateTokenCost(
				curr.model as keyof typeof pricing,
				acc[curr.model].input_tokens,
				acc[curr.model].output_tokens,
			);

			return acc;
		},
		{} as Record<
			string,
			{ input_tokens: number; output_tokens: number; cost: number }
		>,
	);
}
