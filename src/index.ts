import getMonthlyCost from "./getMonthlyCost";
import { parseArgs, showHelp } from "./utils/cli";

try {
	const args = parseArgs();

	if (args.help) {
		showHelp("src/index.ts");
		process.exit(0);
	}

	await getMonthlyCost(args);
} catch (error) {
	console.error("Error:", error instanceof Error ? error.message : error);
	process.exit(1);
}
