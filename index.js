/**
 * Main entry point for text-as-graph visualization
 */

import './d3-conventions';
import { TextAsGraph } from './text-as-graph-v2';

// Global variables for the interface
let textAsGraphInstance = null;

// Make functions globally available for HTML onclick handlers
window.toggleParagraph = function() {
  const container = document.getElementById('paragraph-container');
  const button = document.getElementById('toggle-paragraph');
  if (container.style.display === 'none') {
    container.style.display = 'block';
    button.textContent = '▲';
  } else {
    container.style.display = 'none';
    button.textContent = '▼';
  }
};

window.updateVisualization = function() {
  const textInput = document.getElementById('manual-text-input');
  const paragraphInput = document.getElementById('paragraph-input');
  
  if (textInput && paragraphInput) {
    const queryText = textInput.value.trim();
    const paragraphText = paragraphInput.value.trim();
    
    // Compute and apply GAT attention
    const attentionData = computeGATAttention(paragraphText, queryText);
    applyAttentionColoring(attentionData, queryText);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  // Create the text-as-graph visualization
  textAsGraphInstance = new TextAsGraph();
  
  // Set up manual text input interface
  setupTextInput();
  
  console.log('Text-as-graph visualization initialized');
}

function setupTextInput() {
  const textInput = document.getElementById('manual-text-input');
  const updateButton = document.getElementById('update-graph');
  
  if (!textInput || !updateButton) {
    console.warn('Text input interface elements not found');
    return;
  }
  
  // Add event listeners
  textInput.addEventListener('keydown', function(e) {
    // Allow Enter key to trigger update
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      updateVisualization();
    }
  });
}

// Debug function for testing dual GAT
window.debugDualGAT = function debugDualGAT() {
  console.log('🔍 DEBUG: Testing dual GAT functions...');
  
  const testParagraph = 'Neural networks are powerful tools. Graph attention mechanisms capture relationships.';
  const testQuery = 'graph attention mechanisms';
  
  console.log('📝 Test paragraph:', testParagraph);
  console.log('🎯 Test query:', testQuery);
  
  // Test Educational GAT
  try {
    const educationalResult = computeGATAttention(testParagraph, testQuery);
    console.log('🎓 Educational GAT result:', educationalResult);
  } catch (error) {
    console.error('❌ Educational GAT error:', error);
  }
  
  // Test Original GAT
  try {
    const originalResult = computeOriginalGATAttention(testParagraph, testQuery);
    console.log('🔬 Original GAT result:', originalResult);
  } catch (error) {
    console.error('❌ Original GAT error:', error);
  }
  
  // Check for existing matrices
  const container = d3.select('#text-as-graph');
  const dualMatrices = container.selectAll('.dual-matrix');
  console.log(`📊 Existing dual matrices: ${dualMatrices.size()}`);
  
  // Try to manually trigger the dual matrix creation
  try {
    const educationalGAT = computeGATAttention(testParagraph, testQuery);
    const originalGAT = computeOriginalGATAttention(testParagraph, testQuery);
    
    console.log('🔧 Manually triggering createOriginalStyleDualMatrices...');
    createOriginalStyleDualMatrices(educationalGAT, originalGAT, testQuery);
    
    // Check again after creation
    const newDualMatrices = container.selectAll('.dual-matrix');
    console.log(`📊 Dual matrices after creation: ${newDualMatrices.size()}`);
    
    // Setup hover interactions
    console.log('🖱️ Setting up hover interactions...');
    setupGraphToMatrixHover(educationalGAT.queryTokens);
    
  } catch (error) {
    console.error('❌ Manual creation error:', error);
  }
  
  console.log('✅ Debug test complete');
};

// Global function to update the visualization with GAT
window.updateVisualization = async function updateVisualization() {
  const textInput = document.getElementById('manual-text-input');
  const paragraphInput = document.getElementById('paragraph-input');
  
  if (!textInput || !textAsGraphInstance) {
    console.warn('Cannot update visualization: missing elements');
    return;
  }
  
  const queryText = textInput.value.trim();
  const paragraphText = paragraphInput ? paragraphInput.value.trim() : '';
  
  if (!queryText) {
    console.warn('Cannot update visualization: empty query text');
    return;
  }
  
  // Check which embedding method is selected
  const embeddingMethod = document.querySelector('input[name="embedding-method"]:checked')?.value || 'synthetic';
  
  console.log(`🧠 Computing GAT attention with ${embeddingMethod} embeddings...`);
  console.log('📄 Paragraph:', paragraphText.substring(0, 50) + '...');
  console.log('🎯 Query:', queryText);
  
  // Compute both Educational and Original GAT attention
  let educationalGAT, originalGAT;
  
  if (embeddingMethod === 'real' && window.EmbeddingGemmaManager) {
    // Use EmbeddingGemma for semantic embeddings
    console.log('🔧 Using EmbeddingGemma semantic embeddings...');
    
    try {
      educationalGAT = await computeEmbeddingGATAttention(paragraphText, queryText, 'educational');
      originalGAT = await computeEmbeddingGATAttention(paragraphText, queryText, 'original');
    } catch (error) {
      console.error('❌ EmbeddingGemma failed, falling back to synthetic:', error);
      educationalGAT = computeGATAttention(paragraphText, queryText);
      originalGAT = computeOriginalGATAttention(paragraphText, queryText);
    }
  } else {
    // Use synthetic embeddings (original method)
    console.log('🎲 Using synthetic embeddings...');
    educationalGAT = computeGATAttention(paragraphText, queryText);
    originalGAT = computeOriginalGATAttention(paragraphText, queryText);
  }
  
  console.log('📊 Educational GAT range:', educationalGAT.minAttention.toFixed(4), 'to', educationalGAT.maxAttention.toFixed(4));
  console.log('📊 Original GAT range:', originalGAT.minAttention.toFixed(4), 'to', originalGAT.maxAttention.toFixed(4));
  
  // Update the visualization with both attention implementations
  const visualizationInput = document.querySelector('#text-as-graph input');
  if (visualizationInput) {
    visualizationInput.value = queryText;
    
    // Trigger the render function with attention weights
    if (textAsGraphInstance && typeof textAsGraphInstance.renderWithAttention === 'function') {
      textAsGraphInstance.renderWithAttention(attentionWeights);
    } else if (textAsGraphInstance && typeof textAsGraphInstance.render === 'function') {
      textAsGraphInstance.render();
      // Apply attention coloring after render with both implementations
      applyDualAttentionColoring(educationalGAT, originalGAT, queryText);
    } else {
      // Fallback: trigger input event then apply coloring
      visualizationInput.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => applyDualAttentionColoring(educationalGAT, originalGAT, queryText), 100);
    }
    
    console.log('✅ GAT visualization updated');
  }
}

// MathJax-based GAT attention computation
function computeGATAttention(paragraphText, queryText) {
  console.log('🧮 Computing GAT attention with MathJax...');
  
  // Tokenize inputs
  const paragraphTokens = paragraphText ? paragraphText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w) : [];
  const queryTokens = queryText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w);
  
  console.log('📝 Paragraph tokens:', paragraphTokens);
  console.log('🎯 Query tokens:', queryTokens);
  
  // Use MathJax for mathematical computation
  const mathResults = computeAttentionMathematically(paragraphTokens, queryTokens);
  
  return {
    queryTokens,
    attentionMatrix: mathResults.attentionMatrix,
    minAttention: mathResults.minAttention,
    maxAttention: mathResults.maxAttention,
    computationDetails: mathResults.details,
    paragraphTokens: paragraphTokens.slice(0, 20)
  };
}

// Mathematical attention computation using MathJax-style calculations
function computeAttentionMathematically(paragraphTokens, queryTokens) {
  console.log('🧮 Mathematical attention computation...');
  
  const n = queryTokens.length;
  
  // Initialize matrices
  const embeddings = createEmbeddingMatrix(paragraphTokens, queryTokens);
  const attentionScores = createAttentionScoreMatrix(embeddings, queryTokens);
  const attentionMatrix = applySoftmaxNormalization(attentionScores);
  
  // Calculate global statistics
  let minAttention = 1.0;
  let maxAttention = 0.0;
  
  attentionMatrix.forEach(row => {
    row.forEach(val => {
      if (val > 0) { // Exclude self-attention
        minAttention = Math.min(minAttention, val);
        maxAttention = Math.max(maxAttention, val);
      }
    });
  });
  
  console.log(`📊 Attention range: [${minAttention.toFixed(4)}, ${maxAttention.toFixed(4)}]`);
  
  return {
    attentionMatrix,
    minAttention,
    maxAttention,
    details: {
      embeddings: embeddings.length,
      matrixSize: `${n}x${n}`,
      nonZeroElements: attentionMatrix.flat().filter(v => v > 0).length
    }
  };
}

// Create embedding vectors for tokens
function createEmbeddingMatrix(paragraphTokens, queryTokens) {
  console.log('🎯 Creating embedding vectors...');
  
  const embeddings = [];
  
  queryTokens.forEach((token, i) => {
    // Create 64-dimensional embedding based on token properties
    const embedding = [];
    
    // Seed random number generator based on token
    let seed = 0;
    for (let c = 0; c < token.length; c++) {
      seed += token.charCodeAt(c);
    }
    
    // Generate deterministic "embedding"
    for (let d = 0; d < 64; d++) {
      const value = Math.sin(seed * (d + 1) * 0.01) * 0.5 + 
                   Math.cos(seed * (d + 1) * 0.02) * 0.3 +
                   (paragraphTokens.includes(token) ? 0.2 : 0);
      embedding.push(value);
    }
    
    embeddings.push(embedding);
  });
  
  console.log(`✅ Created ${embeddings.length} embeddings of dimension ${embeddings[0].length}`);
  return embeddings;
}

// Compute attention scores using embedding dot products
function createAttentionScoreMatrix(embeddings, queryTokens) {
  console.log('⚡ Computing attention scores...');
  
  const n = queryTokens.length;
  const scores = [];
  
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        row.push(0); // No self-attention
      } else {
        // Compute attention as dot product of embeddings
        let dotProduct = 0;
        for (let d = 0; d < embeddings[i].length; d++) {
          dotProduct += embeddings[i][d] * embeddings[j][d];
        }
        
        // Apply LeakyReLU activation
        const score = Math.max(0.1 * dotProduct, dotProduct);
        
        // Add positional bias (adjacent words get bonus)
        const positionBias = Math.abs(i - j) === 1 ? 0.3 : 0;
        
        row.push(Math.max(0, score + positionBias));
      }
    }
    scores.push(row);
  }
  
  console.log('✅ Attention scores computed');
  return scores;
}

// Apply softmax normalization to attention scores
function applySoftmaxNormalization(scores) {
  console.log('🔄 Applying softmax normalization...');
  
  const normalized = [];
  
  scores.forEach(row => {
    // Compute exponentials
    const exp_scores = row.map(score => Math.exp(score));
    
    // Compute sum for normalization
    const sum = exp_scores.reduce((a, b) => a + b, 0);
    
    // Normalize to probabilities and pre-round to 1 decimal place
    const normalizedRow = sum > 0 ? 
      exp_scores.map(exp_score => parseFloat((exp_score / sum).toFixed(1))) : 
      row.map(val => parseFloat(val.toFixed(1)));
    
    normalized.push(normalizedRow);
  });
  
  console.log('✅ Softmax normalization complete');
  return normalized;
}

// Apply GAT attention coloring with transparency-based visualization
function applyAttentionColoring(attentionData, queryText) {
  console.log('🔄 applyAttentionColoring called with:', attentionData);
  
  if (!attentionData || !attentionData.attentionMatrix) {
    console.log('❌ No attention data or matrix');
    return;
  }
  
  const { queryTokens, attentionMatrix } = attentionData;
  
  console.log('🎨 Applying attention transparency visualization...');
  console.log('📊 Query tokens:', queryTokens);
  console.log('🧮 Attention matrix size:', attentionMatrix.length, 'x', attentionMatrix[0].length);
  
  // Use precalculated min/max from MathJax computation
  const minAttention = attentionData.minAttention || 0;
  const maxAttention = attentionData.maxAttention || 1;
  
  console.log(`📊 Using precalculated attention range: ${minAttention.toFixed(4)} to ${maxAttention.toFixed(4)}`);
  
  // Calculate node attention strengths (max attention received)
  const nodeMaxAttention = [];
  queryTokens.forEach((_, i) => {
    let maxAttn = 0;
    attentionMatrix.forEach(row => {
      if (row[i] > maxAttn) maxAttn = row[i];
    });
    nodeMaxAttention.push(maxAttn);
  });
  
  // Apply transparency to graph nodes (attention = 0 → transparent, attention = 1 → opaque)
  d3.selectAll('#text-as-graph text').each(function(d, i) {
    if (i < nodeMaxAttention.length) {
      const attention = nodeMaxAttention[i];
      const opacity = attention; // Direct mapping: 0-1 → 0%-100% opacity
      
      d3.select(this)
        .style('fill', '#2563eb') // Fixed blue color
        .style('opacity', opacity);
    }
  });
  
  // Apply transparency to rectangles with same logic
  d3.selectAll('#text-as-graph rect').each(function(d, i) {
    if (i < nodeMaxAttention.length) {
      const attention = nodeMaxAttention[i];
      const opacity = attention;
      
      d3.select(this)
        .style('fill', '#fbbf24') // Fixed yellow color
        .style('stroke', '#2563eb')
        .style('opacity', opacity);
    }
  });
  
  // Update the existing adjacency matrix with attention values
  updateExistingMatrix(attentionMatrix, queryTokens, minAttention, maxAttention);
  
  // Add hover interactions
  setupAttentionHoverInteractions(attentionData);
}

// Update the existing adjacency matrix SVG with attention values
function updateExistingMatrix(attentionMatrix, queryTokens, minAttention, maxAttention) {
  console.log('🧮 Updating existing adjacency matrix with GAT attention...');
  
  // Find the existing matrix SVG (the one with rect elements and labels)
  const matrixSvg = d3.select('#text-as-graph').selectAll('svg')
    .filter(function() {
      return d3.select(this).selectAll('rect').size() >= queryTokens.length * queryTokens.length;
    });
  
  if (!matrixSvg.empty()) {
    console.log('📍 Found existing matrix SVG, applying GAT attention...');
    updateOriginalMatrixWithAttention(matrixSvg, attentionMatrix, queryTokens, minAttention, maxAttention);
  } else {
    console.log('📍 Matrix SVG not found, checking all rects...');
    // Fallback: update any rect elements that could be matrix cells
    updateAnyMatrixRects(attentionMatrix, queryTokens, minAttention, maxAttention);
  }
}

// Update the original matrix rectangles with attention-based transparency
function updateOriginalMatrixWithAttention(svg, attentionMatrix, queryTokens, minAttention, maxAttention) {
  console.log('🎯 Applying attention to original matrix rectangles...');
  
  // Get all rect elements in the matrix SVG
  const rects = svg.selectAll('rect');
  console.log(`📊 Found ${rects.size()} rectangles to update`);
  
  rects.each(function(d, index) {
    // Calculate row and column from rectangle position/index
    const row = Math.floor(index / queryTokens.length);
    const col = index % queryTokens.length;
    
    if (row < attentionMatrix.length && col < queryTokens.length) {
      const attention = attentionMatrix[row][col];
      
      // Calculate opacity based on attention value
      let opacity;
      let fillColor;
      
      if (attention === 0) {
        opacity = 0.1; // Self-attention: very transparent
        fillColor = '#f3f4f6'; // Light gray
      } else {
        // Map attention to opacity: higher attention = more opaque
        const range = maxAttention - minAttention;
        if (range > 0) {
          const normalizedValue = (attention - minAttention) / range;
          opacity = 0.2 + 0.8 * normalizedValue; // 20% to 100% opacity
        } else {
          opacity = 0.6;
        }
        fillColor = '#3b82f6'; // Blue for connections
      }
      
      // Update the rectangle
      d3.select(this)
        .style('fill', fillColor)
        .style('opacity', opacity)
        .attr('data-attention', attention.toFixed(1))
        .attr('data-row', row)
        .attr('data-col', col);
      
      console.log(`📦 Updated rect[${row},${col}] attention=${attention.toFixed(3)} opacity=${opacity.toFixed(2)}`);
    }
  });
  
  // Add attention scores as text overlays
  addAttentionScoresToMatrix(svg, attentionMatrix, queryTokens, minAttention, maxAttention);
}

// Fallback: update any matrix rectangles found
function updateAnyMatrixRects(attentionMatrix, queryTokens, minAttention, maxAttention) {
  console.log('🔍 Searching for matrix rectangles to update...');
  
  // Find all rect elements that could be matrix cells
  const allRects = d3.selectAll('#text-as-graph rect');
  console.log(`📊 Found ${allRects.size()} total rectangles`);
  
  // Filter to likely matrix rectangles (smaller, grid-positioned)
  const matrixRects = allRects.filter(function() {
    const rect = d3.select(this);
    const width = parseFloat(rect.attr('width'));
    const height = parseFloat(rect.attr('height'));
    
    // Matrix cells are typically small squares (updated for 1.3x size)
    return width <= 40 && height <= 40 && Math.abs(width - height) <= 5;
  });
  
  console.log(`🎯 Found ${matrixRects.size()} potential matrix rectangles`);
  
  if (matrixRects.size() >= queryTokens.length * queryTokens.length) {
    matrixRects.each(function(d, index) {
      const row = Math.floor(index / queryTokens.length);
      const col = index % queryTokens.length;
      
      if (row < attentionMatrix.length && col < queryTokens.length) {
        const attention = attentionMatrix[row][col];
        
        // Apply attention-based styling
        let opacity = attention === 0 ? 0.1 : 0.2 + 0.8 * attention;
        let fillColor = attention === 0 ? '#f3f4f6' : '#3b82f6';
        
        d3.select(this)
          .style('fill', fillColor)
          .style('opacity', opacity)
          .attr('data-attention', attention.toFixed(1));
      }
    });
  }
}

// Add attention scores as text overlays to existing matrix
function addAttentionScoresToMatrix(svg, attentionMatrix, queryTokens, minAttention, maxAttention) {
  console.log('🔢 Adding attention scores to matrix...');
  
  // Remove existing attention scores
  svg.selectAll('.gat-attention-score').remove();
  
  // Get matrix rectangles
  const rects = svg.selectAll('rect');
  
  rects.each(function(d, index) {
    const rect = d3.select(this);
    const row = Math.floor(index / queryTokens.length);
    const col = index % queryTokens.length;
    
    if (row < attentionMatrix.length && col < queryTokens.length) {
      const attention = attentionMatrix[row][col];
      
      // Get rectangle position
      const x = parseFloat(rect.attr('x') || rect.attr('transform')?.match(/translate\((\d+)/)?.[1] || 0);
      const y = parseFloat(rect.attr('y') || rect.attr('transform')?.match(/translate\(\d+,\s*(\d+)/)?.[1] || 0);
      const width = parseFloat(rect.attr('width')) || 20;
      const height = parseFloat(rect.attr('height')) || 20;
      
      // Add attention score text
      svg.append('text')
        .attr('class', 'gat-attention-score')
        .attr('x', x + width/2)
        .attr('y', y + height/2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('fill', attention > 0.5 ? 'white' : '#1f2937')
        .style('pointer-events', 'none')
        .text(attention.toFixed(1));
    }
  });
}

// Update matrix within the main SVG visualization
function updateMatrixInMainSvg(svg, attentionMatrix, queryTokens, minAttention, maxAttention) {
  console.log('🎯 Updating matrix in main SVG...');
  
  // Clear existing matrix elements
  svg.selectAll('.adj-mat-square').remove();
  svg.selectAll('.attention-score').remove();
  svg.selectAll('.matrix-label').remove();
  
  const matrixSize = 39; // 30 * 1.3 = 39
  const matrixStartX = 50;
  const matrixStartY = 200;
  
  // Add matrix title
  svg.append('text')
    .attr('class', 'matrix-label')
    .attr('x', matrixStartX + (queryTokens.length * matrixSize) / 2)
    .attr('y', matrixStartY - 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('fill', '#374151')
    .text('🧮 Attention Matrix');
  
  // Create matrix cells with GAT attention values
  attentionMatrix.forEach((row, i) => {
    row.forEach((attention, j) => {
      // Calculate transparency based on full matrix min/max normalization
      let opacity;
      let cellColor;
      
      if (attention === 0) {
        opacity = 0.1; // Self-attention: mostly transparent
        cellColor = '#e5e7eb';
      } else {
        // Map attention range to opacity: min→10%, max→90%
        const range = maxAttention - minAttention;
        if (range > 0) {
          const normalizedValue = (attention - minAttention) / range;
          opacity = 0.1 + 0.8 * normalizedValue; // 10% to 90% opacity
        } else {
          opacity = 0.5;
        }
        cellColor = '#3b82f6'; // Blue for attention connections
      }
      
      // Create matrix cell
      svg.append('rect')
        .attr('class', 'adj-mat-square')
        .attr('x', matrixStartX + j * matrixSize)
        .attr('y', matrixStartY + i * matrixSize)
        .attr('width', matrixSize - 2)
        .attr('height', matrixSize - 2)
        .style('fill', cellColor)
        .style('opacity', opacity)
        .style('stroke', '#1f2937')
        .style('stroke-width', 1)
        .style('cursor', 'pointer')
        .attr('data-row', i)
        .attr('data-col', j)
        .attr('data-attention', attention);
      
      // Add attention value text
      svg.append('text')
        .attr('class', 'attention-score')
        .attr('x', matrixStartX + j * matrixSize + matrixSize/2)
        .attr('y', matrixStartY + i * matrixSize + matrixSize/2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('fill', opacity > 0.5 ? 'white' : '#1f2937')
        .style('pointer-events', 'none')
        .text(attention.toFixed(1));
    });
  });
  
  // Add row and column labels
  queryTokens.forEach((token, i) => {
    // Row labels (left side)
    svg.append('text')
      .attr('class', 'matrix-label')
      .attr('x', matrixStartX - 5)
      .attr('y', matrixStartY + i * matrixSize + matrixSize/2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(token.substring(0, 6));
    
    // Column labels (top)
    svg.append('text')
      .attr('class', 'matrix-label')
      .attr('x', matrixStartX + i * matrixSize + matrixSize/2)
      .attr('y', matrixStartY - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(token.substring(0, 6));
  });
}

// Update existing matrix SVG (fallback)
function updateMatrixSvg(svg, attentionMatrix, queryTokens, minAttention, maxAttention) {
  console.log('🔄 Updating existing matrix SVG...');
  
  // Update existing squares with new attention values
  svg.selectAll('.adj-mat-square').each(function(d, i) {
    const row = Math.floor(i / queryTokens.length);
    const col = i % queryTokens.length;
    
    if (row < attentionMatrix.length && col < queryTokens.length) {
      const attention = attentionMatrix[row][col];
      
      // Calculate opacity
      let opacity;
      let cellColor;
      
      if (attention === 0) {
        opacity = 0.1;
        cellColor = '#e5e7eb';
      } else {
        const range = maxAttention - minAttention;
        const normalizedValue = range > 0 ? (attention - minAttention) / range : 0.5;
        opacity = 0.1 + 0.8 * normalizedValue;
        cellColor = '#3b82f6';
      }
      
      d3.select(this)
        .style('fill', cellColor)
        .style('opacity', opacity)
        .attr('data-attention', attention);
    }
  });
}

// Map attention values to colors
function getAttentionColor(attention) {
  if (attention >= 0.5) return '#dc3545'; // Red - Very High
  if (attention >= 0.3) return '#fd7e14'; // Orange - High  
  if (attention >= 0.15) return '#ffc107'; // Yellow - Medium
  if (attention >= 0.05) return '#28a745'; // Green - Low
  return '#f8f9fa'; // Light gray - Minimal
}

// Setup hover interactions between graph and matrix
function setupAttentionHoverInteractions(attentionData) {
  const { queryTokens, attentionMatrix } = attentionData;
  
  // Graph node hover highlights matrix row/column
  d3.selectAll('#text-as-graph text').on('mouseover', function(d, i) {
    if (i < queryTokens.length) {
      // Highlight matrix row and column
      d3.selectAll('.adj-mat-square').each(function(_, squareIndex) {
        const row = Math.floor(squareIndex / queryTokens.length);
        const col = squareIndex % queryTokens.length;
        
        if (row === i || col === i) {
          d3.select(this).style('stroke', '#000').style('stroke-width', 3);
        }
      });
      
      // Show tooltip
      const attention = attentionMatrix[i] || [];
      const tooltip = `${queryTokens[i]}: [${attention.map(a => a.toFixed(2)).join(', ')}]`;
      console.log('🎯 Hover:', tooltip);
    }
  }).on('mouseout', function() {
    // Reset matrix highlighting
    d3.selectAll('.adj-mat-square').style('stroke', '#333').style('stroke-width', 1);
  });
  
  // Matrix cell hover highlights corresponding graph nodes
  d3.selectAll('.adj-mat-square').on('mouseover', function(d, i) {
    const row = Math.floor(i / queryTokens.length);
    const col = i % queryTokens.length;
    
    // Highlight corresponding graph nodes
    d3.selectAll('#text-as-graph text').each(function(_, nodeIndex) {
      if (nodeIndex === row || nodeIndex === col) {
        d3.select(this).style('stroke', '#000').style('stroke-width', 2);
      }
    });
    
    const attention = attentionMatrix[row] && attentionMatrix[row][col];
    if (attention !== undefined) {
      console.log(`🔗 Matrix [${row},${col}]: ${queryTokens[row]} → ${queryTokens[col]} = ${attention.toFixed(3)}`);
    }
  }).on('mouseout', function() {
    // Reset graph node highlighting  
    d3.selectAll('#text-as-graph text').style('stroke', 'none');
  });
}

// ================== ORIGINAL GAT IMPLEMENTATION ==================

/**
 * Original GAT Implementation following Veličković et al. (2017)
 * Key differences from educational version:
 * 1. Includes self-attention (i==j)
 * 2. Uses learnable weight matrix W and attention vector 'a'
 * 3. Concatenated feature attention mechanism
 * 4. More realistic node feature representations
 */
function computeOriginalGATAttention(paragraphText, queryText) {
  console.log('🔬 Computing Original GAT attention (Veličković et al.)...');
  
  // Tokenize inputs
  const paragraphTokens = paragraphText ? paragraphText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w) : [];
  const queryTokens = queryText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w);
  
  console.log('🧬 Original GAT - Query tokens:', queryTokens);
  
  // Use original GAT mathematical computation
  const mathResults = computeOriginalGATMathematically(paragraphTokens, queryTokens);
  
  return {
    queryTokens,
    attentionMatrix: mathResults.attentionMatrix,
    minAttention: mathResults.minAttention,
    maxAttention: mathResults.maxAttention,
    computationDetails: mathResults.details,
    paragraphTokens: paragraphTokens.slice(0, 20)
  };
}

function computeOriginalGATMathematically(paragraphTokens, queryTokens) {
  console.log('🧮 Original GAT Mathematical computation...');
  
  const n = queryTokens.length;
  
  // Initialize learnable parameters (simulated as deterministic for visualization)
  const W = createLearnableWeightMatrix(64, 32); // Transform 64D → 32D features
  const a = createAttentionVector(64); // 64D attention vector (2 * 32D concatenated)
  
  // Create node features and transform with W
  const nodeFeatures = createOriginalNodeFeatures(paragraphTokens, queryTokens);
  const transformedFeatures = nodeFeatures.map(h => matrixVectorMultiply(W, h));
  
  // Compute attention scores using concatenated features
  const attentionScores = createOriginalAttentionScores(transformedFeatures, a);
  const attentionMatrix = applySoftmaxNormalization(attentionScores);
  
  // Calculate statistics (including self-attention)
  let minAttention = 1.0;
  let maxAttention = 0.0;
  
  attentionMatrix.forEach(row => {
    row.forEach(val => {
      minAttention = Math.min(minAttention, val);
      maxAttention = Math.max(maxAttention, val);
    });
  });
  
  console.log(`📊 Original GAT range: [${minAttention.toFixed(4)}, ${maxAttention.toFixed(4)}]`);
  
  return {
    attentionMatrix,
    minAttention,
    maxAttention,
    details: {
      features: transformedFeatures.length,
      weightMatrix: `64x32`,
      attentionVector: `64D`,
      selfAttention: 'included'
    }
  };
}

function createLearnableWeightMatrix(inputDim, outputDim) {
  const W = [];
  for (let i = 0; i < outputDim; i++) {
    const row = [];
    for (let j = 0; j < inputDim; j++) {
      // Simulated learnable weights (Xavier initialization)
      const limit = Math.sqrt(6.0 / (inputDim + outputDim));
      row.push((Math.random() * 2 - 1) * limit);
    }
    W.push(row);
  }
  return W;
}

function createAttentionVector(dim) {
  const a = [];
  // Create more diverse attention weights for better differentiation
  for (let i = 0; i < dim; i++) {
    // Use deterministic but varied weights based on position
    const weight = Math.sin(i * 0.1) * 0.3 + Math.cos(i * 0.05) * 0.2;
    a.push(weight);
  }
  return a;
}

function createOriginalNodeFeatures(paragraphTokens, queryTokens) {
  console.log('🎯 Creating original node features...');
  
  const features = [];
  
  queryTokens.forEach((token, i) => {
    const feature = [];
    
    // More sophisticated feature representation
    let seed = 0;
    for (let c = 0; c < token.length; c++) {
      seed += token.charCodeAt(c);
    }
    
    // 64-dimensional features with richer representations
    for (let d = 0; d < 64; d++) {
      let value = 0;
      
      // Lexical features
      value += Math.sin(seed * (d + 1) * 0.01) * 0.3;
      value += Math.cos(seed * (d + 1) * 0.02) * 0.2;
      
      // Contextual features (if token appears in paragraph)
      if (paragraphTokens.includes(token)) {
        value += Math.sin((seed + paragraphTokens.indexOf(token)) * 0.03) * 0.2;
      }
      
      // Positional features
      value += Math.sin(i * 0.1 + d * 0.05) * 0.1;
      
      // Length-based features
      value += (token.length / 10.0) * Math.cos(d * 0.04);
      
      feature.push(value);
    }
    
    features.push(feature);
  });
  
  console.log(`✅ Created ${features.length} original features of dimension ${features[0].length}`);
  return features;
}

function matrixVectorMultiply(matrix, vector) {
  const result = [];
  for (let i = 0; i < matrix.length; i++) {
    let sum = 0;
    for (let j = 0; j < vector.length; j++) {
      sum += matrix[i][j] * vector[j];
    }
    result.push(sum);
  }
  return result;
}

function createOriginalAttentionScores(transformedFeatures, attentionVector) {
  console.log('⚡ Computing original attention scores...');
  
  const n = transformedFeatures.length;
  const scores = [];
  
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      // Concatenate transformed features: [Wh_i || Wh_j]
      const concatenated = [...transformedFeatures[i], ...transformedFeatures[j]];
      
      // Compute e_ij = a^T [Wh_i || Wh_j]
      let e_ij = 0;
      for (let k = 0; k < Math.min(attentionVector.length, concatenated.length); k++) {
        e_ij += attentionVector[k] * concatenated[k];
      }
      
      // Debug logging for first computation
      if (i === 0 && j === 0) {
        console.log(`🔍 Debug: concatenated length=${concatenated.length}, attention vector length=${attentionVector.length}`);
        console.log(`🔍 Debug: e_ij raw=${e_ij.toFixed(4)}`);
      }
      
      // Apply LeakyReLU activation
      const leakyRelu = e_ij > 0 ? e_ij : 0.01 * e_ij;
      
      row.push(leakyRelu);
    }
    scores.push(row);
  }
  
  console.log('✅ Original attention scores computed');
  return scores;
}

// ================== DUAL VISUALIZATION FUNCTIONS ==================

function applyDualAttentionColoring(educationalGAT, originalGAT, queryText) {
  console.log('🎨 Applying dual GAT visualization...');
  
  // Apply graph node coloring using educational GAT (for simplicity)
  applyGraphNodeColoring(educationalGAT);
  
  // Use original matrix update approach but create two matrices
  createOriginalStyleDualMatrices(educationalGAT, originalGAT, queryText);
  
  // Add bidirectional hover interactions between graph and matrices
  setupGraphToMatrixHover(educationalGAT.queryTokens);
}

function applyGraphNodeColoring(attentionData) {
  const { queryTokens, attentionMatrix } = attentionData;
  
  // Calculate node attention strengths
  const nodeMaxAttention = [];
  queryTokens.forEach((_, i) => {
    let maxAttn = 0;
    attentionMatrix.forEach(row => {
      if (row[i] > maxAttn) maxAttn = row[i];
    });
    nodeMaxAttention.push(maxAttn);
  });
  
  // Apply to graph nodes
  d3.selectAll('#text-as-graph text').each(function(d, i) {
    if (i < nodeMaxAttention.length) {
      const attention = nodeMaxAttention[i];
      d3.select(this)
        .style('fill', '#2563eb')
        .style('opacity', attention);
    }
  });
  
  d3.selectAll('#text-as-graph rect').each(function(d, i) {
    if (i < nodeMaxAttention.length) {
      const attention = nodeMaxAttention[i];
      d3.select(this)
        .style('fill', '#fbbf24')
        .style('stroke', '#2563eb')
        .style('opacity', attention);
    }
  });
}

function createOriginalStyleDualMatrices(educationalGAT, originalGAT, queryText) {
  console.log('📊 Creating dual matrices in original TextAsGraph style...');
  
  // Find the main text-as-graph container
  const container = d3.select('#text-as-graph');
  if (container.empty()) {
    console.log('❌ No text-as-graph container found');
    return;
  }
  
  // Remove any existing dual matrices
  container.selectAll('.dual-matrix').remove();
  
  const queryTokens = educationalGAT.queryTokens;
  const w = 26; // Same as original TextAsGraph (20 * 1.3)
  const matrixGap = 150; // Gap between matrices
  
  // Calculate positions to center both matrices
  const screenWidth = window.innerWidth;
  const totalWidth = (w * queryTokens.length * 2) + matrixGap + 120; // Space for labels
  const startX = Math.max(50, (screenWidth - totalWidth) / 2);
  
  // Create Educational GAT Matrix (Left - Blue)
  const educationalMatrix = container.append('svg')
    .attr('class', 'dual-matrix educational-matrix')
    .style('position', 'absolute')
    .style('top', '200px')
    .style('left', startX + 'px')
    .style('overflow', 'visible')
    .attr('font-size', 12)
    .attr('fill', 'gray');
    
  createOriginalStyleMatrix(
    educationalMatrix,
    educationalGAT.attentionMatrix,
    queryTokens,
    educationalGAT.minAttention,
    educationalGAT.maxAttention,
    '🎓 Educational GAT',
    '#3b82f6', // Blue
    w
  );
  
  // Create Original GAT Matrix (Right - Red)
  const rightX = startX + (w * queryTokens.length) + matrixGap + 80; // Extra space for labels
  const originalMatrix = container.append('svg')
    .attr('class', 'dual-matrix original-matrix')
    .style('position', 'absolute')
    .style('top', '200px')
    .style('left', rightX + 'px')
    .style('overflow', 'visible')
    .attr('font-size', 12)
    .attr('fill', 'gray');
    
  createOriginalStyleMatrix(
    originalMatrix,
    originalGAT.attentionMatrix,
    queryTokens,
    originalGAT.minAttention,
    originalGAT.maxAttention,
    '🔬 Original GAT',
    '#dc2626', // Red
    w
  );
}

function createOriginalStyleMatrix(svg, attentionMatrix, queryTokens, minAttention, maxAttention, title, baseColor, w) {
  // Add title below matrix
  svg.append('text')
    .attr('class', 'matrix-title')
    .attr('x', (queryTokens.length * w) / 2)
    .attr('y', (queryTokens.length * w) + 40)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('fill', '#374151')
    .text(title);
  
  // Create pairs for matrix cells (exactly like original TextAsGraph)
  const words = queryTokens.map((word, i) => ({ word, i }));
  const pairs = d3.cross(words, words);
  
  // Add adjacency matrix rectangles with GAT attention coloring
  svg.selectAll('rect')
    .data(pairs)
    .enter()
    .append('rect')
    .attr('class', 'adj-mat-square')
    .attr('width', w)
    .attr('height', w)
    .attr('transform', d => `translate(${d[0].i * w}, ${d[1].i * w})`)
    .attr('fill', d => {
      const i = d[1].i; // row
      const j = d[0].i; // column
      const attention = attentionMatrix[i][j];
      
      if (attention === 0) {
        return '#f3f4f6'; // Light gray for zero values
      } else {
        return baseColor; // Blue or red based on GAT type
      }
    })
    .attr('opacity', d => {
      const i = d[1].i; // row  
      const j = d[0].i; // column
      const attention = attentionMatrix[i][j];
      
      if (attention === 0) {
        return 0.1; // Very transparent for zero values
      } else {
        // Map attention to opacity
        const range = maxAttention - minAttention;
        if (range > 0) {
          const normalizedValue = (attention - minAttention) / range;
          return 0.2 + 0.8 * normalizedValue; // 20% to 100% opacity
        } else {
          return 0.6;
        }
      }
    })
    .attr('stroke', '#aaa')
    .attr('stroke-width', 0.2)
    .on('mouseover', function(d) {
      const i = d[1].i; // row
      const j = d[0].i; // column
      
      // Highlight this cell
      d3.select(this).style('stroke', '#000').style('stroke-width', 2);
      
      // Highlight corresponding row and column labels
      svg.selectAll('text.top')
        .style('fill', (labelD) => labelD.i === j ? '#000' : 'gray')
        .style('font-weight', (labelD) => labelD.i === j ? 'bold' : 'normal');
        
      svg.selectAll('text.side')
        .style('fill', (labelD) => labelD.i === i ? '#000' : 'gray')
        .style('font-weight', (labelD) => labelD.i === i ? 'bold' : 'normal');
      
      // Highlight corresponding graph nodes
      d3.selectAll('#text-as-graph text').each(function(_, nodeIndex) {
        if (nodeIndex === i || nodeIndex === j) {
          d3.select(this).style('stroke', '#000').style('stroke-width', 2);
        }
      });
      
      // Show attention value in console
      const attention = attentionMatrix[i][j];
      console.log(`🔗 ${title} [${i},${j}]: ${queryTokens[i]} → ${queryTokens[j]} = ${attention.toFixed(3)}`);
    })
    .on('mouseout', function(d) {
      // Reset cell stroke
      d3.select(this).style('stroke', '#aaa').style('stroke-width', 0.2);
      
      // Reset labels
      svg.selectAll('text.top, text.side')
        .style('fill', 'gray')
        .style('font-weight', 'normal');
        
      // Reset graph nodes
      d3.selectAll('#text-as-graph text').style('stroke', 'none');
    });
    
  // Add attention values as text overlays
  svg.selectAll('text.attention-value')
    .data(pairs)
    .enter()
    .append('text')
    .attr('class', 'attention-value')
    .attr('transform', d => `translate(${d[0].i * w + w/2}, ${d[1].i * w + w/2 + 4})`)
    .attr('text-anchor', 'middle')
    .style('font-size', '10px')
    .style('font-weight', 'bold')
    .style('pointer-events', 'none')
    .attr('fill', d => {
      const i = d[1].i;
      const j = d[0].i;
      const attention = attentionMatrix[i][j];
      const range = maxAttention - minAttention;
      const normalizedValue = range > 0 ? (attention - minAttention) / range : 0.5;
      const opacity = 0.2 + 0.8 * normalizedValue;
      return opacity > 0.5 ? 'white' : '#1f2937';
    })
    .text(d => {
      const i = d[1].i;
      const j = d[0].i;
      return attentionMatrix[i][j].toFixed(1);
    });

  // Add top words (rotated, exactly like original)
  svg.selectAll('text.top')
    .data(words)
    .enter()
    .append('text')
    .attr('class', 'top')
    .attr('transform', d => `translate(${d.i * w + w / 2}, -5) rotate(-90)`)
    .attr('text-anchor', 'start')
    .style('font-size', '12px')
    .style('fill', 'gray')
    .text(d => d.word);

  // Add side words (exactly like original)
  svg.selectAll('text.side')
    .data(words)
    .enter()
    .append('text')
    .attr('class', 'side')
    .attr('transform', d => `translate(-5, ${(d.i + .75) * w})`)
    .attr('text-anchor', 'end')
    .style('font-size', '12px')
    .style('fill', 'gray')
    .text(d => d.word);
}

function addComparisonLegend(svg, x, y) {
  const legend = svg.append('g').attr('class', 'matrix-label');
  
  legend.append('text')
    .attr('x', x)
    .attr('y', y)
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .text('Key Differences:');
  
  const differences = [
    '• Educational: No self-attention',
    '• Original: Includes self-attention', 
    '• Educational: Dot product',
    '• Original: Concatenated features',
    '• Educational: Simple embeddings',
    '• Original: Learnable weights W, a'
  ];
  
  differences.forEach((diff, i) => {
    legend.append('text')
      .attr('x', x)
      .attr('y', y + 20 + (i * 15))
      .style('font-size', '10px')
      .style('fill', '#6b7280')
      .text(diff);
  });
}

function setupGraphToMatrixHover(queryTokens) {
  console.log('🖱️ Setting up bidirectional graph-matrix hover interactions...');
  
  // Graph nodes hover → highlight matrix rows and columns
  d3.selectAll('#text-as-graph text').on('mouseover', function(d, i) {
    if (i < queryTokens.length) {
      console.log(`🎯 Hovering graph node ${i}: ${queryTokens[i]}`);
      
      // Highlight all matrix cells in row i and column i in both matrices
      d3.selectAll('.dual-matrix rect').each(function(rectD) {
        const row = rectD[1].i;
        const col = rectD[0].i;
        
        if (row === i || col === i) {
          d3.select(this).style('stroke', '#000').style('stroke-width', 2);
        }
      });
      
      // Highlight labels in both matrices
      d3.selectAll('.dual-matrix text.top, .dual-matrix text.side').each(function(labelD) {
        if (labelD.i === i) {
          d3.select(this).style('fill', '#000').style('font-weight', 'bold');
        }
      });
      
      // Highlight this graph node
      d3.select(this).style('stroke', '#000').style('stroke-width', 2);
    }
  }).on('mouseout', function() {
    // Reset everything
    d3.selectAll('.dual-matrix rect').style('stroke', '#aaa').style('stroke-width', 0.2);
    d3.selectAll('.dual-matrix text.top, .dual-matrix text.side').style('fill', 'gray').style('font-weight', 'normal');
    d3.selectAll('#text-as-graph text').style('stroke', 'none');
  });
}

// Manual debug function for testing dual GAT implementation
async function debugDualGAT(useEmbedding = false) {
  console.log(`🧪 Manual GAT Test ${useEmbedding ? 'with EmbeddingGemma' : 'with synthetic embeddings'}`);
  
  const testParagraph = 'Neural networks are powerful tools. Graph attention mechanisms capture relationships.';
  const testQuery = 'graph attention mechanisms';
  
  console.log('📝 Test paragraph:', testParagraph);
  console.log('🎯 Test query:', testQuery);
  
  let educationalResult, originalResult;
  
  if (useEmbedding && window.EmbeddingGemmaManager) {
    console.log('🔬 Computing with EmbeddingGemma...');
    try {
      educationalResult = await computeEmbeddingGATAttention(testParagraph, testQuery, 'educational');
      originalResult = await computeEmbeddingGATAttention(testParagraph, testQuery, 'original');
    } catch (error) {
      console.error('❌ EmbeddingGemma failed, falling back to synthetic:', error);
      educationalResult = computeGATAttention(testParagraph, testQuery);
      originalResult = computeOriginalGATAttention(testParagraph, testQuery);
    }
  } else {
    console.log('🧠 Computing Educational GAT (synthetic)...');
    educationalResult = computeGATAttention(testParagraph, testQuery);
    console.log('🎓 Educational GAT result:', educationalResult);
    
    console.log('🔬 Computing Original GAT (synthetic)...');
    originalResult = computeOriginalGATAttention(testParagraph, testQuery);
    console.log('🔬 Original GAT result:', originalResult);
  }
  
  console.log('📊 Creating dual matrices...');
  createOriginalStyleDualMatrices(educationalResult, originalResult, testQuery);
  
  console.log('✅ Manual test complete - dual matrices should be visible');
  
  return {
    educational: educationalResult,
    original: originalResult,
    method: useEmbedding ? 'EmbeddingGemma' : 'Synthetic',
    status: 'completed'
  };
}

// Utility function for tokenizing text (used by EmbeddingGemma)
function tokenizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w);
}

// EmbeddingGemma-based GAT computation
async function computeEmbeddingGATAttention(paragraphText, queryText, type = 'educational') {
  console.log(`🔬 Computing ${type} GAT with EmbeddingGemma...`);
  
  if (!window.EmbeddingGemmaManager) {
    throw new Error('EmbeddingGemmaManager not available');
  }
  
  const tokens = tokenizeText(queryText);
  const context = paragraphText ? 'document' : 'query';
  
  // Use EmbeddingGemma to create attention matrix
  const embeddingResult = await window.EmbeddingGemmaManager.createEmbeddingAttentionMatrix(tokens, context);
  
  if (type === 'educational') {
    // Educational: exclude self-attention (set diagonal to 0)
    for (let i = 0; i < tokens.length; i++) {
      embeddingResult.attentionMatrix[i][i] = 0;
    }
    
    // Recalculate min/max after removing self-attention
    let minAttention = 1.0;
    let maxAttention = 0.0;
    
    for (let i = 0; i < tokens.length; i++) {
      for (let j = 0; j < tokens.length; j++) {
        const attention = embeddingResult.attentionMatrix[i][j];
        if (attention > 0) {
          if (attention < minAttention) minAttention = attention;
          if (attention > maxAttention) maxAttention = attention;
        }
      }
    }
    
    embeddingResult.minAttention = minAttention;
    embeddingResult.maxAttention = maxAttention;
  }
  
  // Add computation details
  embeddingResult.computationDetails.type = type;
  embeddingResult.computationDetails.source = 'EmbeddingGemma';
  
  console.log(`✨ ${type} EmbeddingGAT computed: ${embeddingResult.minAttention.toFixed(3)}-${embeddingResult.maxAttention.toFixed(3)}`);
  
  return embeddingResult;
}

// Make function globally available
window.debugDualGAT = debugDualGAT;