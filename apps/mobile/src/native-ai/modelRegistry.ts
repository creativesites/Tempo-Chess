import { CoachModelDescriptor } from '@tempo/coaching';

/**
 * Real, verified GGUF releases (Unsloth's Qwen3 quantizations on Hugging
 * Face) — every URL and byte size here was checked against the actual
 * hosted files, not estimated. Q4_K_M is a reasonable default quality/
 * size tradeoff for on-device inference; the catalog intentionally
 * covers the three sizes the product spec calls for so the app can pick
 * one appropriate to the device rather than shipping a single size.
 */
export const MODEL_CATALOG: Omit<CoachModelDescriptor, 'isDownloaded' | 'isLoaded'>[] = [
  {
    id: 'qwen3-0.6b-q4_k_m',
    name: 'Qwen3 0.6B (Mobile Nano)',
    parameterCount: '0.6B',
    quantization: 'Q4_K_M',
    sizeBytes: 396705472,
    downloadUrl: 'https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_K_M.gguf',
  },
  {
    id: 'qwen3-1.7b-q4_k_m',
    name: 'Qwen3 1.7B (Coach Standard)',
    parameterCount: '1.7B',
    quantization: 'Q4_K_M',
    sizeBytes: 1107409472,
    downloadUrl: 'https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf',
  },
  {
    id: 'qwen3-4b-q4_k_m',
    name: 'Qwen3 4B (Deep Reasoner)',
    parameterCount: '4B',
    quantization: 'Q4_K_M',
    sizeBytes: 2497281312,
    downloadUrl: 'https://huggingface.co/unsloth/Qwen3-4B-GGUF/resolve/main/Qwen3-4B-Q4_K_M.gguf',
  },
];

/** Smallest model — safest default for a first install on an unknown
 * device before the app has any signal about available RAM/storage. */
export const DEFAULT_MODEL_ID = 'qwen3-0.6b-q4_k_m';
