import { LocalCoachAI } from '@tempo/coaching';

import { LlamaCoachAI } from './LlamaCoachAI';

export type { CoachModelDescriptor, CoachContext, CoachResponse } from '@tempo/coaching';
export { MODEL_CATALOG, DEFAULT_MODEL_ID } from './modelRegistry';

/** Real native boundary (Android/iOS): backed by llama.cpp via
 * llama.rn. See index.web.ts for the honest "unavailable" counterpart. */
export function getCoachAI(): LocalCoachAI {
  return LlamaCoachAI;
}
