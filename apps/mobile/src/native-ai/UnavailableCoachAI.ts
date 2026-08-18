import { CoachContext, CoachModelDescriptor, CoachResponse, LocalCoachAI } from '@tempo/coaching';

import { MODEL_CATALOG } from './modelRegistry';

/**
 * Honest "not available" implementation — used on web (no llama.cpp
 * binding exists there) and as a safe placeholder if native init ever
 * fails. Reports isReady() = false and throws a clear error from
 * generate() rather than returning canned text that could be mistaken
 * for a real model response. See product spec section 38: a feature is
 * only "implemented" when it actually works.
 */
export class UnavailableCoachAI implements LocalCoachAI {
  async initialize(): Promise<void> {}

  async listAvailableModels(): Promise<CoachModelDescriptor[]> {
    return MODEL_CATALOG.map((descriptor) => ({ ...descriptor, isDownloaded: false, isLoaded: false }));
  }

  async downloadModel(): Promise<void> {
    throw new Error('Local model download is not available on this platform.');
  }

  async deleteDownloadedModel(): Promise<void> {
    throw new Error('Local model management is not available on this platform.');
  }

  async loadModel(): Promise<void> {
    throw new Error('Local model loading is not available on this platform.');
  }

  async unloadModel(): Promise<void> {}

  async isReady(): Promise<boolean> {
    return false;
  }

  async generate(_context: CoachContext): Promise<CoachResponse> {
    throw new Error('On-device AI coaching is not available on this platform (native build required).');
  }

  async getActiveModelInfo(): Promise<CoachModelDescriptor | null> {
    return null;
  }
}
