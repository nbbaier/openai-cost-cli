export type Page<T extends CompletionsObject | CostsObject> = {
	object: "page";
	data: Bucket<T>[];
	has_more: boolean;
	next_page: string | null;
};

export type Bucket<T extends CompletionsObject | CostsObject> = {
	object: "bucket";
	start_time: number;
	end_time: number;
	results: T[];
};

export type CompletionsObject = {
	object: "organization.usage.completions.result";
	input_tokens: number;
	output_tokens: number;
	input_cached_tokens: number;
	input_audio_tokens: number;
	output_audio_tokens: number;
	num_model_requests: number;
	project_id: string;
	user_id: string;
	api_key_id: string;
	model: string;
	batch: boolean;
};

export type CostsObject = {
	object: "organization.costs.result";
	amount: {
		value: number;
		currency: string;
	};
	line_item: string;
	project_id: string;
};

interface SearchContextCost {
	search_context_size_low: number;
	search_context_size_medium: number;
	search_context_size_high: number;
}

type Mode =
	| "chat"
	| "embedding"
	| "completion"
	| "image_generation"
	| "audio_transcription"
	| "audio_speech"
	| "moderation"
	| "rerank";

export interface ProviderConfig {
	// LEGACY parameter. set to max_output_tokens if provider specifies it.
	// IF not set to max_input_tokens, if provider specifies it.
	max_tokens: string | number;

	// max input tokens, if the provider specifies it.
	// if not default to max_tokens.
	max_input_tokens: string | number;

	// max output tokens, if the provider specifies it.
	// if not default to max_tokens.
	max_output_tokens: string | number;

	input_cost_per_token: number;
	output_cost_per_token: number;
	input_cost_per_token_batches: number;
	output_cost_per_token_batches: number;
	cache_read_input_token_cost: number;
	supported_endpoints: string[];
	supported_modalities: string[];
	supported_output_modalities: string[];
	// one of https://docs.litellm.ai/docs/providers
	litellm_provider: string;

	// mode options as specified in the JSON object.
	mode: Mode;

	supports_function_calling: boolean;
	supports_parallel_function_calling: boolean;
	supports_vision: boolean;
	supports_audio_input: boolean;
	supports_audio_output: boolean;
	supports_prompt_caching: boolean;
	supports_response_schema: boolean;
	supports_system_messages: boolean;
	supports_reasoning: boolean;
	supports_web_search: boolean;
	supports_tool_choice: boolean;
	supports_native_streaming: boolean;

	search_context_cost_per_query: SearchContextCost;

	deprecation_date: string;
}

export type openaiPrices = Record<
	string,
	{
		output_cost_per_token: number;
		input_cost_per_token: number;
	}
>;
