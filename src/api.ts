import { betterFetch } from "@better-fetch/fetch";
import { z } from "zod";
import type { CompletionsObject, CostsObject, Page } from "./types";

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
	let totalCost = 0;
	let page: string | null = null;

	do {
		const url: string = page
			? `https://api.openai.com/v1/organization/costs?start_time=${startTime}&limit=${days}&page=${page}`
			: `https://api.openai.com/v1/organization/costs?start_time=${startTime}&limit=${days}`;

		const { data, error } = await betterFetch<Page<CostsObject>>(url, {
			headers: { Authorization: `Bearer ${Bun.env.OPENAI_ADMIN_KEY}` },
		});

		if (error) {
			console.error("Error fetching organization costs:", error);
			if (error.status === 401 || error.status === 403) {
				throw new Error(
					"Missing or invalid OPENAI_ADMIN_KEY. Please check your environment variables.",
				);
			}
			throw new Error(`Failed to fetch organization costs: ${error.message}`);
		}

		if (!data) {
			break;
		}

		// Calculate cost for this page
		const pageCost = data.data
			.flatMap((bucket) => bucket.results)
			.flatMap((costs) => costs.amount)
			.reduce((sum, { value }) => sum + value, 0);

		totalCost += pageCost;
		page = data.has_more ? data.next_page : null;
	} while (page);

	return totalCost;
}

/**
 * Fetch organization completions usage for a given time period
 */
export async function fetchCompletionsUsage(
	startTime: number,
	days: number,
): Promise<CompletionsObject[]> {
	const allResults: CompletionsObject[] = [];
	let page: string | null = null;

	do {
		const url: string = page
			? `https://api.openai.com/v1/organization/usage/completions?start_time=${startTime}&group_by=project_id&group_by=model&group_by=batch&limit=${days}&page=${page}`
			: `https://api.openai.com/v1/organization/usage/completions?start_time=${startTime}&group_by=project_id&group_by=model&group_by=batch&limit=${days}`;

		const { data, error } = await betterFetch<Page<CompletionsObject>>(url, {
			headers: { Authorization: `Bearer ${Bun.env.OPENAI_ADMIN_KEY}` },
		});

		if (error) {
			console.error("Error fetching completions usage:", error);
			if (error.status === 401 || error.status === 403) {
				throw new Error(
					"Missing or invalid OPENAI_ADMIN_KEY. Please check your environment variables.",
				);
			}
			throw new Error(`Failed to fetch completions usage: ${error.message}`);
		}

		if (!data) {
			break;
		}

		// Flatten results for this page
		for (const bucket of data.data) {
			allResults.push(...bucket.results);
		}

		page = data.has_more ? data.next_page : null;
	} while (page);

	return allResults;
}
