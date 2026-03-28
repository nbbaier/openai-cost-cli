import { z } from "zod";

export const ModalitiesSchema = z.object({
	input: z.array(z.string()),
	output: z.array(z.string()),
});

export const ModelLimitSchema = z.object({
	context: z.number().optional(),
	output: z.number().optional(),
});

export const InterleavedConfigSchema = z.union([
	z.boolean(),
	z.object({
		field: z.string(),
	}),
]);

export const ProviderOverrideSchema = z.record(z.string(), z.any());

export interface ModelCost {
	input?: number;
	output?: number;
	input_audio?: number;
	output_audio?: number;
	cache_read?: number;
	cache_write?: number;
	context_over_200k?: ModelCost;
	[key: string]: unknown;
}

export const ModelCostSchema: z.ZodType<ModelCost> = z.lazy(() =>
	z
		.object({
			input: z.number().optional(),
			output: z.number().optional(),
			input_audio: z.number().optional(),
			output_audio: z.number().optional(),
			cache_read: z.number().optional(),
			cache_write: z.number().optional(),
			context_over_200k: ModelCostSchema.optional(),
		})
		.catchall(z.any()),
);

export const ModelsDevModelSchema = z.object({
	id: z.string(),
	name: z.string(),
	family: z.string().optional(),
	attachment: z.boolean().optional(),
	reasoning: z.boolean().optional(),
	tool_call: z.boolean().optional(),
	structured_output: z.boolean().optional(),
	temperature: z.boolean().optional(),
	knowledge: z.string().optional(),
	release_date: z.string().optional(),
	last_updated: z.string().optional(),
	open_weights: z.boolean().optional(),
	status: z.string().optional(),
	modalities: ModalitiesSchema.optional(),
	limit: ModelLimitSchema.optional(),
	interleaved: InterleavedConfigSchema.optional(),
	provider: ProviderOverrideSchema.optional(),
	cost: ModelCostSchema.optional(),
});

export const ModelsDevProviderSchema = z.object({
	id: z.string(),
	env: z.array(z.string()).optional(),
	npm: z.string().optional(),
	api: z.string().optional(),
	name: z.string().optional(),
	doc: z.string().optional(),
	models: z.record(z.string(), ModelsDevModelSchema),
});

export const ModelsDevConfigSchema = z.record(
	z.string(),
	ModelsDevProviderSchema,
);

export type Modalities = z.infer<typeof ModalitiesSchema>;
export type InterleavedConfig = z.infer<typeof InterleavedConfigSchema>;
export type ProviderOverride = z.infer<typeof ProviderOverrideSchema>;
export type ModelLimit = z.infer<typeof ModelLimitSchema>;
export type ModelsDevModel = z.infer<typeof ModelsDevModelSchema>;
export type ModelsDevProvider = z.infer<typeof ModelsDevProviderSchema>;
export type ModelsDevConfig = z.infer<typeof ModelsDevConfigSchema>;
