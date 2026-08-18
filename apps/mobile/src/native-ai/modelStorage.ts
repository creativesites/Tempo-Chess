import { Directory, File, Paths } from 'expo-file-system';

const modelsDirectory = new Directory(Paths.document, 'models');

function ensureModelsDirectory(): void {
  if (!modelsDirectory.exists) {
    modelsDirectory.create({ intermediates: true });
  }
}

export function getModelFile(modelId: string): File {
  ensureModelsDirectory();
  return new File(modelsDirectory, `${modelId}.gguf`);
}

export function isModelDownloaded(modelId: string): boolean {
  return getModelFile(modelId).exists;
}
