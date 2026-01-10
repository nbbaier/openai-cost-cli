import { Temporal } from "temporal-polyfill";

export function getTodayRange() {
	const today = Temporal.Now.plainDateISO("UTC");
	return {
		startDate: today,
		endDate: today,
		startTimestamp:
			Number(today.toZonedDateTime("UTC").epochNanoseconds) / 1_000_000_000,
		daysInRange: 1,
		year: today.year,
		month: today.month,
		monthName: today.toLocaleString("en-US", { month: "long" }),
		dayOfMonth: today.day,
	};
}

export function parseMonthString(monthStr: string) {
	// Expected format: YYYY-MM (e.g., "2025-01")
	const match = monthStr.match(/^(\d{4})-(\d{2})$/);
	if (!match) {
		throw new Error("Month must be in format YYYY-MM (e.g., 2025-01)");
	}

	const [, yearStr, monthNumStr] = match;
	const year = parseInt(yearStr, 10);
	const month = parseInt(monthNumStr, 10);

	if (month < 1 || month > 12) {
		throw new Error("Month must be between 01 and 12");
	}

	const date = Temporal.PlainDate.from(`${year}-${monthNumStr}-01`);
	return {
		date,
		startTimestamp:
			Number(date.toZonedDateTime("UTC").epochNanoseconds) / 1_000_000_000,
		daysInMonth: date.daysInMonth,
		year,
		month,
		monthName: date.toLocaleString("en-US", { month: "long" }),
	};
}

export function parseDateRange(startStr: string, endStr: string) {
	// Expected format: YYYY-MM-DD (e.g., "2025-01-01")
	const startDate = Temporal.PlainDate.from(startStr);
	const endDate = Temporal.PlainDate.from(endStr);

	if (Temporal.PlainDate.compare(startDate, endDate) > 0) {
		throw new Error("Start date must be before or equal to end date");
	}

	const daysDiff = startDate.until(endDate).days + 1; // +1 to include both start and end days

	return {
		startDate,
		endDate,
		startTimestamp:
			Number(startDate.toZonedDateTime("UTC").epochNanoseconds) / 1_000_000_000,
		daysInRange: daysDiff,
		year: startDate.year,
		month: startDate.month,
		monthName: startDate.toLocaleString("en-US", { month: "long" }),
	};
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
		startTimestamp:
			Number(date.toZonedDateTime("UTC").epochNanoseconds) / 1_000_000_000,
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

export function parseDateArguments(startStr?: string, endStr?: string) {
	// If both start and end are provided, use the existing parseDateRange
	if (startStr && endStr) {
		return parseDateRange(startStr, endStr);
	}

	// If only start is provided, use it as start and today as end
	if (startStr && !endStr) {
		const startDate = Temporal.PlainDate.from(startStr);
		const endDate = Temporal.Now.plainDateISO("UTC");

		if (Temporal.PlainDate.compare(startDate, endDate) > 0) {
			throw new Error("Start date cannot be in the future");
		}

		const daysDiff = startDate.until(endDate).days + 1;

		return {
			startDate,
			endDate,
			startTimestamp:
				Number(startDate.toZonedDateTime("UTC").epochNanoseconds) /
				1_000_000_000,
			daysInRange: daysDiff,
			year: startDate.year,
			month: startDate.month,
			monthName: startDate.toLocaleString("en-US", { month: "long" }),
		};
	}

	// If only end is provided, use the start of that month as start
	if (!startStr && endStr) {
		const endDate = Temporal.PlainDate.from(endStr);
		const startDate = Temporal.PlainDate.from(
			`${endDate.year}-${endDate.month.toString().padStart(2, "0")}-01`,
		);

		const daysDiff = startDate.until(endDate).days + 1;

		return {
			startDate,
			endDate,
			startTimestamp:
				Number(startDate.toZonedDateTime("UTC").epochNanoseconds) /
				1_000_000_000,
			daysInRange: daysDiff,
			year: startDate.year,
			month: startDate.month,
			monthName: startDate.toLocaleString("en-US", { month: "long" }),
		};
	}

	// If neither is provided, return null (caller will use default behavior)
	return null;
}
