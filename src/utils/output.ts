export function formatAsJson(data: unknown): string {
	return JSON.stringify(data, null, 2);
}

export function formatAsCsv(data: Record<string, unknown>[]): string {
	if (!Array.isArray(data) || data.length === 0) {
		return "";
	}

	// Get headers from first object
	const headers = Object.keys(data[0]);

	// Create CSV header row
	const csvRows = [headers.join(",")];

	// Add data rows
	for (const row of data) {
		const values = headers.map((header) => {
			const value = row[header];
			// Escape commas and quotes in CSV
			if (
				typeof value === "string" &&
				(value.includes(",") || value.includes('"'))
			) {
				return `"${value.replace(/"/g, '""')}"`;
			}
			return value;
		});
		csvRows.push(values.join(","));
	}

	return csvRows.join("\n");
}

export function formatAsTable(data: Record<string, unknown>[]): string {
	if (!Array.isArray(data) || data.length === 0) {
		return "No data available";
	}

	const headers = Object.keys(data[0]);

	// Calculate column widths
	const widths = headers.map((header) => {
		const headerWidth = header.length;
		const dataWidth = Math.max(
			...data.map((row) => String(row[header]).length),
		);
		return Math.max(headerWidth, dataWidth);
	});

	// Create header row
	const headerRow = headers
		.map((header, i) => header.padEnd(widths[i]))
		.join(" | ");
	const separator = widths.map((width) => "-".repeat(width)).join("-|-");

	// Create data rows
	const dataRows = data.map((row) =>
		headers
			.map((header, i) => String(row[header]).padEnd(widths[i]))
			.join(" | "),
	);

	return [headerRow, separator, ...dataRows].join("\n");
}

export function limitResults<T>(data: T[], limit: number): T[] {
	if (!Array.isArray(data)) {
		return data;
	}
	return data.slice(0, limit);
}
