import { fetchCompletionsUsage } from "./api";
import { getCurrentMonthStart } from "./utils/dates";
import {
	formatCurrency,
	summarizeTokenUsageByModelWithCost,
} from "./utils/utils";

try {
	const {
		startTimestamp,
		daysInMonth,
		monthName,
		year,
		localTimeZone,
		localMonthStart,
		localMonthEnd,
	} = getCurrentMonthStart();

	const allResults = await fetchCompletionsUsage(startTimestamp, daysInMonth);
	const sumByModelWithCost = summarizeTokenUsageByModelWithCost(allResults);

	console.log(`Token costs for ${monthName} ${year}:`);
	console.log(
		`Period: ${localMonthStart.toLocaleString()} - ${localMonthEnd.toLocaleString()} (${localTimeZone})`,
	);
	console.log("Usage by model with cost:", sumByModelWithCost);
	console.log(
		"Total cost:",
		formatCurrency(
			Object.entries(sumByModelWithCost).reduce(
				(acc, [_model, { cost }]) => acc + cost,
				0,
			),
		),
	);
} catch (error) {
	console.error("Error fetching token usage:", error);
}
