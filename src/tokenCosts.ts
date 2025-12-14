import type { Temporal } from "temporal-polyfill";
import { fetchCompletionsUsage } from "./api";
import type { CliArgs } from "./utils/cli";
import { parseArgs, showHelp } from "./utils/cli";
import {
	getCurrentMonthStart,
	parseDateArguments,
	parseMonthString,
} from "./utils/dates";
import {
	formatAsCsv,
	formatAsJson,
	formatAsTable,
	limitResults,
} from "./utils/output";
import {
	formatCurrency,
	summarizeTokenUsageByModelWithCost,
} from "./utils/utils";

async function runTokenCosts(args: CliArgs = {}) {
	let dateInfo: {
		startTimestamp: number;
		daysInMonth?: number;
		daysInRange?: number;
		monthName: string;
		year: number;
		startDate?: Temporal.PlainDate;
		endDate?: Temporal.PlainDate;
	};
	let periodDescription: string;

	// Determine date range based on arguments
	if (args.month) {
		dateInfo = parseMonthString(args.month);
		periodDescription = `${dateInfo.monthName} ${dateInfo.year}`;
	} else if (args.start || args.end) {
		const parsedDates = parseDateArguments(args.start, args.end);
		if (parsedDates) {
			dateInfo = parsedDates;
			periodDescription = `${dateInfo.startDate?.toString()} to ${dateInfo.endDate?.toString()}`;
		} else {
			// Fallback to current month if parsing failed
			const currentMonth = getCurrentMonthStart();
			dateInfo = {
				startTimestamp: currentMonth.startTimestamp,
				daysInMonth: currentMonth.daysInMonth,
				monthName: currentMonth.monthName,
				year: currentMonth.year,
			};
			periodDescription = `${currentMonth.monthName} ${currentMonth.year}`;
		}
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
		dateInfo.daysInMonth || dateInfo.daysInRange || 1,
	);
	const sumByModelWithCost = summarizeTokenUsageByModelWithCost(allResults);

	// Convert to array format for output
	const modelData = Object.entries(sumByModelWithCost).map(
		([model, usage]) => ({
			model,
			input_tokens: usage.input_tokens,
			output_tokens: usage.output_tokens,
			total_tokens: usage.input_tokens + usage.output_tokens,
			cost: usage.cost,
			formatted_cost: formatCurrency(usage.cost),
		}),
	);

	// Apply top limit if specified
	const limitedData = args.top ? limitResults(modelData, args.top) : modelData;

	// Calculate total cost
	const totalCost = modelData.reduce((sum, model) => sum + model.cost, 0);

	// Output based on format
	if (args.json) {
		console.log(
			formatAsJson({
				period: periodDescription,
				totalCost,
				formattedTotalCost: formatCurrency(totalCost),
				models: limitedData,
			}),
		);
	} else if (args.csv) {
		console.log(formatAsCsv(limitedData));
	} else {
		console.log(`Token costs for ${periodDescription}:`);
		console.log(formatAsTable(limitedData));
		console.log(`\nTotal cost: ${formatCurrency(totalCost)}`);
	}
}

try {
	const args = parseArgs();

	if (args.help) {
		showHelp("src/tokenCosts.ts");
		process.exit(0);
	}

	await runTokenCosts(args);
} catch (error) {
	console.error("Error:", error instanceof Error ? error.message : error);
	process.exit(1);
}
