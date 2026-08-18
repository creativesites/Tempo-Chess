import { GameContext } from '@tempo/shared';
import { PlayerModel } from '@tempo/player-model';

// -------------------------------------------------------------
// Local Coach AI — the on-device LLM boundary.
//
// This is a pure contract: packages/coaching (and the rest of the
// product layer) depends only on this interface, never on llama.cpp or
// any specific native module directly. The concrete implementation
// (wrapping llama.rn) lives in the mobile app, which is the only layer
// that's allowed to know a native inference runtime exists.
//
// Chess calculation is NEVER this model's job — see NativeChessEngine
// in @tempo/chess for that. This interface only ever explains,
// teaches, and converses about a position the engine and the
// deterministic coaching rules have already analyzed.
// -------------------------------------------------------------

export interface CoachModelDescriptor {
  id: string;
  name: string;
  parameterCount: string;
  quantization: string;
  sizeBytes: number;
  /** Direct, resolvable download URL for the .gguf weights. */
  downloadUrl: string;
  /** True once the weights exist in local storage. */
  isDownloaded: boolean;
  /** True once this model is the one currently loaded into memory. */
  isLoaded: boolean;
}

export interface CoachContext {
  gameContext: GameContext;
  playerModel: PlayerModel;
  promptType: 'intervention' | 'socratic_followup' | 'post_game_review' | 'player_insight';
  /** A deterministic system prompt built by the product layer — the
   * model explains what the rules/engine already found, it doesn't
   * decide the chess facts itself. */
  systemPrompt: string;
  userMessage?: string;
}

export interface CoachResponse {
  text: string;
  suggestedAction?: 'continue' | 'show_hint' | 'freeze_for_thought';
  /** Wall-clock generation time, for surfacing real performance to the
   * player rather than pretending inference is instantaneous. */
  generationTimeMs?: number;
}

export type ModelDownloadProgress = (fractionComplete: number) => void;

export interface LocalCoachAI {
  /** Prepares the runtime (e.g. native module init). Safe to call
   * repeatedly; must not throw on platforms without a native
   * implementation — isReady() reports that instead. */
  initialize(): Promise<void>;
  listAvailableModels(): Promise<CoachModelDescriptor[]>;
  downloadModel(modelId: string, onProgress?: ModelDownloadProgress): Promise<void>;
  deleteDownloadedModel(modelId: string): Promise<void>;
  loadModel(modelId: string): Promise<void>;
  unloadModel(): Promise<void>;
  isReady(): Promise<boolean>;
  generate(context: CoachContext): Promise<CoachResponse>;
  getActiveModelInfo(): Promise<CoachModelDescriptor | null>;
}
