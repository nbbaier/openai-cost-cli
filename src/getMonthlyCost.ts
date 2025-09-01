import { fetchOrganizationCosts } from "./api";
import type { CliArgs } from "./utils/cli";
import {
	getCurrentMonthStart,
	parseDateRange,
	parseMonthString,
} from "./utils/dates";
import { formatAsCsv, formatAsJson } from "./utils/output";
import { formatCurrency } from "./utils/utils";

export default async (args: CliArgs = {}) => {
	try {
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

		const totalCost = await fetchOrganizationCosts(
			dateInfo.startTimestamp,
			dateInfo.daysInMonth || dateInfo.daysInRange,
		);

		const result = {
			period: periodDescription,
			totalCost,
			formattedCost: formatCurrency(totalCost),
		};

		// Output based on format
		if (args.json) {
			console.log(formatAsJson(result));
		} else if (args.csv) {
			console.log(formatAsCsv([result]));
		} else {
			console.log(
				`Total Cost for ${periodDescription}: ${formatCurrency(totalCost)}`,
			);
		}

		return totalCost;
	} catch (error) {
		console.error("Error running the application:", error);
		throw error;
	}
};
