import { betterFetch } from "@better-fetch/fetch";
import { fetchOrganizationCosts } from "./src/api";
import type { Page, CostsObject } from "./src/types";
import { getDayStart } from "./src/utils/dates";
import { Temporal } from "temporal-polyfill";
const now = Temporal.Now.zonedDateTimeISO();
const { year, month, day } = now;
const date = Temporal.PlainDate.from(
	`${year}-${month.toString().padStart(2, "0")}-01`,
);
const startTimestamp = date.toZonedDateTime("UTC").epochSeconds;
const days = 1;

const { data, error } = await betterFetch<Page<CostsObject>>(
	`https://api.openai.com/v1/organization/costs?start_time=${startTimestamp}&limit=${days}`,
	{
		headers: { Authorization: `Bearer ${Bun.env.OPENAI_ADMIN_KEY}` },
	},
);

console.dir(data, { depth: null });

// import { Command } from "@commander-js/extra-typings";
// import getMonthlyCost from "./src/getMonthlyCost";

// const app = new Command()
// 	.name("cli")
// 	.configureHelp({ showGlobalOptions: true })
// 	.showHelpAfterError();

// const cost = app.command("cost");
// const tokens = app.command("tokens");

// cost
// 	.command("month", { isDefault: true })
// 	.action(() => {
// 		console.log("get cost (month)");
// 		getMonthlyCost();
// 	})
// 	.command("today")
// 	.action(() => {
// 		console.log("get cost (today)");
// 	});

// tokens
// 	.command("month", { isDefault: true })
// 	.action(() => {
// 		console.log("get tokens (month)");
// 	})
// 	.command("today")
// 	.action(() => {
// 		console.log("get tokens (today)");
// 	});

// app.parse(process.argv);
