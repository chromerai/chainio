export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 5,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 1
};

export const GEMINI_FALLBACK_MODELS = [
  { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
  { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
  { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
];

export const OPENAI_FALLBACK_MODELS = [
  { name: 'GPT 4o Mini', value: 'gpt-4o-mini' },
  { name: 'GPT 4o', value: 'gpt-4o' },
  { name: 'GPT 4 Turbo', value: 'gpt-4-turbo' },
];

export const ANTHROPIC_FALLBACK_MODELS = [
  { name: 'Claude Opus 4.5', value: 'claude-opus-4-5' },
  { name: 'Claude Sonnet 4.5', value: 'claude-sonnet-4-5' },
  { name: 'Claude Haiku 4.5', value: 'claude-haiku-4-5' },
];