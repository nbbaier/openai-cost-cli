import { fn } from "./getMonthlyCost";
import { parseArgs, showHelp } from "./utils/cli";

try {
	const args = parseArgs();

	if (args.help) {
		showHelp("src/index.ts");
		process.exit(0);
	}

	const totalCost = await fn();
	console.log(totalCost);
} catch (error) {
	console.error("Error:", error instanceof Error ? error.message : error);
	process.exit(1);
}
