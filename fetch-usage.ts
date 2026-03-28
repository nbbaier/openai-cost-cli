import { betterFetch } from "@better-fetch/fetch";
import type { Bucket, CompletionsObject, Page } from "./src/types";
import { getCurrentMonthStart } from "./src/utils/dates";

export async function fetchCompletionsUsage(
	startTime: number,
): Promise<NonEmptyBucket[]> {
	const buckets: NonEmptyBucket[] = [];
	let page: string | null = null;
	let pageCount = 0;

	console.log(
		`[fetchCompletionsUsage] Fetching completions usage. startTime=${startTime} until now`,
	);

	do {
		const url: string = page
			? `https://api.openai.com/v1/organization/usage/completions?start_time=${startTime}&group_by=model&group_by=batch&bucket_width=1h&page=${page}`
			: //
				`https://api.openai.com/v1/organization/usage/completions?start_time=${startTime}&group_by=model&group_by=batch&bucket_width=1h`;

		console.log(
			`[fetchCompletionsUsage] Fetching page ${pageCount + 1}${page ? ` (page token: ${page})` : ""}`,
		);
		console.log(`[fetchCompletionsUsage] Request URL: ${url}`);

		const { data, error } = await betterFetch<Page<CompletionsObject>>(url, {
			headers: { Authorization: `Bearer ${Bun.env.OPENAI_ADMIN_KEY}` },
		});

		if (error) {
			console.error(
				"[fetchCompletionsUsage] Error fetching completions usage:",
				error,
			);
			if (error.status === 401 || error.status === 403) {
				throw new Error(
					"Missing or invalid OPENAI_ADMIN_KEY. Please check your environment variables.",
				);
			}
			throw new Error(
				`[fetchCompletionsUsage] Failed to fetch completions usage: ${error.message}`,
			);
		}

		if (!data) {
			console.warn(
				"[fetchCompletionsUsage] No data received for this page. Terminating.",
			);
			break;
		}

		const filteredBuckets = data.data.filter(isNonEmptyBucket);
		buckets.push(...filteredBuckets);
		console.log(
			`[fetchCompletionsUsage] Fetched page ${pageCount + 1} with ${filteredBuckets.length} buckets`,
		);

		page = data.has_more ? data.next_page : null;
		pageCount++;
	} while (page);

	console.log(`[fetchCompletionsUsage] Total pages fetched: ${pageCount}`);

	return buckets;
}

type NonEmptyBucket = Bucket<CompletionsObject> & {
	results: [CompletionsObject, ...CompletionsObject[]];
};

function isNonEmptyBucket(
	bucket: Bucket<CompletionsObject>,
): bucket is NonEmptyBucket {
	return bucket.results.length > 0;
}

const results = await fetchCompletionsUsage(
	getCurrentMonthStart().startTimestamp,
);

Bun.write("results.json", JSON.stringify(results, null, 2));
