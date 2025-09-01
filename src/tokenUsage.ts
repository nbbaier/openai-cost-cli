import { fetchCompletionsUsage } from "./api";
import type { CliArgs } from "./utils/cli";
import { parseArgs, showHelp } from "./utils/cli";
import {
	getCurrentMonthStart,
	parseDateRange,
	parseMonthString,
} from "./utils/dates";
import {
	formatAsCsv,
	formatAsJson,
	formatAsTable,
	limitResults,
} from "./utils/output";
import { summarizeTokenUsageByModel } from "./utils/utils";

async function runTokenUsage(args: CliArgs = {}) {
	let dateInfo: {
		startTimestamp: number;
		daysInMonth?: number;
		daysInRange?: number;
		monthName: string;
		year: number;
	};
	let periodDescription: string;

	// Determine date range based on arguments
	if (args.month) {
		dateInfo = parseMonthString(args.month);
		periodDescription = `${dateInfo.monthName} ${dateInfo.year}`;
	} else if (args.start && args.end) {
		dateInfo = parseDateRange(args.start, args.end);
		periodDescription = `${dateInfo.startDate.toString()} to ${dateInfo.endDate.toString()}`;
	} else {
		// Default to current month
		const currentMonth = getCurrentMonthStart();
		dateInfo = {
			startTimestamp: currentMonth.startTimestamp,
			daysInMonth: currentMonth.daysInMonth,
			monthName: currentMonth.monthName,
			year: currentMonth.year,
		};
		periodDescription = `${currentMonth.monthName} ${currentMonth.year}`;
	}

	const allResults = await fetchCompletionsUsage(
		dateInfo.startTimestamp,
		dateInfo.daysInMonth || dateInfo.daysInRange,
	);
	const sumByModel = summarizeTokenUsageByModel(allResults);

	// Convert to array format for output
	const modelData = Object.entries(sumByModel).map(([model, usage]) => ({
		model,
		input_tokens: usage.input_tokens,
		output_tokens: usage.output_tokens,
		total_tokens: usage.input_tokens + usage.output_tokens,
	}));

	// Apply top limit if specified
	const limitedData = args.top ? limitResults(modelData, args.top) : modelData;

	// Output based on format
	if (args.json) {
		console.log(
			formatAsJson({
				period: periodDescription,
				models: limitedData,
			}),
		);
	} else if (args.csv) {
		console.log(formatAsCsv(limitedData));
	} else {
		console.log(`Token usage for ${periodDescription}:`);
		console.log(formatAsTable(limitedData));
	}
}

try {
	const args = parseArgs();

	if (args.help) {
		showHelp("src/tokenUsage.ts");
		process.exit(0);
	}

	await runTokenUsage(args);
} catch (error) {
	console.error("Error:", error instanceof Error ? error.message : error);
	process.exit(1);
}
