import { fetchCompletionsUsage } from "./api";
import { getCurrentMonthStart } from "./utils/dates";
import {
	formatCurrency,
	summarizeTokenUsageByModelWithCost,
} from "./utils/utils";

try {
	const { startTimestamp, daysInMonth } = getCurrentMonthStart();
	const allResults = await fetchCompletionsUsage(startTimestamp, daysInMonth);
	const sumByModelWithCost = summarizeTokenUsageByModelWithCost(allResults);

	console.log("Token usage by model with cost:", sumByModelWithCost);
	console.log(
		"Total cost:",
		formatCurrency(
			Object.entries(sumByModelWithCost).reduce(
				(acc, [model, { cost }]) => acc + cost,
				0,
			),
		),
	);
} catch (error) {
	console.error("Error fetching token usage:", error);
}
