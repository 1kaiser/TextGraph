/**
 * Main entry point for text-as-graph visualization
 */

import './d3-conventions';
import { TextAsGraph } from './text-as-graph-v2';

// Global variables for the interface
let textAsGraphInstance = null;

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
  const charCount = document.getElementById('char-count');
  const updateButton = document.getElementById('update-graph');
  
  if (!textInput || !charCount || !updateButton) {
    console.warn('Text input interface elements not found');
    return;
  }
  
  // Update character count in real-time
  function updateCharCount() {
    const count = textInput.value.length;
    const maxLength = textInput.getAttribute('maxlength') || 100;
    charCount.textContent = count;
    
    // Change color when approaching limit
    if (count > maxLength * 0.9) {
      charCount.style.color = '#dc3545';
    } else if (count > maxLength * 0.75) {
      charCount.style.color = '#fd7e14';
    } else {
      charCount.style.color = '#6c757d';
    }
  }
  
  // Set initial character count
  updateCharCount();
  
  // Add event listeners
  textInput.addEventListener('input', updateCharCount);
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
  
  // Compute GAT attention from paragraph context
  const attentionWeights = computeGATAttention(paragraphText, queryText);
  
  // Update the visualization with attention-based coloring
  const visualizationInput = document.querySelector('#text-as-graph input');
  if (visualizationInput) {
    visualizationInput.value = queryText;
    
    // Trigger the render function with attention weights
    if (textAsGraphInstance && typeof textAsGraphInstance.renderWithAttention === 'function') {
      textAsGraphInstance.renderWithAttention(attentionWeights);
    } else if (textAsGraphInstance && typeof textAsGraphInstance.render === 'function') {
      textAsGraphInstance.render();
      // Apply attention coloring after render
      applyAttentionColoring(attentionWeights, queryText);
    } else {
      // Fallback: trigger input event then apply coloring
      visualizationInput.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => applyAttentionColoring(attentionWeights, queryText), 100);
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
    
    // Normalize to probabilities
    const normalizedRow = sum > 0 ? exp_scores.map(exp_score => exp_score / sum) : row;
    
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
  
  // Create or update adjacency matrix visualization
  createAttentionMatrix(attentionMatrix, queryTokens, minAttention, maxAttention);
  
  // Add hover interactions
  setupAttentionHoverInteractions(attentionData);
}

// Create adjacency matrix with transparency-based visualization
function createAttentionMatrix(attentionMatrix, queryTokens, minAttention, maxAttention) {
  console.log('🧮 Creating adjacency matrix visualization...');
  
  // Remove existing matrix
  d3.select('#attention-matrix').remove();
  
  // Create matrix container
  const matrixContainer = d3.select('#text-as-graph')
    .append('div')
    .attr('id', 'attention-matrix')
    .style('position', 'absolute')
    .style('top', '300px')
    .style('right', '50px')
    .style('background', 'rgba(255,255,255,0.9)')
    .style('border', '1px solid #ddd')
    .style('border-radius', '8px')
    .style('padding', '15px')
    .style('box-shadow', '0 4px 12px rgba(0,0,0,0.15)');
  
  // Add title
  matrixContainer.append('div')
    .style('text-align', 'center')
    .style('font-weight', 'bold')
    .style('margin-bottom', '10px')
    .style('font-size', '14px')
    .text('🧮 Attention Matrix');
  
  // Create SVG for matrix
  const matrixSize = 25;
  const matrixSvg = matrixContainer.append('svg')
    .attr('width', queryTokens.length * matrixSize + 100)
    .attr('height', queryTokens.length * matrixSize + 100);
  
  // Add row labels
  matrixSvg.selectAll('.row-label')
    .data(queryTokens)
    .enter()
    .append('text')
    .attr('class', 'row-label')
    .attr('x', 60)
    .attr('y', (d, i) => 85 + i * matrixSize + matrixSize/2)
    .attr('text-anchor', 'end')
    .style('font-size', '10px')
    .style('fill', '#666')
    .text(d => d.substring(0, 8));
  
  // Add column labels
  matrixSvg.selectAll('.col-label')
    .data(queryTokens)
    .enter()
    .append('text')
    .attr('class', 'col-label')
    .attr('x', (d, i) => 70 + i * matrixSize + matrixSize/2)
    .attr('y', 75)
    .attr('text-anchor', 'middle')
    .style('font-size', '10px')
    .style('fill', '#666')
    .style('transform', 'rotate(-45deg)')
    .style('transform-origin', (d, i) => `${70 + i * matrixSize + matrixSize/2}px 75px`)
    .text(d => d.substring(0, 8));
  
  // Create matrix cells with transparency based on normalized attention
  attentionMatrix.forEach((row, i) => {
    row.forEach((attention, j) => {
      // Calculate transparency based on full matrix min/max normalization
      let transparency;
      let cellColor;
      
      if (attention === 0) {
        // Self-attention: fully transparent with gray color
        transparency = 0.1;
        cellColor = '#e5e7eb';
      } else {
        // Map attention range to transparency: min→100% transparent, max→0% transparent
        const range = maxAttention - minAttention;
        if (range > 0) {
          // Invert: high attention = low transparency (more opaque)
          const normalizedValue = (attention - minAttention) / range;
          transparency = 1.0 - normalizedValue; // Invert: 1→0, 0→1
          transparency = Math.max(0.1, Math.min(0.9, transparency)); // Clamp to 10%-90%
        } else {
          transparency = 0.5;
        }
        cellColor = '#3b82f6'; // Blue for attention connections
      }
      
      // Create matrix cell with calculated transparency
      const cell = matrixSvg.append('rect')
        .attr('class', 'adj-mat-square')
        .attr('x', 70 + j * matrixSize)
        .attr('y', 80 + i * matrixSize)
        .attr('width', matrixSize - 1)
        .attr('height', matrixSize - 1)
        .style('fill', cellColor)
        .style('opacity', 1 - transparency) // Convert transparency to opacity
        .style('stroke', '#1f2937')
        .style('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .attr('data-row', i)
        .attr('data-col', j)
        .attr('data-attention', attention)
        .attr('data-transparency', transparency);
      
      // Add attention value text with high contrast
      matrixSvg.append('text')
        .attr('class', 'attention-score')
        .attr('x', 70 + j * matrixSize + matrixSize/2)
        .attr('y', 80 + i * matrixSize + matrixSize/2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '9px')
        .style('font-weight', 'bold')
        .style('fill', transparency < 0.5 ? 'white' : '#1f2937') // White on dark, dark on light
        .style('pointer-events', 'none')
        .style('text-shadow', transparency < 0.5 ? '0 0 2px #000' : '0 0 2px #fff')
        .text(attention.toFixed(3));
    });
  });
  
  // Add legend
  const legend = matrixContainer.append('div')
    .style('margin-top', '10px')
    .style('font-size', '10px')
    .style('color', '#666');
  
  legend.append('div').text(`📊 Range: ${minAttention.toFixed(3)} - ${maxAttention.toFixed(3)}`);
  legend.append('div').text('💫 Opacity: Low→High attention');
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