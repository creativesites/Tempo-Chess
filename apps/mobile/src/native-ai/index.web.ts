import { LocalCoachAI } from '@tempo/coaching';

import { UnavailableCoachAI } from './UnavailableCoachAI';

export type { CoachModelDescriptor, CoachContext, CoachResponse } from '@tempo/coaching';
export { MODEL_CATALOG, DEFAULT_MODEL_ID } from './modelRegistry';

// Web has no llama.cpp binding — this file exists so Metro's
// platform-specific resolution never attempts to bundle llama.rn (a
// native-only module) for the web target.
const unavailable = new UnavailableCoachAI();

export function getCoachAI(): LocalCoachAI {
  return unavailable;
}
