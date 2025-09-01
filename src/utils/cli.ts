export interface CliArgs {
	month?: string;
	start?: string;
	end?: string;
	json?: boolean;
	csv?: boolean;
	groupBy?: "model" | "project" | "user";
	top?: number;
	help?: boolean;
}

export function parseArgs(): CliArgs {
	const args = Bun.argv.slice(2); // Remove 'bun' and script name
	const parsed: CliArgs = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		const nextArg = args[i + 1];

		switch (arg) {
			case "--month":
				if (nextArg && !nextArg.startsWith("--")) {
					parsed.month = nextArg;
					i++; // Skip next argument
				} else {
					throw new Error("--month requires a value (e.g., --month 2025-01)");
				}
				break;

			case "--start":
				if (nextArg && !nextArg.startsWith("--")) {
					parsed.start = nextArg;
					i++; // Skip next argument
				} else {
					throw new Error(
						"--start requires a value (e.g., --start 2025-01-01)",
					);
				}
				break;

			case "--end":
				if (nextArg && !nextArg.startsWith("--")) {
					parsed.end = nextArg;
					i++; // Skip next argument
				} else {
					throw new Error("--end requires a value (e.g., --end 2025-01-31)");
				}
				break;

			case "--json":
				parsed.json = true;
				break;

			case "--csv":
				parsed.csv = true;
				break;

			case "--group-by":
				if (nextArg && !nextArg.startsWith("--")) {
					if (["model", "project", "user"].includes(nextArg)) {
						parsed.groupBy = nextArg as "model" | "project" | "user";
						i++; // Skip next argument
					} else {
						throw new Error("--group-by must be one of: model, project, user");
					}
				} else {
					throw new Error(
						"--group-by requires a value (model, project, or user)",
					);
				}
				break;

			case "--top":
				if (nextArg && !nextArg.startsWith("--")) {
					const top = parseInt(nextArg, 10);
					if (Number.isNaN(top) || top <= 0) {
						throw new Error("--top requires a positive number");
					}
					parsed.top = top;
					i++; // Skip next argument
				} else {
					throw new Error("--top requires a number (e.g., --top 10)");
				}
				break;

			case "--help":
			case "-h":
				parsed.help = true;
				break;

			default:
				if (arg.startsWith("--")) {
					throw new Error(`Unknown option: ${arg}`);
				}
				break;
		}
	}

	return parsed;
}

export function showHelp(scriptName: string) {
	console.log(`
Usage: bun ${scriptName} [options]

Options:
  --month <YYYY-MM>        Show data for specific month (e.g., --month 2025-01)
  --start <YYYY-MM-DD>     Start date for custom range
  --end <YYYY-MM-DD>       End date for custom range
  --json                   Output as JSON
  --csv                    Output as CSV
  --group-by <type>        Group results by: model, project, user
  --top <number>           Show only top N results
  --help, -h               Show this help message

Examples:
  bun ${scriptName} --month 2025-01
  bun ${scriptName} --start 2025-01-01 --end 2025-01-31 --json
  bun ${scriptName} --group-by model --top 5 --csv
  bun ${scriptName} --month 2025-01 --group-by project --json
`);
}
