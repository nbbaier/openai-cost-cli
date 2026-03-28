import type { CompletionsObject, openaiPrices } from "../types";
import data from "./price-data.json" with { type: "json" };

const { pricing } = data as { pricing: openaiPrices };

/**
 * Normalizes model IDs from the OpenAI Admin API to match pricing keys.
 * Removes date suffixes (-YYYY-MM-DD or -MMDD), -preview, -latest, etc.
 * if an exact match isn't found.
 */
export function normalizeModelId(modelId: string): string {
	if (pricing[modelId]) {
		return modelId;
	}

	// Try removing suffixes one by one until a match is found or no more suffixes
	let normalized = modelId;
	const suffixes = [
		/-\d{4}-\d{2}-\d{2}$/, // -2024-07-18
		/-\d{4}$/, // -0125
		/-(preview|latest|vision|chat|codex|max)$/, // -preview, etc.
	];

	let changed = true;
	while (changed) {
		changed = false;
		for (const suffix of suffixes) {
			const next = normalized.replace(suffix, "");
			if (next !== normalized) {
				normalized = next;
				changed = true;
				if (pricing[normalized]) return normalized;
				break; // Restart with the new normalized string
			}
		}
	}

	return normalized;
}

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
					normalized: normalizeModelId(curr.model),
				};
			}

			acc[curr.model].input_tokens += curr.input_tokens;
			acc[curr.model].output_tokens += curr.output_tokens;

			return acc;
		},
		{} as Record<
			string,
			{ input_tokens: number; output_tokens: number; normalized: string }
		>,
	);
}

export function calculateTokenCost(
	model: string,
	inputTokens: number,
	outputTokens: number,
): number {
	const normalizedModel = normalizeModelId(model);
	const modelPricing = pricing[normalizedModel];
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
					normalized: normalizeModelId(curr.model),
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
			{
				input_tokens: number;
				output_tokens: number;
				cost: number;
				normalized: string;
			}
		>,
	);
}

export function formatCurrency(value: number, currency = "USD"): string {
	return value.toLocaleString("en-US", {
		style: "currency",
		currency,
	});
}
