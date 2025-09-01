import { Temporal } from "temporal-polyfill";

export function getDayStart() {
	const now = Temporal.Now.zonedDateTimeISO();
	console.log(now.toString());
}

export function getCurrentMonthStart() {
	const nowUTC = Temporal.Now.zonedDateTimeISO("UTC");
	const nowLocal = Temporal.Now.zonedDateTimeISO();

	// Use UTC for API consistency and boundary calculations
	const { year, month } = nowUTC;
	const date = Temporal.PlainDate.from(
		`${year}-${month.toString().padStart(2, "0")}-01`,
	);

	// Get local timezone info for display
	const localMonthStart = date.toZonedDateTime(nowLocal.timeZoneId);
	const localMonthEnd = localMonthStart
		.add({ months: 1 })
		.subtract({ days: 1 });

	return {
		date,
		startTimestamp: date.toZonedDateTime("UTC").epochSeconds,
		daysInMonth: date.daysInMonth,
		year,
		month,
		monthName: nowLocal.toLocaleString("en-US", { month: "long" }),
		// Additional local timezone info
		localTimeZone: nowLocal.timeZoneId,
		localMonthStart: localMonthStart,
		localMonthEnd: localMonthEnd,
		utcMonthStart: date.toZonedDateTime("UTC"),
	};
}
