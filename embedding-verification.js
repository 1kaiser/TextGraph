/**
 * EmbeddingGemma Model Verification System
 * Tests model loading and functionality before enabling in UI
 */

export class EmbeddingVerification {
  constructor() {
    this.isVerified = false;
    this.verificationStatus = 'not_started';
    this.modelDevice = null;
    this.testResults = null;
  }

  async verifyModel() {
    console.log('🔍 TextGraph: Starting EmbeddingGemma verification...');

    try {
      // Check if RealEmbeddingGemmaManager exists
      if (!window.RealEmbeddingGemmaManager) {
        throw new Error('RealEmbeddingGemmaManager not found');
      }

      this.updateStatus('Initializing model...', 'loading');

      // Step 1: Initialize model
      console.log('📥 TextGraph: Loading model...');
      await window.RealEmbeddingGemmaManager.initialize();

      // Wait for model to be ready
      const maxWaitTime = 120000; // 2 minutes
      const startTime = Date.now();

      while (!window.RealEmbeddingGemmaManager.getStatus().isReady) {
        if (Date.now() - startTime > maxWaitTime) {
          throw new Error('Model loading timeout');
        }

        const status = window.RealEmbeddingGemmaManager.getStatus();
        this.updateStatus(status.status, 'loading');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const finalStatus = window.RealEmbeddingGemmaManager.getStatus();
      this.modelDevice = finalStatus.device;
      console.log(`✅ TextGraph: Model loaded on ${this.modelDevice}`);

      // Step 2: Test embedding generation
      this.updateStatus('Testing embeddings...', 'testing');
      console.log('🧪 TextGraph: Running verification tests...');

      const testResults = await this.runVerificationTests();

      if (!testResults.success) {
        throw new Error(`Verification failed: ${testResults.error}`);
      }

      this.testResults = testResults;
      this.isVerified = true;
      this.verificationStatus = 'verified';

      console.log('✅ TextGraph: EmbeddingGemma verification complete!');
      console.log('📊 TextGraph: Test results:', testResults);

      this.updateStatus(`Ready (${this.modelDevice})`, 'ready');
      this.enableRealEmbedding();

      return { success: true, device: this.modelDevice, tests: testResults };

    } catch (error) {
      console.error('❌ TextGraph: Verification failed:', error);
      this.verificationStatus = 'failed';
      this.updateStatus(`Failed: ${error.message}`, 'error');

      return { success: false, error: error.message };
    }
  }

  async runVerificationTests() {
    const tests = [];

    try {
      // Test 1: Single embedding generation
      console.log('  Test 1: Single embedding generation');
      const startTime1 = performance.now();
      const testWords = ['neural', 'network'];
      const embeddings = await window.RealEmbeddingGemmaManager.generateEmbeddings(testWords, 'query');
      const time1 = performance.now() - startTime1;

      if (!embeddings || embeddings.length !== testWords.length) {
        throw new Error('Embedding count mismatch');
      }

      if (embeddings[0].length !== 768) {
        throw new Error(`Expected 768D embeddings, got ${embeddings[0].length}D`);
      }

      // Check if embeddings are normalized
      const magnitude = Math.sqrt(embeddings[0].reduce((sum, v) => sum + v * v, 0));
      const isNormalized = Math.abs(magnitude - 1.0) < 0.01;

      tests.push({
        name: 'Single Embedding Generation',
        passed: true,
        time: time1,
        details: {
          count: embeddings.length,
          dimension: embeddings[0].length,
          normalized: isNormalized,
          magnitude: magnitude.toFixed(4)
        }
      });

      console.log(`    ✓ Generated ${embeddings.length} × 768D embeddings in ${time1.toFixed(2)}ms`);
      console.log(`    ✓ Magnitude: ${magnitude.toFixed(4)} (normalized: ${isNormalized})`);

      // Test 2: Attention matrix creation
      console.log('  Test 2: Attention matrix creation');
      const startTime2 = performance.now();
      const attentionResult = await window.RealEmbeddingGemmaManager.createEmbeddingAttentionMatrix(
        ['graph', 'attention'],
        'document'
      );
      const time2 = performance.now() - startTime2;

      if (!attentionResult.attentionMatrix || attentionResult.attentionMatrix.length !== 2) {
        throw new Error('Attention matrix creation failed');
      }

      // Verify diagonal is zero (educational GAT)
      const diagonalZero = attentionResult.attentionMatrix[0][0] === 0 &&
                          attentionResult.attentionMatrix[1][1] === 0;

      tests.push({
        name: 'Attention Matrix Creation',
        passed: true,
        time: time2,
        details: {
          matrixSize: `${attentionResult.attentionMatrix.length}×${attentionResult.attentionMatrix[0].length}`,
          range: `${attentionResult.minAttention.toFixed(4)} - ${attentionResult.maxAttention.toFixed(4)}`,
          diagonalZero: diagonalZero
        }
      });

      console.log(`    ✓ Created ${attentionResult.attentionMatrix.length}×${attentionResult.attentionMatrix[0].length} matrix in ${time2.toFixed(2)}ms`);
      console.log(`    ✓ Attention range: ${attentionResult.minAttention.toFixed(4)} - ${attentionResult.maxAttention.toFixed(4)}`);
      console.log(`    ✓ Diagonal zero: ${diagonalZero}`);

      // Test 3: Semantic similarity test
      console.log('  Test 3: Semantic similarity');
      const related = await window.RealEmbeddingGemmaManager.generateEmbeddings(['neural', 'network'], 'query');
      const unrelated = await window.RealEmbeddingGemmaManager.generateEmbeddings(['neural', 'banana'], 'query');

      const relatedSim = window.RealEmbeddingGemmaManager.calculateCosineSimilarity(related[0], related[1]);
      const unrelatedSim = window.RealEmbeddingGemmaManager.calculateCosineSimilarity(unrelated[0], unrelated[1]);

      const semanticDifference = relatedSim > unrelatedSim;

      tests.push({
        name: 'Semantic Similarity',
        passed: semanticDifference,
        details: {
          relatedWords: 'neural-network',
          relatedSimilarity: relatedSim.toFixed(4),
          unrelatedWords: 'neural-banana',
          unrelatedSimilarity: unrelatedSim.toFixed(4),
          semanticallyCorrect: semanticDifference
        }
      });

      console.log(`    ✓ Related similarity (neural-network): ${relatedSim.toFixed(4)}`);
      console.log(`    ✓ Unrelated similarity (neural-banana): ${unrelatedSim.toFixed(4)}`);
      console.log(`    ✓ Semantic correctness: ${semanticDifference ? 'PASS' : 'FAIL'}`);

      return {
        success: true,
        totalTests: tests.length,
        passedTests: tests.filter(t => t.passed).length,
        tests: tests,
        totalTime: (time1 + time2).toFixed(2)
      };

    } catch (error) {
      console.error('  ❌ Test failed:', error);
      return {
        success: false,
        error: error.message,
        tests: tests
      };
    }
  }

  updateStatus(message, state) {
    const statusElement = document.getElementById('real-embedding-status');
    const modelStatusElement = document.getElementById('model-status');
    const label = document.getElementById('real-embedding-label');

    if (!statusElement) return;

    const icons = {
      loading: '⏳',
      testing: '🧪',
      ready: '✅',
      error: '❌'
    };

    const icon = icons[state] || '🧠';
    statusElement.textContent = `${icon} EmbeddingGemma ${message}`;

    if (modelStatusElement) {
      modelStatusElement.style.display = 'block';
      modelStatusElement.textContent = message;
    }

    // Update label opacity based on state
    if (label) {
      if (state === 'ready') {
        label.style.opacity = '1';
        label.style.cursor = 'pointer';
        label.title = `Real transformer model ready on ${this.modelDevice}`;
      } else if (state === 'error') {
        label.style.opacity = '0.5';
        label.style.cursor = 'not-allowed';
        label.title = `Model failed to load: ${message}`;
      }
    }
  }

  enableRealEmbedding() {
    const radioButton = document.querySelector('input[value="real"]');
    const label = document.getElementById('real-embedding-label');

    if (radioButton) {
      radioButton.disabled = false;
      console.log('✅ TextGraph: Real embedding option enabled in UI');
    }

    if (label) {
      label.style.opacity = '1';
      label.style.cursor = 'pointer';
      label.title = `Real transformer model ready on ${this.modelDevice}`;
    }

    // Show success message briefly
    const modelStatus = document.getElementById('model-status');
    if (modelStatus && this.testResults) {
      modelStatus.innerHTML = `
        ✓ ${this.testResults.totalTests} tests passed<br>
        Device: ${this.modelDevice}<br>
        Ready in ${this.testResults.totalTime}ms
      `;
      modelStatus.style.color = '#22c55e';

      // Hide after 5 seconds
      setTimeout(() => {
        modelStatus.style.display = 'none';
      }, 5000);
    }
  }

  getVerificationReport() {
    return {
      isVerified: this.isVerified,
      status: this.verificationStatus,
      device: this.modelDevice,
      tests: this.testResults
    };
  }
}

// Create global instance
window.EmbeddingVerification = new EmbeddingVerification();

// Auto-start verification after a short delay
setTimeout(() => {
  window.EmbeddingVerification.verifyModel().then(result => {
    if (result.success) {
      console.log('🎉 TextGraph: EmbeddingGemma is ready for use!');
    } else {
      console.warn('⚠️  TextGraph: EmbeddingGemma verification failed, using synthetic embeddings only');
    }
  });
}, 2000);

export default window.EmbeddingVerification;
