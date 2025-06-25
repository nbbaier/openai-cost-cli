import { Temporal } from "temporal-polyfill";

export function getDayStart() {
	const now = Temporal.Now.zonedDateTimeISO();
	console.log(now.toString());
}

export function getCurrentMonthStart() {
	const now = Temporal.Now.zonedDateTimeISO();
	const { year, month } = now;
	const date = Temporal.PlainDate.from(
		`${year}-${month.toString().padStart(2, "0")}-01`,
	);

	return {
		date,
		startTimestamp: date.toZonedDateTime("UTC").epochSeconds,
		daysInMonth: date.daysInMonth,
		year,
		month,
		monthName: now.toLocaleString("en-US", { month: "long" }),
	};
}
