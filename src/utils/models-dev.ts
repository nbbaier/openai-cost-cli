import path from "node:path";
import { fileURLToPath } from "node:url";
import { ModelsDevConfigSchema } from "./models-dev-types";

const url = "https://models.dev/api.json";
const modelsDevPath = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"models-dev.json",
);

const priceDataPath = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"price-data.json",
);

console.log(`Fetching models from ${url}...`);
const res = await fetch(url);
if (!res.ok) {
	throw new Error(`Failed to fetch models: ${res.statusText}`);
}

const data = await res.json();

console.log("Validating data structure...");
const validatedData = ModelsDevConfigSchema.parse(data);

console.log("Writing all data to models-dev.json...");
await Bun.write(modelsDevPath, JSON.stringify(validatedData, null, 2));

const openaiData = Object.values(validatedData.openai.models);

const pricing = openaiData.map(({ id, cost }) => [
	id,
	{
		input_cost_per_token: (cost?.input ?? 0) / 1_000_000,
		output_cost_per_token: (cost?.output ?? 0) / 1_000_000,
	},
]);

console.log("Writing openai prices to openai-prices.json...");
await Bun.write(
	priceDataPath,
	JSON.stringify(
		{ updatedAt: Date.now(), pricing: Object.fromEntries(pricing) },
		null,
		2,
	),
);
