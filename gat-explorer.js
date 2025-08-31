/**
 * GAT Explorer - Interactive Graph Attention Networks Visualization
 * Combines TensorFlow.js for computations with D3.js for visualizations
 */

// Global state
let currentStage = 0;
let currentTokens = [];
let currentEmbeddings = null;
let attentionWeights = null;
let isAutoPlaying = false;
let autoPlayInterval = null;

// TensorFlow.js model for embeddings and attention
let embeddingModel = null;
let attentionModel = null;

// Stage names and configurations
const stages = [
    { id: 'tokenization', name: 'Tokenization', progress: 20 },
    { id: 'embedding', name: 'Embeddings', progress: 40 },
    { id: 'attention', name: 'Attention Computation', progress: 60 },
    { id: 'aggregation', name: 'Message Aggregation', progress: 80 },
    { id: 'final', name: 'Final Graph', progress: 100 }
];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing GAT Explorer...');
    
    // Initialize TensorFlow.js models
    await initializeTensorFlowModels();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize with default text
    const defaultText = document.getElementById('paragraph-input').value;
    updateExplanationWithCurrentText(defaultText);
    
    console.log('✅ GAT Explorer initialized successfully');
});

// Initialize TensorFlow.js models for embeddings and attention
async function initializeTensorFlowModels() {
    try {
        console.log('🔧 Loading TensorFlow.js models...');
        
        // Create a simple embedding model (randomly initialized for demo)
        embeddingModel = tf.sequential({
            layers: [
                tf.layers.embedding({
                    inputDim: 10000, // vocabulary size
                    outputDim: 256,  // embedding dimension
                    inputLength: 1
                })
            ]
        });
        
        // Create attention computation model
        attentionModel = tf.sequential({
            layers: [
                tf.layers.dense({ units: 512, activation: 'relu' }),
                tf.layers.dense({ units: 256, activation: 'tanh' }),
                tf.layers.dense({ units: 1, activation: 'linear' })
            ]
        });
        
        console.log('✅ TensorFlow.js models loaded');
    } catch (error) {
        console.warn('⚠️ TensorFlow.js model loading failed, using simulated data:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Speed slider
    const speedSlider = document.getElementById('speed-slider');
    const speedDisplay = document.getElementById('speed-display');
    
    speedSlider.addEventListener('input', function() {
        const speed = parseInt(this.value);
        speedDisplay.textContent = (speed / 1000).toFixed(1) + 's';
    });
    
    // Stage selector
    const stageSelector = document.getElementById('stage-selector');
    stageSelector.addEventListener('change', function() {
        const selectedStage = this.value;
        const stageIndex = stages.findIndex(s => s.id === selectedStage);
        if (stageIndex !== -1) {
            currentStage = stageIndex;
            updateCurrentStage();
        }
    });
}

// Process paragraph with GAT
async function processWithGAT() {
    const paragraphText = document.getElementById('paragraph-input').value.trim();
    if (!paragraphText) return;
    
    console.log('🚀 Processing with GAT:', paragraphText);
    
    // Reset to first stage
    currentStage = 0;
    
    // Update all explanations with current text
    updateExplanationWithCurrentText(paragraphText);
    
    // Start processing
    await processTokenization(paragraphText);
    updateCurrentStage();
}

// Step through the process manually
function stepThroughProcess() {
    nextStep();
}

// Navigate to next step
function nextStep() {
    if (currentStage < stages.length - 1) {
        currentStage++;
        updateCurrentStage();
        
        // Process the current stage
        processCurrentStage();
    }
}

// Navigate to previous step
function previousStep() {
    if (currentStage > 0) {
        currentStage--;
        updateCurrentStage();
        processCurrentStage();
    }
}

// Auto-play through all stages
function autoPlay() {
    const button = document.getElementById('auto-play');
    
    if (isAutoPlaying) {
        // Stop auto-play
        isAutoPlaying = false;
        button.textContent = '🎬 Auto Play';
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    } else {
        // Start auto-play
        isAutoPlaying = true;
        button.textContent = '⏸️ Pause';
        
        const speed = parseInt(document.getElementById('speed-slider').value);
        
        autoPlayInterval = setInterval(() => {
            if (currentStage < stages.length - 1) {
                nextStep();
            } else {
                // Reset to beginning
                currentStage = 0;
                updateCurrentStage();
                processCurrentStage();
            }
        }, speed);
    }
}

// Update current stage display
function updateCurrentStage() {
    const stage = stages[currentStage];
    
    // Update stage header
    document.getElementById('current-stage').textContent = `Stage ${currentStage + 1}: ${stage.name}`;
    document.getElementById('progress-fill').style.width = stage.progress + '%';
    document.getElementById('progress-text').textContent = `${currentStage + 1}/${stages.length} Steps`;
    
    // Update stage selector
    document.getElementById('stage-selector').value = stage.id;
    
    // Show/hide explanation steps
    document.querySelectorAll('.explanation-step').forEach((step, index) => {
        step.classList.toggle('active', index === currentStage);
    });
    
    // Show/hide visualization stages
    document.querySelectorAll('.stage-viz').forEach((viz, index) => {
        viz.classList.toggle('active', index === currentStage);
    });
}

// Process current stage
async function processCurrentStage() {
    const paragraphText = document.getElementById('paragraph-input').value.trim();
    
    switch (currentStage) {
        case 0:
            await processTokenization(paragraphText);
            break;
        case 1:
            await processEmbeddings(currentTokens);
            break;
        case 2:
            await processAttention(currentTokens, currentEmbeddings);
            break;
        case 3:
            await processAggregation(currentTokens, attentionWeights);
            break;
        case 4:
            await processFinalGraph(currentTokens, attentionWeights);
            break;
    }
}

// Stage 1: Tokenization
async function processTokenization(text) {
    console.log('📝 Processing tokenization for:', text);
    
    // Split into sentences, then words
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const allTokens = [];
    
    sentences.forEach((sentence, sentIndex) => {
        const words = sentence.trim().split(/\s+/).filter(w => w.length > 0);
        words.forEach((word, wordIndex) => {
            allTokens.push({
                word: word,
                globalIndex: allTokens.length,
                sentenceIndex: sentIndex,
                wordIndex: wordIndex,
                sentence: sentence.trim()
            });
        });
    });
    
    currentTokens = allTokens;
    
    // Update visualization
    updateTokenizationVisualization(text, allTokens);
    
    // Update explanation with actual tokens
    updateTokenizationExplanation(text, allTokens);
}

// Stage 2: Embeddings
async function processEmbeddings(tokens) {
    console.log('🎯 Processing embeddings for', tokens.length, 'tokens');
    
    // Generate or compute embeddings
    const embeddings = await generateEmbeddings(tokens);
    currentEmbeddings = embeddings;
    
    // Visualize embeddings
    visualizeEmbeddings(tokens, embeddings);
    
    // Update explanation
    updateEmbeddingExplanation(tokens, embeddings);
}

// Stage 3: Attention Computation
async function processAttention(tokens, embeddings) {
    console.log('⚡ Computing attention weights for', tokens.length, 'tokens');
    
    // Compute attention matrix
    const attention = await computeAttentionMatrix(tokens, embeddings);
    attentionWeights = attention;
    
    // Visualize attention matrix
    visualizeAttentionMatrix(tokens, attention);
    
    // Update explanation
    updateAttentionExplanation(tokens, attention);
}

// Stage 4: Message Aggregation
async function processAggregation(tokens, attention) {
    console.log('🔄 Processing message aggregation');
    
    // Simulate message passing
    const aggregatedFeatures = await simulateMessagePassing(tokens, attention);
    
    // Visualize aggregation
    visualizeMessageAggregation(tokens, attention, aggregatedFeatures);
    
    // Update explanation
    updateAggregationExplanation(tokens, aggregatedFeatures);
}

// Stage 5: Final Graph
async function processFinalGraph(tokens, attention) {
    console.log('🎯 Creating final graph representation');
    
    // Create both sequential and attention graphs
    createSequentialVisualization(tokens);
    createAttentionVisualization(tokens, attention);
    
    // Update explanation
    updateFinalGraphExplanation(tokens, attention);
}

// Generate embeddings using TensorFlow.js or simulation
async function generateEmbeddings(tokens) {
    if (embeddingModel) {
        try {
            // Use actual TensorFlow.js embedding
            const tokenIds = tokens.map((_, i) => i % 1000); // Simple mapping for demo
            const inputTensor = tf.tensor2d([tokenIds]);
            const embeddings = embeddingModel.predict(inputTensor);
            return await embeddings.data();
        } catch (error) {
            console.warn('TensorFlow.js embedding failed, using simulation:', error);
        }
    }
    
    // Fallback: Generate realistic random embeddings
    return tokens.map(token => {
        return Array.from({ length: 256 }, () => (Math.random() - 0.5) * 2);
    });
}

// Compute attention matrix
async function computeAttentionMatrix(tokens, embeddings) {
    const n = tokens.length;
    const attention = Array(n).fill().map(() => Array(n).fill(0));
    
    // Simulate attention computation with realistic patterns
    for (let i = 0; i < n; i++) {
        let rowSum = 0;
        
        for (let j = 0; j < n; j++) {
            if (i === j) {
                attention[i][j] = 0; // No self-attention in this demo
            } else {
                // Simulate attention based on distance and semantic similarity
                const distance = Math.abs(i - j);
                const baseScore = Math.exp(-distance * 0.3); // Distance decay
                
                // Add semantic similarity (simulated)
                const semanticSim = simulateSemanticSimilarity(tokens[i].word, tokens[j].word);
                const finalScore = baseScore * (0.5 + semanticSim);
                
                attention[i][j] = finalScore;
                rowSum += finalScore;
            }
        }
        
        // Normalize row to sum to 1 (softmax)
        for (let j = 0; j < n; j++) {
            attention[i][j] = attention[i][j] / rowSum;
        }
    }
    
    return attention;
}

// Simulate semantic similarity between words
function simulateSemanticSimilarity(word1, word2) {
    // Simple heuristic-based similarity for demo
    const semanticGroups = {
        'neural': ['networks', 'learning', 'algorithms'],
        'data': ['process', 'complex', 'structures'],
        'attention': ['mechanisms', 'capture', 'relationships'],
        'models': ['transform', 'language', 'processing']
    };
    
    for (const [key, group] of Object.entries(semanticGroups)) {
        if ((group.includes(word1.toLowerCase()) || word1.toLowerCase() === key) &&
            (group.includes(word2.toLowerCase()) || word2.toLowerCase() === key)) {
            return 0.8; // High similarity
        }
    }
    
    // Check for common endings/patterns
    if (word1.endsWith('ing') && word2.endsWith('ing')) return 0.3;
    if (word1.endsWith('s') && word2.endsWith('s')) return 0.2;
    
    return Math.random() * 0.1; // Low random similarity
}

// Update tokenization visualization
function updateTokenizationVisualization(text, tokens) {
    const originalDisplay = document.getElementById('original-text-display');
    const tokensDisplay = document.getElementById('tokens-display');
    
    // Show original text
    originalDisplay.textContent = text;
    
    // Show tokens with indices
    tokensDisplay.innerHTML = '';
    tokens.forEach((token, index) => {
        const badge = document.createElement('div');
        badge.className = 'token-badge';
        badge.textContent = `${index}: ${token.word}`;
        badge.style.animationDelay = `${index * 0.1}s`;
        tokensDisplay.appendChild(badge);
    });
}

// Visualize embeddings using canvas
function visualizeEmbeddings(tokens, embeddings) {
    const canvas = document.getElementById('embedding-canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw embedding visualization (first 2 dimensions for simplicity)
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, height - 50);
    ctx.lineTo(width - 50, height - 50); // X-axis
    ctx.moveTo(50, 50);
    ctx.lineTo(50, height - 50); // Y-axis
    ctx.stroke();
    
    // Plot embeddings (using first 2 dimensions)
    const margin = 50;
    const plotWidth = width - 2 * margin;
    const plotHeight = height - 2 * margin;
    
    tokens.forEach((token, i) => {
        const embedding = embeddings[i];
        const x = margin + (embedding[0] + 1) * plotWidth / 2; // Normalize to [0,1]
        const y = margin + (1 - (embedding[1] + 1) / 2) * plotHeight; // Invert Y
        
        // Draw point
        ctx.fillStyle = `hsl(${i * 360 / tokens.length}, 70%, 50%)`;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px system-ui';
        ctx.fillText(token.word, x + 12, y + 4);
    });
    
    // Update stats
    const stats = document.getElementById('embedding-stats');
    stats.innerHTML = `
        <div>Tokens: ${tokens.length}</div>
        <div>Dimensions: 256</div>
        <div>Total Parameters: ${tokens.length * 256}</div>
    `;
}

// Visualize attention matrix
function visualizeAttentionMatrix(tokens, attention) {
    const canvas = document.getElementById('attention-canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const n = tokens.length;
    const cellSize = Math.min(width, height) / (n + 2); // Leave space for labels
    const startX = (width - n * cellSize) / 2;
    const startY = (height - n * cellSize) / 2;
    
    // Draw attention matrix
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const weight = attention[i][j];
            const x = startX + j * cellSize;
            const y = startY + i * cellSize;
            
            // Color based on attention weight
            const intensity = Math.floor(weight * 255);
            ctx.fillStyle = `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
            ctx.fillRect(x, y, cellSize, cellSize);
            
            // Draw border
            ctx.strokeStyle = '#dee2e6';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellSize, cellSize);
            
            // Draw weight value if significant
            if (weight > 0.1) {
                ctx.fillStyle = weight > 0.5 ? 'white' : '#333';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(weight.toFixed(2), x + cellSize/2, y + cellSize/2 + 3);
            }
        }
    }
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    
    // Top labels
    tokens.forEach((token, i) => {
        const x = startX + i * cellSize + cellSize/2;
        const y = startY - 10;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(token.word, 0, 0);
        ctx.restore();
    });
    
    // Left labels
    ctx.textAlign = 'right';
    tokens.forEach((token, i) => {
        const x = startX - 10;
        const y = startY + i * cellSize + cellSize/2 + 4;
        ctx.fillText(token.word, x, y);
    });
    
    // Update stats
    const stats = document.getElementById('attention-stats');
    const maxWeight = Math.max(...attention.flat());
    const avgWeight = attention.flat().reduce((a, b) => a + b, 0) / (n * n);
    
    stats.innerHTML = `
        <div>Matrix Size: ${n}×${n}</div>
        <div>Max Attention: ${maxWeight.toFixed(3)}</div>
        <div>Avg Attention: ${avgWeight.toFixed(3)}</div>
        <div>Total Connections: ${attention.flat().filter(w => w > 0.01).length}</div>
    `;
}

// Visualize message aggregation
function visualizeMessageAggregation(tokens, attention, aggregatedFeatures) {
    const canvas = document.getElementById('aggregation-canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw message passing visualization
    const centerY = height / 2;
    const nodeSpacing = width / (tokens.length + 1);
    
    // Draw nodes
    tokens.forEach((token, i) => {
        const x = (i + 1) * nodeSpacing;
        const y = centerY;
        
        // Draw node circle
        ctx.fillStyle = `hsl(${i * 360 / tokens.length}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(token.word, x, y + 40);
        
        // Draw attention arrows
        for (let j = 0; j < tokens.length; j++) {
            if (i !== j && attention[i][j] > 0.2) {
                const targetX = (j + 1) * nodeSpacing;
                const weight = attention[i][j];
                
                // Draw arrow
                ctx.strokeStyle = `rgba(66, 133, 244, ${weight})`;
                ctx.lineWidth = weight * 4;
                drawArrow(ctx, x, y - 25, targetX, y - 25);
                
                // Draw weight label
                ctx.fillStyle = '#4285f4';
                ctx.font = '10px monospace';
                const midX = (x + targetX) / 2;
                ctx.fillText(weight.toFixed(2), midX, y - 30);
            }
        }
    });
    
    // Update stats
    const stats = document.getElementById('aggregation-stats');
    const strongConnections = attention.flat().filter(w => w > 0.3).length;
    
    stats.innerHTML = `
        <div>Nodes: ${tokens.length}</div>
        <div>Strong Connections: ${strongConnections}</div>
        <div>Message Updates: ${tokens.length}</div>
    `;
}

// Create final graph visualizations (implementation moved below)

// Helper function to draw arrows
function drawArrow(ctx, fromX, fromY, toX, toY) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const length = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX - 15 * Math.cos(angle), toY - 15 * Math.sin(angle));
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - 10 * Math.cos(angle - 0.3), toY - 10 * Math.sin(angle - 0.3));
    ctx.lineTo(toX - 10 * Math.cos(angle + 0.3), toY - 10 * Math.sin(angle + 0.3));
    ctx.closePath();
    ctx.fill();
}

// Create sequential graph visualization
function createSequentialVisualization(tokens) {
    const container = document.getElementById('sequential-visualization');
    container.innerHTML = '';
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 380)
        .attr('height', 200);
    
    const nodeSpacing = 360 / (tokens.length + 1);
    const y = 100;
    
    // Draw nodes
    tokens.forEach((token, i) => {
        const x = (i + 1) * nodeSpacing;
        
        // Node rectangle
        svg.append('rect')
            .attr('x', x - 30)
            .attr('y', y - 15)
            .attr('width', 60)
            .attr('height', 30)
            .attr('fill', '#ffd700')
            .attr('stroke', '#333')
            .attr('rx', 5);
        
        // Node label
        svg.append('text')
            .attr('x', x)
            .attr('y', y + 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('font-family', 'system-ui')
            .text(token.word.length > 8 ? token.word.substring(0, 6) + '...' : token.word);
        
        // Arrow to next node
        if (i < tokens.length - 1) {
            const nextX = (i + 2) * nodeSpacing;
            svg.append('path')
                .attr('d', `M ${x + 30} ${y} L ${nextX - 35} ${y}`)
                .attr('stroke', '#333')
                .attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrowhead)');
        }
    });
    
    // Add arrow marker
    svg.append('defs')
        .append('marker')
        .attr('id', 'arrowhead')
        .attr('markerWidth', 10)
        .attr('markerHeight', 7)
        .attr('refX', 9)
        .attr('refY', 3.5)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 10 3.5, 0 7')
        .attr('fill', '#333');
}

// Create attention graph visualization
function createAttentionVisualization(tokens, attention) {
    const container = document.getElementById('attention-graph-visualization');
    container.innerHTML = '';
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 380)
        .attr('height', 200);
    
    const nodeSpacing = 360 / (tokens.length + 1);
    const y = 100;
    
    // Draw attention connections first (behind nodes)
    tokens.forEach((token, i) => {
        const x = (i + 1) * nodeSpacing;
        
        tokens.forEach((targetToken, j) => {
            if (i !== j && attention[i][j] > 0.2) {
                const targetX = (j + 1) * nodeSpacing;
                const weight = attention[i][j];
                
                // Draw curved attention line
                const midY = y - 40 + Math.random() * 20; // Add some curve variation
                svg.append('path')
                    .attr('d', `M ${x} ${y - 20} Q ${(x + targetX) / 2} ${midY} ${targetX} ${y - 20}`)
                    .attr('stroke', '#4285f4')
                    .attr('stroke-width', weight * 4)
                    .attr('stroke-opacity', weight)
                    .attr('fill', 'none');
                
                // Weight label
                svg.append('text')
                    .attr('x', (x + targetX) / 2)
                    .attr('y', midY - 5)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '9px')
                    .attr('font-family', 'monospace')
                    .attr('fill', '#4285f4')
                    .text(weight.toFixed(2));
            }
        });
    });
    
    // Draw nodes on top
    tokens.forEach((token, i) => {
        const x = (i + 1) * nodeSpacing;
        
        // Node circle
        svg.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 18)
            .attr('fill', `hsl(${i * 360 / tokens.length}, 70%, 60%)`)
            .attr('stroke', '#333')
            .attr('stroke-width', 2);
        
        // Node label
        svg.append('text')
            .attr('x', x)
            .attr('y', y + 4)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('font-family', 'system-ui')
            .attr('font-weight', 'bold')
            .text(token.word.substring(0, 6));
        
        // Index label
        svg.append('text')
            .attr('x', x)
            .attr('y', y + 35)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('font-family', 'monospace')
            .attr('fill', '#666')
            .text(`(${i})`);
    });
}

// Update explanations with current text
function updateExplanationWithCurrentText(text) {
    // This will be called to update all ASCII diagrams with actual user text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() || text;
    
    // Update tokenization explanation
    const step1 = document.getElementById('step-1');
    const pre1 = step1.querySelector('.ascii-diagram');
    pre1.textContent = `
INPUT: "${firstSentence}"
       ↓ (word-level splitting)
TOKENS: ${JSON.stringify(firstSentence.split(/\s+/))}
        ↓ (index assignment)  
INDICES: [${firstSentence.split(/\s+/).map((_, i) => i).join(', ')}]

┌─────────────────────────────────────────────┐
│          TOKEN TO INDEX MAPPING             │
├─────────────────────────────────────────────┤
${firstSentence.split(/\s+/).map((word, i) => 
    `│ ${word.padEnd(12)} → ${i.toString().padStart(2)}                              │`
).join('\n')}
└─────────────────────────────────────────────┘`;
}

// Simulate message passing
async function simulateMessagePassing(tokens, attention) {
    // Simple simulation of h' = σ(Σⱼ α_ij · W · hⱼ)
    return tokens.map((token, i) => {
        const aggregated = Array(256).fill(0);
        
        // Weighted sum of neighbor features
        for (let j = 0; j < tokens.length; j++) {
            const weight = attention[i][j];
            for (let dim = 0; dim < 256; dim++) {
                aggregated[dim] += weight * (Math.random() - 0.5); // Simulated features
            }
        }
        
        return aggregated;
    });
}

// Final graph processing implemented above in Stage 5 section

// Update various explanation sections (placeholder implementations)
function updateTokenizationExplanation(text, tokens) { /* Implementation for live updates */ }
function updateEmbeddingExplanation(tokens, embeddings) { /* Implementation for live updates */ }
function updateAttentionExplanation(tokens, attention) { /* Implementation for live updates */ }
function updateAggregationExplanation(tokens, features) { /* Implementation for live updates */ }
function updateFinalGraphExplanation(tokens, attention) { /* Implementation for live updates */ }