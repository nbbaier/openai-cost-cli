import { betterFetch } from "@better-fetch/fetch";
import type { CompletionsObject, CostsObject, Page } from "./types";
import { z } from "zod";

// Environment validation
const envSchema = z.object({
	OPENAI_ADMIN_KEY: z.string().min(1),
});

// Validate environment variables
try {
	envSchema.parse(Bun.env);
} catch (error) {
	console.error("Environment validation failed:", error);
	throw new Error("Required environment variables are missing");
}

/**
 * Fetch organization costs for a given time period
 */
export async function fetchOrganizationCosts(
	startTime: number,
	days: number,
): Promise<number> {
	const { data, error } = await betterFetch<Page<CostsObject>>(
		`https://api.openai.com/v1/organization/costs?start_time=${startTime}&limit=${days}`,
		{
			headers: { Authorization: `Bearer ${Bun.env.OPENAI_ADMIN_KEY}` },
		},
	);

	if (error) {
		console.error("Error fetching organization costs:", error);
		throw new Error(`Failed to fetch organization costs: ${error.message}`);
	}

	if (!data) {
		return 0;
	}

	// Calculate total cost
	const totalCost = data.data
		.flatMap((bucket) => bucket.results)
		.flatMap((costs) => costs.amount)
		.reduce((sum, { value }) => sum + value, 0);

	return totalCost;
}

/**
 * Fetch organization completions usage for a given time period
 */
export async function fetchCompletionsUsage(
	startTime: number,
	days: number,
): Promise<CompletionsObject[]> {
	const { data, error } = await betterFetch<Page<CompletionsObject>>(
		`https://api.openai.com/v1/organization/usage/completions?start_time=${startTime}&group_by=project_id&group_by=model&group_by=batch&limit=${days}`,
		{
			headers: { Authorization: `Bearer ${Bun.env.OPENAI_ADMIN_KEY}` },
		},
	);

	if (error) {
		console.error("Error fetching completions usage:", error);
		throw new Error(`Failed to fetch completions usage: ${error.message}`);
	}

	if (!data) {
		return [];
	}

	// Flatten results
	const allResults: CompletionsObject[] = [];
	for (const bucket of data.data) {
		allResults.push(...bucket.results);
	}

	return allResults;
}
