import results from "./results.json" with { type: "json" };

const filteredResults = results
	.filter((bucket) =>
		bucket.results.some((result) => result.model === "gpt-4-0125-preview"),
	)
	.map((bucket) => {
		return {
			start_time: bucket.start_time,
			end_time: bucket.end_time,
			results: bucket.results.filter(
				(result) => result.model === "gpt-4-turbo-preview",
			),
		};
	});
console.dir(filteredResults, { depth: null });
