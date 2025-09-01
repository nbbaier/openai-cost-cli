import { fetchOrganizationCosts } from "./api";
import { getCurrentMonthStart } from "./utils/dates";
import { formatCurrency } from "./utils/utils";

export default async () => {
	try {
		const {
			startTimestamp,
			daysInMonth,
			monthName,
			year,
			localTimeZone,
			localMonthStart,
			localMonthEnd,
			utcMonthStart,
		} = getCurrentMonthStart();

		const totalCost = await fetchOrganizationCosts(startTimestamp, daysInMonth);

		console.log(
			`Total Cost for ${monthName} ${year}: ${formatCurrency(totalCost)}`,
		);
		console.log(
			`Period: ${localMonthStart.toLocaleString()} - ${localMonthEnd.toLocaleString()} (${localTimeZone})`,
		);
		console.log(
			`UTC Period: ${utcMonthStart.toLocaleString()} - ${utcMonthStart.add({ months: 1 }).subtract({ days: 1 }).toLocaleString()}`,
		);

		return totalCost;
	} catch (error) {
		console.error("Error running the application:", error);
		throw error;
	}
};
