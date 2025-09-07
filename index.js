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

// Global function to update the visualization with GAT
window.updateVisualization = function updateVisualization() {
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
  
  console.log('🧠 Computing GAT attention...');
  console.log('📄 Paragraph:', paragraphText.substring(0, 50) + '...');
  console.log('🎯 Query:', queryText);
  
  // Compute both Educational and Original GAT attention
  const educationalGAT = computeGATAttention(paragraphText, queryText);
  const originalGAT = computeOriginalGATAttention(paragraphText, queryText);
  
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
  for (let i = 0; i < dim; i++) {
    // Simulated learnable attention weights
    a.push(Math.random() * 0.2 - 0.1);
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
      for (let k = 0; k < attentionVector.length; k++) {
        e_ij += attentionVector[k] * concatenated[k];
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
  
  // Create side-by-side matrix comparison
  createDualMatrixVisualization(educationalGAT, originalGAT, queryText);
  
  // Add comparative hover interactions
  setupDualHoverInteractions(educationalGAT, originalGAT);
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

function createDualMatrixVisualization(educationalGAT, originalGAT, queryText) {
  console.log('📊 Creating side-by-side matrix comparison...');
  
  const svg = d3.select('#text-as-graph').select('svg');
  if (svg.empty()) {
    console.log('❌ No SVG found for dual matrix visualization');
    return;
  }
  
  // Clear existing matrices
  svg.selectAll('.matrix-label, .adj-mat-square, .matrix-text').remove();
  
  const matrixSize = 35;
  const matrixGap = 50;
  const startY = 200;
  
  // Educational GAT Matrix (Left)
  createSingleMatrix(
    svg, 
    educationalGAT.attentionMatrix, 
    educationalGAT.queryTokens,
    educationalGAT.minAttention,
    educationalGAT.maxAttention,
    50, // x position
    startY,
    '🎓 Educational GAT',
    '#3b82f6' // Blue
  );
  
  // Original GAT Matrix (Right)  
  const rightX = 50 + (educationalGAT.queryTokens.length * matrixSize) + matrixGap;
  createSingleMatrix(
    svg,
    originalGAT.attentionMatrix,
    originalGAT.queryTokens, 
    originalGAT.minAttention,
    originalGAT.maxAttention,
    rightX,
    startY,
    '🔬 Original GAT',
    '#dc2626' // Red
  );
  
  // Add comparison legend
  addComparisonLegend(svg, rightX + (originalGAT.queryTokens.length * matrixSize) + 20, startY);
}

function createSingleMatrix(svg, attentionMatrix, queryTokens, minAttention, maxAttention, startX, startY, title, baseColor) {
  // Add matrix title
  svg.append('text')
    .attr('class', 'matrix-label')
    .attr('x', startX + (queryTokens.length * 35) / 2)
    .attr('y', startY - 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('fill', '#374151')
    .text(title);
  
  // Create matrix cells
  attentionMatrix.forEach((row, i) => {
    row.forEach((attention, j) => {
      let opacity;
      let cellColor;
      
      if (attention === 0) {
        opacity = 0.1;
        cellColor = '#e5e7eb';
      } else {
        const range = maxAttention - minAttention;
        if (range > 0) {
          const normalizedValue = (attention - minAttention) / range;
          opacity = 0.2 + 0.8 * normalizedValue;
        } else {
          opacity = 0.5;
        }
        cellColor = baseColor;
      }
      
      // Create cell
      svg.append('rect')
        .attr('class', 'adj-mat-square')
        .attr('data-matrix', title.includes('Educational') ? 'edu' : 'orig')
        .attr('data-row', i)
        .attr('data-col', j)
        .attr('x', startX + j * 35)
        .attr('y', startY + i * 35)
        .attr('width', 33)
        .attr('height', 33)
        .style('fill', cellColor)
        .style('opacity', opacity)
        .style('stroke', '#1f2937')
        .style('stroke-width', 1);
      
      // Add attention value text
      svg.append('text')
        .attr('class', 'matrix-text')
        .attr('x', startX + j * 35 + 16.5)
        .attr('y', startY + i * 35 + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '8px')
        .style('font-weight', 'bold')
        .style('fill', opacity > 0.5 ? 'white' : 'black')
        .style('pointer-events', 'none')
        .text(attention.toFixed(1));
    });
  });
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

function setupDualHoverInteractions(educationalGAT, originalGAT) {
  console.log('🖱️ Setting up dual matrix hover interactions...');
  
  // Enhanced hover for matrix cells showing both values
  d3.selectAll('.adj-mat-square').on('mouseover', function() {
    const element = d3.select(this);
    const matrixType = element.attr('data-matrix');
    const row = parseInt(element.attr('data-row'));
    const col = parseInt(element.attr('data-col'));
    
    const eduValue = educationalGAT.attentionMatrix[row][col];
    const origValue = originalGAT.attentionMatrix[row][col];
    
    console.log(`🔍 Comparison [${row},${col}]: Educational=${eduValue.toFixed(3)}, Original=${origValue.toFixed(3)}`);
    
    // Highlight corresponding cells in both matrices
    d3.selectAll(`.adj-mat-square[data-row="${row}"][data-col="${col}"]`)
      .style('stroke', '#000')
      .style('stroke-width', 3);
      
  }).on('mouseout', function() {
    d3.selectAll('.adj-mat-square')
      .style('stroke', '#1f2937')
      .style('stroke-width', 1);
  });
}