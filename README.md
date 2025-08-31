# TextGraph - GAT Attention Visualization

Interactive text-to-graph visualization with Graph Attention Networks (GAT) computation and transparency-based attention mapping.

## 🎯 Overview

This system implements a complete GAT attention visualization where:
- **Paragraph context** provides attention computation base
- **Query sentences** are analyzed within paragraph context  
- **Graph nodes** get transparency based on attention strength
- **Adjacency matrix** shows attention values with normalized transparency
- **Hover interactions** highlight related elements between graph and matrix

## 🚀 Quick Start

```bash
npm run dev -- --host 0.0.0.0 --port 42040
```

Access: http://localhost:42040

## 📱 Interface

### Input System
- **📄 Context Paragraph** (collapsible) - Full paragraph for attention context
- **🎯 Query Sentence** - Target sentence to analyze  
- **🔄 Compute GAT** - Trigger attention computation and visualization

### Visual Elements
- **Graph nodes** - Words with transparency = attention strength
- **Adjacency matrix** - Attention values with color-coded transparency
- **Hover interactions** - Graph↔Matrix highlighting
- **Draggable components** - Both input box and graph are draggable

## 🧠 GAT Implementation

### Core Functions

#### `computeGATAttention(paragraphText, queryText)`
**Inputs:**
- `paragraphText`: Full context paragraph (string)
- `queryText`: Target sentence to analyze (string)

**Returns:**
```javascript
{
  queryTokens: ["graph", "attention", "mechanisms"],
  attentionMatrix: [[0, 0.45, 0.32], [0.58, 0, 0.67], [0.42, 0.33, 0]],
  minAttention: 0.0027,
  maxAttention: 0.9580,
  computationDetails: {embeddings: 3, matrixSize: "3x3", nonZeroElements: 6}
}
```

### Mathematical Pipeline

1. **`createEmbeddingMatrix()`** - Generate 64-dimensional token embeddings
2. **`createAttentionScoreMatrix()`** - Compute dot products + LeakyReLU
3. **`applySoftmaxNormalization()`** - Convert to probability distributions

### Visualization Pipeline

1. **`applyAttentionColoring()`** - Apply transparency to graph nodes
2. **`createAttentionMatrix()`** - Render adjacency matrix with values
3. **`setupAttentionHoverInteractions()`** - Enable graph↔matrix highlighting

## 🎨 Transparency Mapping

### Graph Nodes
- **Opacity = attention strength** (0→100% transparent, 1→100% opaque)
- **Fixed colors**: Blue text, yellow rectangles

### Adjacency Matrix  
- **Transparency normalized** by min/max across full matrix
- **High attention** = low transparency (more opaque)
- **Attention values** displayed as text overlays (0.xxx format)
- **Color coding**: Blue for connections, gray for self-attention

## 🎯 Hover Interactions

### Graph Node Hover
- Highlights corresponding **matrix row and column**
- Shows attention weights in console tooltip

### Matrix Cell Hover  
- Highlights corresponding **graph nodes**
- Displays connection strength and interpretation

## 📊 Attention Computation Details

```
WORKFLOW:
Paragraph → Tokenization → Embeddings → Attention Scores → Softmax → Visualization

EXAMPLE:
Input: "Neural networks are powerful. Graph attention mechanisms capture relationships."
Query: "Graph attention mechanisms"

Tokens: [graph, attention, mechanisms]
Matrix: 3x3 attention weights
Range: [0.0027, 0.9580]
Result: Transparency-mapped visualization
```

## 🔧 Technical Stack

- **MathJax**: Mathematical attention computation
- **D3.js**: SVG-based matrix and graph rendering  
- **JavaScript ES6**: Module-based architecture
- **Vite**: Development server with hot reload
- **Playwright**: Multi-worker testing and validation