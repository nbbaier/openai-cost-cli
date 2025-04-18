import { fetchOrganizationCosts } from "./api";
import { getCurrentMonthStart, formatCurrency } from "./dates";

export default async function main() {
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
}
