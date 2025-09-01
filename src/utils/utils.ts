import type { CompletionsObject, openaiPrices } from "../types";
import data from "./priceData.json" with { type: "json" };

const { pricing } = data as { pricing: openaiPrices };

export function summarizeTokenUsageByModel(completions: CompletionsObject[]) {
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
				};
			}

			acc[curr.model].input_tokens += curr.input_tokens;
			acc[curr.model].output_tokens += curr.output_tokens;

			return acc;
		},
		{} as Record<string, { input_tokens: number; output_tokens: number }>,
	);
}

export function calculateTokenCost(
	model: string,
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

export function summarizeTokenUsageByModelWithCost(
	completions: CompletionsObject[],
) {
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
				curr.model,
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

export function formatCurrency(value: number, currency = "USD"): string {
	return value.toLocaleString("en-US", {
		style: "currency",
		currency,
	});
}
