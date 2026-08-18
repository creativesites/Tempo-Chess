import { CoachContext, CoachModelDescriptor, CoachResponse, LocalCoachAI, ModelDownloadProgress } from '@tempo/coaching';
import { DownloadTask, DownloadProgress } from 'expo-file-system';
import { initLlama, LlamaContext } from 'llama.rn';

import { MODEL_CATALOG } from './modelRegistry';
import { getModelFile, isModelDownloaded } from './modelStorage';

/**
 * Real on-device inference via llama.rn (llama.cpp's JSI binding). This
 * is the only place in the app allowed to know llama.cpp exists —
 * everything else talks to the LocalCoachAI interface from
 * @tempo/coaching.
 */
class LlamaCoachAIImpl implements LocalCoachAI {
  private context: LlamaContext | null = null;
  private activeModelId: string | null = null;

  async initialize(): Promise<void> {
    // llama.rn has no separate global init step — a model is initialized
    // directly by loadModel(). Nothing to do here beyond satisfying the
    // interface's lifecycle contract.
  }

  async listAvailableModels(): Promise<CoachModelDescriptor[]> {
    return MODEL_CATALOG.map((descriptor) => ({
      ...descriptor,
      isDownloaded: isModelDownloaded(descriptor.id),
      isLoaded: descriptor.id === this.activeModelId,
    }));
  }

  async downloadModel(modelId: string, onProgress?: ModelDownloadProgress): Promise<void> {
    const descriptor = MODEL_CATALOG.find((m) => m.id === modelId);
    if (!descriptor) {
      throw new Error(`Unknown model id "${modelId}"`);
    }

    const destination = getModelFile(modelId);
    const task = new DownloadTask(descriptor.downloadUrl, destination, {
      onProgress: (progress: DownloadProgress) => {
        if (progress.totalBytes > 0) {
          onProgress?.(progress.bytesWritten / progress.totalBytes);
        }
      },
    });

    await task.downloadAsync();
  }

  async deleteDownloadedModel(modelId: string): Promise<void> {
    if (this.activeModelId === modelId) {
      await this.unloadModel();
    }
    const file = getModelFile(modelId);
    if (file.exists) {
      file.delete();
    }
  }

  async loadModel(modelId: string): Promise<void> {
    if (this.activeModelId === modelId && this.context) {
      return;
    }
    if (!isModelDownloaded(modelId)) {
      throw new Error(`Model "${modelId}" has not been downloaded yet — call downloadModel() first`);
    }
    if (this.context) {
      await this.unloadModel();
    }

    const file = getModelFile(modelId);
    this.context = await initLlama({
      model: file.uri,
      n_ctx: 4096,
      n_threads: 4,
    });
    this.activeModelId = modelId;
  }

  async unloadModel(): Promise<void> {
    if (this.context) {
      await this.context.release();
      this.context = null;
      this.activeModelId = null;
    }
  }

  async isReady(): Promise<boolean> {
    return !!this.context;
  }

  async generate(context: CoachContext): Promise<CoachResponse> {
    if (!this.context) {
      throw new Error('No local model is loaded — call loadModel() before generate()');
    }

    const start = Date.now();
    const result = await this.context.completion({
      messages: [
        { role: 'system', content: context.systemPrompt },
        { role: 'user', content: buildUserPrompt(context) },
      ],
      n_predict: 220,
      temperature: 0.6,
    });

    return {
      text: (result.content ?? '').trim(),
      generationTimeMs: Date.now() - start,
    };
  }

  async getActiveModelInfo(): Promise<CoachModelDescriptor | null> {
    if (!this.activeModelId) return null;
    const descriptor = MODEL_CATALOG.find((m) => m.id === this.activeModelId);
    if (!descriptor) return null;
    return { ...descriptor, isDownloaded: true, isLoaded: true };
  }
}

/**
 * Grounds the prompt in only what's actually known — real FEN, real
 * move history, real opening/material data from GameContext — plus
 * whatever the caller explicitly asked (userMessage). The model is
 * never asked to invent chess facts, only to explain ones the
 * deterministic layers already computed.
 */
function buildUserPrompt(context: CoachContext): string {
  const { gameContext, playerModel } = context;
  const recentMoves = gameContext.moveHistory
    .slice(-6)
    .map((m) => m.san)
    .join(' ');

  const lines: string[] = [
    `Current position (FEN): ${gameContext.currentFen}`,
    recentMoves ? `Recent moves: ${recentMoves}` : 'No moves played yet.',
  ];

  if (gameContext.opening) {
    lines.push(`Opening: ${gameContext.opening.name}${gameContext.opening.variation ? ` (${gameContext.opening.variation})` : ''}`);
  }

  lines.push(`Material balance (White − Black, pawns): ${(gameContext.material.advantage / 100).toFixed(1)}`);
  lines.push(`Player rating estimate: ${playerModel.ratingEstimate}, games played: ${playerModel.gamesPlayed}.`);

  if (context.userMessage) {
    lines.push(`Player asked: ${context.userMessage}`);
  }

  return lines.join('\n');
}

export const LlamaCoachAI = new LlamaCoachAIImpl();
