/**
 * Web Worker for EmbeddingGemma model loading and inference
 * Isolates heavy ML computations from main thread
 */

import { env, AutoModel, AutoTokenizer } from '@huggingface/transformers';

// Configure environment for browser
env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = 'onnx-community/embeddinggemma-300m-ONNX';

class EmbeddingGemmaWorker {
  constructor() {
    this.model = null;
    this.tokenizer = null;
    this.device = null;
    this.isReady = false;
  }

  async checkWebGPUAvailability() {
    try {
      if (!navigator.gpu) return false;
      return !!(await navigator.gpu.requestAdapter());
    } catch (error) {
      console.error('WebGPU check failed:', error);
      return false;
    }
  }

  async loadModel(progressCallback) {
    if (this.model && this.tokenizer) {
      return { success: true, device: this.device };
    }

    try {
      // Load tokenizer
      progressCallback({ status: 'loading', message: 'Loading tokenizer...' });
      this.tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID);

      // Check WebGPU availability
      const isWebGPUAvailable = await this.checkWebGPUAvailability();
      this.device = isWebGPUAvailable ? 'webgpu' : 'wasm';

      // Configure WASM proxy for non-WebGPU environments
      env.backends.onnx.wasm.proxy = !isWebGPUAvailable;

      progressCallback({
        status: 'loading',
        message: `Loading model (${this.device})...`,
        device: this.device
      });

      // Load model
      this.model = await AutoModel.from_pretrained(MODEL_ID, {
        device: this.device,
        dtype: 'q4',
        model_file_name: isWebGPUAvailable ? 'model_no_gather' : 'model',
        progress_callback: (progress) => {
          if (progress.status === 'progress' && progress.file.endsWith('.onnx_data')) {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            progressCallback({
              status: 'progress',
              message: `Loading model... ${percentage}%`,
              progress: percentage
            });
          }
        }
      });

      this.isReady = true;
      return { success: true, device: this.device };
    } catch (error) {
      console.error('Model loading failed:', error);
      throw error;
    }
  }

  async generateEmbeddings(texts, taskType = 'document') {
    if (!this.model || !this.tokenizer) {
      throw new Error('Model not loaded');
    }

    try {
      const embeddings = [];
      const batchSize = this.device === 'webgpu' ? 8 : 1;

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);

        const inputs = this.tokenizer(batch, {
          padding: true,
          truncation: true,
          max_length: 256,
        });

        const { sentence_embedding } = await this.model(inputs);
        embeddings.push(...sentence_embedding.tolist());
      }

      return embeddings;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw error;
    }
  }

  async createAttentionMatrix(tokens, taskType = 'document') {
    const embeddings = await this.generateEmbeddings(tokens, taskType);

    const attentionMatrix = [];
    let minAttention = 1.0;
    let maxAttention = -1.0;

    // Calculate cosine similarities
    for (let i = 0; i < tokens.length; i++) {
      const row = [];
      for (let j = 0; j < tokens.length; j++) {
        if (i === j) {
          // Self-attention set to 0 for educational GAT
          row.push(0);
        } else {
          const similarity = this.cosineSimilarity(embeddings[i], embeddings[j]);
          const attention = (similarity + 1) / 2; // Map [-1,1] to [0,1]
          row.push(attention);

          if (attention > maxAttention) maxAttention = attention;
          if (attention < minAttention && attention > 0) minAttention = attention;
        }
      }
      attentionMatrix.push(row);
    }

    return {
      queryTokens: tokens,
      attentionMatrix,
      minAttention,
      maxAttention,
      embeddings,
      computationDetails: {
        model: MODEL_ID,
        taskType,
        dimensions: embeddings[0].length,
        method: 'EmbeddingGemma Real Transformer',
        device: this.device
      }
    };
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }

    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) return 0;
    return dotProduct / (magA * magB);
  }
}

// Worker instance
const worker = new EmbeddingGemmaWorker();

// Message handler
self.onmessage = async (event) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case 'load':
        const result = await worker.loadModel((progress) => {
          self.postMessage({ type: 'progress', data: progress });
        });
        self.postMessage({ type: 'loaded', data: { ...result, callbackId: data.callbackId } });
        break;

      case 'embed':
        const embeddings = await worker.generateEmbeddings(data.texts, data.taskType);
        self.postMessage({ type: 'embeddings', data: { ...embeddings, callbackId: data.callbackId } });
        break;

      case 'attention':
        const matrix = await worker.createAttentionMatrix(data.tokens, data.taskType);
        self.postMessage({ type: 'attention', data: { ...matrix, callbackId: data.callbackId } });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};
