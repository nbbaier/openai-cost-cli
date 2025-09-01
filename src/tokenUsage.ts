import { fetchCompletionsUsage } from "./api";
import { getCurrentMonthStart } from "./utils/dates";
import { summarizeTokenUsageByModel } from "./utils/utils";

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
	const sumByModel = summarizeTokenUsageByModel(allResults);

	console.log(`Token usage for ${monthName} ${year}:`);
	console.log(
		`Period: ${localMonthStart.toLocaleString()} - ${localMonthEnd.toLocaleString()} (${localTimeZone})`,
	);
	console.log("Usage by model:", sumByModel);
} catch (error) {
	console.error("Error fetching token usage:", error);
}
