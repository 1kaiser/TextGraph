# TextGraph - GAT Attention Visualization

## 🌐 [Live Demo](https://1kaiser.github.io/TextGraph/)

Interactive text-to-graph visualization with Graph Attention Networks (GAT) computation and transparency-based attention mapping.

![TextGraph GAT Visualization](https://raw.githubusercontent.com/1kaiser/TextGraph/master/screenshots/gat-test-worker-2-1756616821922.png)

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
  attentionMatrix: [[0.003, 0.047, 0.950], [0.531, 0.031, 0.439], [0.958, 0.039, 0.003]],
  minAttention: 0.0027,
  maxAttention: 0.9580,
  computationDetails: {embeddings: 3, matrixSize: "3x3", nonZeroElements: 6}
}
```

### Mathematical Pipeline

1. **`createEmbeddingMatrix()`** - Generate 64-dimensional deterministic embeddings
2. **`createAttentionScoreMatrix()`** - Compute dot products + LeakyReLU activation  
3. **`applySoftmaxNormalization()`** - Row-wise probability normalization

### Visualization Pipeline

1. **`applyAttentionColoring()`** - Apply transparency to graph nodes
2. **`updateExistingMatrix()`** - Update original adjacency matrix SVG
3. **`updateOriginalMatrixWithAttention()`** - Apply attention to existing rectangles
4. **`addAttentionScoresToMatrix()`** - Overlay numerical attention scores
5. **`setupAttentionHoverInteractions()`** - Enable graph↔matrix highlighting

## 🎨 Transparency Mapping

### Graph Nodes
- **Opacity = attention strength** (0→100% transparent, 1→100% opaque)
- **Fixed colors**: Blue text, yellow rectangles

### Adjacency Matrix  
- **Transparency normalized** by min/max across full matrix
- **High attention** = low transparency (more opaque)
- **Attention values** displayed as text overlays (0.x format)
- **Matrix squares**: 1.3x larger for better readability
- **Arrow routing**: Straight arrows for clean connections
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

## 📦 Deployment Options

### Development Server
```bash
npm run dev        # Standard development server (localhost:1234)
npm run dev:gat    # GAT explorer server (host 0.0.0.0:42040)
```

### Production Build
```bash
npm run build      # Creates optimized dist/ folder
npm run build:gat  # Builds GAT explorer version
```

### Portable Distribution
The build system creates a portable package (~121KB compressed) that includes:
- Complete application bundled with dependencies
- Self-contained HTML, CSS, and JavaScript
- Automatic CDN dependency loading (D3.js, MathJax)
- No installation required - just serve and run

Users only need:
- Modern web browser
- HTTP server (Python, Node.js, or any static server)
- Internet connection for first-time CDN downloads

## 🔧 Technical Stack

- **MathJax**: Mathematical attention computation
- **D3.js**: SVG-based matrix and graph rendering  
- **TypeScript**: Type-safe module architecture with advanced text measurement
- **Parcel**: Build system and development server
- **Playwright**: Multi-worker testing and validation

### ⚡ Performance Improvements (Sep 2025)

**Enhanced Text Measurement System:**
- ✅ **Dynamic Character Width**: Replaced hardcoded values with `getComputedTextLength()` measurement
- ✅ **Precise Bounding Box**: `getBBox()` API for pixel-perfect word positioning
- ✅ **Precomputed Dimensions**: Batch text measurement for optimal rendering performance
- ✅ **Cross-browser Compatibility**: SVG measurement APIs work consistently across browsers

**Technical Implementation:**
```typescript
// Before: Hardcoded and inaccurate
this.charWidth = 15;
const width = word.length * this.charWidth;

// After: Dynamic and precise
this.charWidth = this.calculateDynamicCharWidth();
const width = this.measureTextWidth(word); // Uses getBBox()
```

**Benefits:**
- **Perfect Text-Rectangle Alignment**: Rectangles now precisely fit text content
- **Improved Visual Accuracy**: Eliminates text overflow and positioning issues
- **Better Performance**: Precomputed text dimensions reduce DOM queries
- **Responsive Design**: Adapts automatically to different fonts and screen sizes

## 📚 References & Inspiration

This implementation draws from foundational work in Graph Neural Networks and interactive educational visualizations:

### Graph Neural Networks Theory
- **Sanchez-Lengeling, B., Reif, E., Pearce, A., & Wiltschko, A. B.** (2021). *A Gentle Introduction to Graph Neural Networks*. Distill. https://doi.org/10.23915/distill.00033

Key concepts implemented:
- **Text-as-Graph Representation**: "Texts can be viewed as directed graphs where each character or index is a node and is connected via an edge to the node that follows it" [[1]](#references)
- **Graph Attention Networks (GAT)**: Enables "nodes to attend over their neighborhoods' features" and "specifying different weights to different nodes in a neighborhood" [[1]](#references)
- **Message Passing**: Core GNN mechanism for information exchange between graph components [[1]](#references)

### Interactive Visualization
- **Distill GNN Interactive Visualizations**: https://github.com/distillpub/post--gnn-intro  
  - Educational framework for graph neural network concepts
  - Interactive web-based demonstrations
  - Open-source implementation patterns (Apache-2.0 License)

### Implementation Philosophy
This project extends the educational approach of Distill publications by providing:
1. **Hands-on GAT Computation**: Real mathematical attention weight calculation
2. **Interactive Exploration**: Bidirectional graph ↔ matrix highlighting 
3. **Transparency Mapping**: Visual encoding of attention strength through opacity
4. **Educational Accessibility**: Complete local execution with portable deployment

### References
[1] Sanchez-Lengeling, B., Reif, E., Pearce, A., & Wiltschko, A. B. (2021). A Gentle Introduction to Graph Neural Networks. *Distill*. https://doi.org/10.23915/distill.00033