import { fetchCompletionsUsage } from "./api";
import { getCurrentMonthStart } from "./utils/dates";
import { summarizeTokenUsageByModel } from "./utils/utils";

try {
	const { startTimestamp, daysInMonth } = getCurrentMonthStart();
	const allResults = await fetchCompletionsUsage(startTimestamp, daysInMonth);
	const sumByModel = summarizeTokenUsageByModel(allResults);
	console.log("Token usage by model:", sumByModel);
} catch (error) {
	console.error("Error fetching token usage:", error);
}
