/**
 * Real EmbeddingGemma Implementation using @huggingface/transformers
 * Web Worker integration for browser-native transformer inference
 */

console.log('🧠 TextGraph: Loading Real EmbeddingGemma Implementation...');

class RealEmbeddingGemmaManager {
  constructor() {
    this.worker = null;
    this.isLoading = false;
    this.isReady = false;
    this.progress = 0;
    this.status = "Waiting to initialize...";
    this.error = null;
    this.modelName = "onnx-community/embeddinggemma-300m-ONNX";
    this.embeddingDimension = 768;
    this.device = null;
    this.pendingCallbacks = new Map();
    this.callbackId = 0;
  }

  async initialize() {
    if (this.worker) {
      return;
    }

    console.log('🚀 TextGraph: Initializing Real EmbeddingGemma with Web Worker...');

    try {
      // Create Web Worker
      this.worker = new Worker(
        new URL('./embedding-worker.js', import.meta.url),
        { type: 'module' }
      );

      // Set up message handling
      this.worker.onmessage = (event) => this.handleWorkerMessage(event);
      this.worker.onerror = (error) => this.handleWorkerError(error);

      // Load model
      this.isLoading = true;
      this.status = "Loading model...";

      await this.sendMessage('load', {});

      console.log('✅ TextGraph: Real EmbeddingGemma initialized successfully');
    } catch (error) {
      console.error('❌ TextGraph: Failed to initialize EmbeddingGemma:', error);
      this.error = error.message;
      this.status = "Error during initialization";
      throw error;
    }
  }

  handleWorkerMessage(event) {
    const { type, data } = event.data;

    switch (type) {
      case 'progress':
        this.progress = data.progress || 0;
        this.status = data.message;
        if (data.device) {
          this.device = data.device;
          console.log(`🔧 TextGraph: Using device: ${this.device}`);
        }
        break;

      case 'loaded':
        this.isLoading = false;
        this.isReady = true;
        this.progress = 100;
        this.device = data.device;
        this.status = `Ready (${this.device})`;
        console.log(`✅ TextGraph: Model loaded on ${this.device}`);

        // Resolve load callback
        const loadCallback = this.pendingCallbacks.get(0);
        if (loadCallback) {
          loadCallback.resolve(data);
          this.pendingCallbacks.delete(0);
        }
        break;

      case 'embeddings':
      case 'attention':
        const callback = this.pendingCallbacks.get(data.callbackId || 0);
        if (callback) {
          callback.resolve(data);
          this.pendingCallbacks.delete(data.callbackId || 0);
        }
        break;

      case 'error':
        console.error('❌ Worker error:', data.message);
        this.error = data.message;
        this.status = 'Error occurred';
        const errorCallback = this.pendingCallbacks.get(data.callbackId || 0);
        if (errorCallback) {
          errorCallback.reject(new Error(data.message));
          this.pendingCallbacks.delete(data.callbackId || 0);
        }
        break;
    }
  }

  handleWorkerError(error) {
    console.error('❌ Worker error:', error);
    this.error = error.message;
    this.isLoading = false;
    this.status = 'Worker error';
  }

  async sendMessage(type, data) {
    return new Promise((resolve, reject) => {
      const callbackId = this.callbackId++;
      this.pendingCallbacks.set(callbackId, { resolve, reject });

      this.worker.postMessage({
        type,
        data: { ...data, callbackId }
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        if (this.pendingCallbacks.has(callbackId)) {
          this.pendingCallbacks.delete(callbackId);
          reject(new Error('Request timeout'));
        }
      }, 60000);
    });
  }

  async loadModel() {
    if (!this.worker) {
      await this.initialize();
    }
    return { model: true, tokenizer: true, device: this.device };
  }

  async generateEmbeddings(texts, taskType = 'document') {
    if (!this.isReady) {
      await this.loadModel();
    }

    console.log(`🔄 TextGraph: Generating ${taskType} embeddings for ${texts.length} texts (Real)...`);
    const startTime = performance.now();

    try {
      const result = await this.sendMessage('embed', { texts, taskType });
      const endTime = performance.now();

      console.log(`✅ TextGraph: Generated ${result.length} real embeddings in ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`⚡ TextGraph: Average time per embedding: ${((endTime - startTime) / texts.length).toFixed(2)}ms`);

      return result;
    } catch (error) {
      console.error('❌ TextGraph: Embedding generation failed:', error);
      throw error;
    }
  }

  async generateEmbedding(text, taskType = 'document') {
    const embeddings = await this.generateEmbeddings([text], taskType);
    return embeddings[0];
  }

  async createEmbeddingAttentionMatrix(tokens, context = 'document') {
    if (!this.isReady) {
      await this.loadModel();
    }

    const taskType = context === 'query' ? 'query' : 'document';

    console.log(`🔍 TextGraph: Creating Real EmbeddingGemma attention matrix for ${tokens.length} tokens...`);

    try {
      const result = await this.sendMessage('attention', { tokens, taskType });

      console.log(`📊 TextGraph: Real attention matrix completed!`);
      console.log(`📈 TextGraph: Attention range: ${result.minAttention.toFixed(4)} to ${result.maxAttention.toFixed(4)}`);

      return result;
    } catch (error) {
      console.error('❌ TextGraph: Attention matrix creation failed:', error);
      throw error;
    }
  }

  calculateCosineSimilarity(embeddingA, embeddingB) {
    if (embeddingA.length !== embeddingB.length) {
      throw new Error('Embedding dimensions must match');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < embeddingA.length; i++) {
      dotProduct += embeddingA[i] * embeddingB[i];
      magnitudeA += embeddingA[i] * embeddingA[i];
      magnitudeB += embeddingB[i] * embeddingB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  getStatus() {
    return {
      isLoading: this.isLoading,
      isReady: this.isReady,
      progress: this.progress,
      status: this.status,
      error: this.error,
      modelName: this.modelName,
      device: this.device,
      embeddingDimension: this.embeddingDimension
    };
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
  }
}

// Create global instance
const realEmbeddingGemmaManager = new RealEmbeddingGemmaManager();

// Make available globally
window.RealEmbeddingGemmaManager = realEmbeddingGemmaManager;
console.log('🚀 TextGraph: RealEmbeddingGemmaManager attached to window globally');
console.log('✅ TextGraph: Real EmbeddingGemma ready to load');

export default realEmbeddingGemmaManager;
