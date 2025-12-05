import * as d3 from 'd3';

// MathJax-based GAT attention computation
export function computeGATAttention(paragraphText, queryText) {
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
export function applyAttentionColoring(attentionData, queryText) {
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

  // Filter to likely matrix rectangles (smaller, grid-positioned)
  const matrixRects = allRects.filter(function() {
    const rect = d3.select(this);
    const width = parseFloat(rect.attr('width'));
    const height = parseFloat(rect.attr('height'));

    // Matrix cells are typically small squares (updated for 1.3x size)
    return width <= 40 && height <= 40 && Math.abs(width - height) <= 5;
  });

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
 */
export function computeOriginalGATAttention(paragraphText, queryText) {
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

export function applyDualAttentionColoring(educationalGAT, originalGAT, queryText) {
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
      d3.select(this).style('stroke', '#000').style('stroke-width', 3);

      // Highlight corresponding row and column labels IN THIS MATRIX
      svg.selectAll('text.top')
        .style('fill', (labelD) => labelD.i === j ? '#000' : 'gray')
        .style('font-weight', (labelD) => labelD.i === j ? 'bold' : 'normal');

      svg.selectAll('text.side')
        .style('fill', (labelD) => labelD.i === i ? '#000' : 'gray')
        .style('font-weight', (labelD) => labelD.i === i ? 'bold' : 'normal');

      // ✨ ENHANCED: Highlight corresponding cell in THE OTHER MATRIX (same style)
      d3.selectAll('.dual-matrix rect').each(function(otherD) {
        // Skip if this is the same matrix
        const thisMatrix = d3.select(this.parentNode);
        if (thisMatrix.node() === svg.node()) return;

        const otherRow = otherD[1].i;
        const otherCol = otherD[0].i;

        // Highlight the same [i,j] cell in the other matrix (BLACK, consistent with primary)
        if (otherRow === i && otherCol === j) {
          d3.select(this).style('stroke', '#000').style('stroke-width', 3);
        }
      });

      // ✨ ENHANCED: Highlight labels in THE OTHER MATRIX (same style)
      d3.selectAll('.dual-matrix text.top, .dual-matrix text.side').each(function(labelD) {
        const thisMatrix = d3.select(this.parentNode);
        if (thisMatrix.node() === svg.node()) return;

        // Highlight row and column labels (BLACK and BOLD, consistent with primary)
        if (labelD.i === i || labelD.i === j) {
          d3.select(this).style('fill', '#000').style('font-weight', 'bold');
        }
      });

      // Highlight corresponding graph nodes
      d3.selectAll('#text-as-graph text').each(function(_, nodeIndex) {
        if (nodeIndex === i || nodeIndex === j) {
          d3.select(this).style('stroke', '#000').style('stroke-width', 3).style('fill', '#1e40af');
        }
      });

      // Show attention value in console
      const attention = attentionMatrix[i][j];
      console.log(`🔗 ${title} [${i},${j}]: ${queryTokens[i]} → ${queryTokens[j]} = ${attention.toFixed(3)}`);
    })
    .on('mouseout', function(d) {
      // Reset THIS cell stroke
      d3.select(this).style('stroke', '#aaa').style('stroke-width', 0.2);

      // Reset THIS matrix labels
      svg.selectAll('text.top, text.side')
        .style('fill', 'gray')
        .style('font-weight', 'normal');

      // ✨ NEW: Reset ALL other matrix cells and labels
      d3.selectAll('.dual-matrix rect')
        .style('stroke', '#aaa')
        .style('stroke-width', 0.2);

      d3.selectAll('.dual-matrix text.top, .dual-matrix text.side')
        .style('fill', 'gray')
        .style('font-weight', 'normal');

      // Reset graph nodes (restore original fill color)
      d3.selectAll('#text-as-graph text')
        .style('stroke', 'none')
        .style('fill', '#000');
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

function setupGraphToMatrixHover(queryTokens) {
  console.log('🖱️ Setting up bidirectional graph-matrix hover interactions...');

  // Graph nodes hover → highlight matrix rows and columns
  d3.selectAll('#text-as-graph text').on('mouseover', function(d, i) {
    if (i < queryTokens.length) {
      console.log(`🎯 Hovering graph node ${i}: ${queryTokens[i]}`);

      // ✨ ENHANCED: Highlight all matrix cells in row i and column i in BOTH matrices
      // with different highlighting to distinguish the two matrices
      d3.selectAll('.dual-matrix rect').each(function(rectD) {
        const row = rectD[1].i;
        const col = rectD[0].i;

        if (row === i || col === i) {
          // Use thicker stroke and orange color for cross-matrix highlighting
          d3.select(this).style('stroke', '#2563eb').style('stroke-width', 3);
        }
      });

      // ✨ ENHANCED: Highlight labels in BOTH matrices with blue
      d3.selectAll('.dual-matrix text.top, .dual-matrix text.side').each(function(labelD) {
        if (labelD.i === i) {
          d3.select(this).style('fill', '#2563eb').style('font-weight', 'bold');
        }
      });

      // ✨ ENHANCED: Highlight this graph node with thicker stroke
      d3.select(this)
        .style('stroke', '#2563eb')
        .style('stroke-width', 3)
        .style('fill', '#1e40af')
        .style('font-weight', 'bold');
    }
  }).on('mouseout', function() {
    // Reset everything
    d3.selectAll('.dual-matrix rect').style('stroke', '#aaa').style('stroke-width', 0.2);
    d3.selectAll('.dual-matrix text.top, .dual-matrix text.side').style('fill', 'gray').style('font-weight', 'normal');
    d3.selectAll('#text-as-graph text')
      .style('stroke', 'none')
      .style('fill', '#000')
      .style('font-weight', 'normal');
  }).on('click', function(d, i) {
    // ✨ NEW: Copy node text to clipboard on click
    if (i < queryTokens.length) {
      const nodeText = queryTokens[i];
      navigator.clipboard.writeText(nodeText).then(() => {
        console.log(`📋 Copied to clipboard: "${nodeText}"`);

        // Visual feedback: flash the node
        d3.select(this)
          .style('fill', '#10b981')
          .transition()
          .duration(300)
          .style('fill', '#000');
      }).catch(err => {
        console.error('❌ Failed to copy to clipboard:', err);
      });
    }
  });
}
