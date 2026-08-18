import { AIRequest, AIResponse, LocalAIProvider, ModelInfo } from '../types';

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'qwen3-0.6b',
    name: 'Qwen3 0.6B Mobile Nano',
    sizeMb: 480,
    parameterCount: '0.6 Billion',
    status: 'installed',
    description: 'Ultra-lightweight on-device model optimized for low-latency tactical prompts & move commentary.',
    isLocal: true
  },
  {
    id: 'qwen3-1.7b',
    name: 'Qwen3 1.7B Coach Standard',
    sizeMb: 1250,
    parameterCount: '1.7 Billion (Quantized Q4_K_M)',
    status: 'active',
    description: 'Balanced chess reasoner with deep opening pedagogy, behavioural memory, and Socratic guidance.',
    isLocal: true
  },
  {
    id: 'qwen3-4b',
    name: 'Qwen3 4B Master Deep Reasoner',
    sizeMb: 2850,
    parameterCount: '4.0 Billion (Quantized Q4_0)',
    status: 'downloadable',
    description: 'Deep psychological player modeling, multi-step tactical trap foresight, and nuanced endgame concepts.',
    isLocal: true
  }
];

export class MockOfflineAIProvider implements LocalAIProvider {
  private currentModelId: string = 'qwen3-1.7b';

  constructor(modelId?: string) {
    if (modelId) this.currentModelId = modelId;
  }

  public async isAvailable(): Promise<boolean> {
    return true; // 100% offline ready
  }

  public async getModelInfo(): Promise<ModelInfo> {
    const found = AVAILABLE_MODELS.find(m => m.id === this.currentModelId);
    return found || AVAILABLE_MODELS[1];
  }

  public async generate(request: AIRequest): Promise<AIResponse> {
    // Simulate brief local neural compute delay (150ms)
    await new Promise(r => setTimeout(r, 160));

    const { promptType, gameContext } = request;

    if (promptType === 'socratic_followup') {
      return {
        text: "Notice that by delaying the direct capture, you maintain maximum pressure on Black's uncastled king while keeping your own pieces actively coordinated.",
        suggestedAction: 'continue'
      };
    }

    if (promptType === 'post_game_review') {
      return {
        text: "You showed great strategic intent in the opening. The key learning moment happened on move 16 where an immediate counter-attack sacrificed your defensive structure.",
        suggestedAction: 'continue'
      };
    }

    return {
      text: "The position has high tactical tension. Consider how your minor pieces work together before committing to a pawn break.",
      suggestedAction: 'continue'
    };
  }
}

export const activeAIProvider = new MockOfflineAIProvider();
