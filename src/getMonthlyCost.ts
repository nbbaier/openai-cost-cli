import { fetchOrganizationCosts } from "./api";
import { getCurrentMonthStart } from "./utils/dates";
import { formatCurrency } from "./utils/utils";

export default async () => {
	try {
		const { startTimestamp, daysInMonth, monthName, year } =
			getCurrentMonthStart();
		const totalCost = await fetchOrganizationCosts(startTimestamp, daysInMonth);
		console.log(
			`Total Cost for ${monthName} ${year}: ${formatCurrency(totalCost)}`,
		);
		return totalCost;
	} catch (error) {
		console.error("Error running the application:", error);
		throw error;
	}
};
