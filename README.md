# 🧠 TextGraph - GAT Attention Visualization

🚀 Interactive text-to-graph visualization with Graph Attention Networks (GAT) computation and transparency-based attention mapping.

![TextGraph GAT Visualization](https://raw.githubusercontent.com/1kaiser/TextGraph/master/screenshots/gat-test-worker-2-1756616821922.png)

> 🎯 **Graph Attention Networks in action**: Interactive visualization showing "Attention mechanisms allow models" with computed attention weights displayed in the adjacency matrix (0.0-0.9 range) and corresponding node transparency. The dual-input system allows context paragraph analysis with targeted query sentences.

## 🎯 Overview

This system implements a complete GAT attention visualization where:
- 📄 **Paragraph context** provides attention computation base
- 🎯 **Query sentences** are analyzed within paragraph context  
- 🔗 **Graph nodes** get transparency based on attention strength
- 📊 **Adjacency matrix** shows attention values with normalized transparency
- 🖱️ **Hover interactions** highlight related elements between graph and matrix

## 🚀 Quick Start

### ⚡ One-Line Server Start
```bash
./start-server.sh          # 🎨 Main TextGraph visualization
./start-gat-server.sh      # 🧠 GAT attention visualization
```

### 🔧 Manual Start
```bash
npm run start              # 🎨 Main app: localhost:3000 + local IP
npm run start:gat          # 🧠 GAT app: localhost:42040 + local IP
```

**🌍 Access:**
- 🏠 **Local**: http://localhost:3000 (main) | http://localhost:42040 (GAT)  
- 🌐 **Network**: http://[YOUR_LOCAL_IP]:3000 | http://[YOUR_LOCAL_IP]:42040

## 📱 Interface

### 🖊️ Input System
- 📄 **Context Paragraph** (collapsible) - Full paragraph for attention context
- 🎯 **Query Sentence** - Target sentence to analyze  
- 🔄 **Compute GAT** - Trigger attention computation and visualization

### 🎨 Visual Elements
- 🔗 **Graph nodes** - Words with transparency = attention strength
- 📊 **Adjacency matrix** - Attention values with color-coded transparency
- 🖱️ **Hover interactions** - Graph↔Matrix highlighting
- 🏃 **Draggable components** - Both input box and graph are draggable

## 🧠 GAT Implementation

### ⚙️ Core Functions

#### `computeGATAttention(paragraphText, queryText)`
**📥 Inputs:**
- `paragraphText`: Full context paragraph (string)
- `queryText`: Target sentence to analyze (string)

**📤 Returns:**
```javascript
{
  queryTokens: ["graph", "attention", "mechanisms"],
  attentionMatrix: [[0.003, 0.047, 0.950], [0.531, 0.031, 0.439], [0.958, 0.039, 0.003]],
  minAttention: 0.0027,
  maxAttention: 0.9580,
  computationDetails: {embeddings: 3, matrixSize: "3x3", nonZeroElements: 6}
}
```

### 🧮 Mathematical Pipeline

1. 🔢 **`createEmbeddingMatrix()`** - Generate 64-dimensional deterministic embeddings
2. 🎯 **`createAttentionScoreMatrix()`** - Compute dot products + LeakyReLU activation  
3. 📊 **`applySoftmaxNormalization()`** - Row-wise probability normalization

### 🎨 Visualization Pipeline

1. 🌈 **`applyAttentionColoring()`** - Apply transparency to graph nodes
2. 🔄 **`updateExistingMatrix()`** - Update original adjacency matrix SVG
3. 🎭 **`updateOriginalMatrixWithAttention()`** - Apply attention to existing rectangles
4. 🔢 **`addAttentionScoresToMatrix()`** - Overlay numerical attention scores
5. 🖱️ **`setupAttentionHoverInteractions()`** - Enable graph↔matrix highlighting

## 🎨 Transparency Mapping

### 🔗 Graph Nodes
- 🌟 **Opacity = attention strength** (0→100% transparent, 1→100% opaque)
- 🎨 **Fixed colors**: Blue text, yellow rectangles

### 📊 Adjacency Matrix  
- 🔧 **Transparency normalized** by min/max across full matrix
- ⬆️ **High attention** = low transparency (more opaque)
- 🔢 **Attention values** displayed as text overlays (0.x format)
- 📏 **Matrix squares**: 1.3x larger for better readability
- ➡️ **Arrow routing**: Straight arrows for clean connections
- 🎯 **Color coding**: Blue for connections, gray for self-attention

## 🎯 Hover Interactions

### 🖱️ Graph Node Hover
- 🔍 Highlights corresponding **matrix row and column**
- 📊 Shows attention weights in console tooltip

### 📊 Matrix Cell Hover  
- 🔍 Highlights corresponding **graph nodes**
- 💪 Displays connection strength and interpretation

## 📊 Attention Computation Details

```
📋 WORKFLOW:
📄 Paragraph → 🔤 Tokenization → 🔢 Embeddings → 🎯 Attention Scores → 📊 Softmax → 🎨 Visualization

💡 EXAMPLE:
📥 Input: "Neural networks are powerful. Graph attention mechanisms capture relationships."
🎯 Query: "Graph attention mechanisms"

🔤 Tokens: [graph, attention, mechanisms]
📊 Matrix: 3x3 attention weights
📈 Range: [0.0027, 0.9580]
🎨 Result: Transparency-mapped visualization
```

## 🔧 Technical Stack

- 🧮 **MathJax**: Mathematical attention computation
- 🎨 **D3.js**: SVG-based matrix and graph rendering  
- 🚀 **JavaScript ES6**: Module-based architecture
- 📦 **Parcel**: Development server with hot reload
- 🎭 **Playwright**: Multi-worker testing and validation

## 📚 References

### 📄 Core Papers & Publications
- 🧠 **[Attention Is All You Need](https://arxiv.org/abs/1706.03762)** - Vaswani et al. (2017) - Foundational transformer attention mechanism
- 🔗 **[Graph Attention Networks](https://arxiv.org/abs/1710.10903)** - Veličković et al. (2018) - GAT architecture and attention computation
- 🎨 **[Text as Graph](https://distill.pub/2021/gnn-intro/)** - Google Distill (2021) - Interactive visualization inspiration

### 🛠️ Implementation References  
- 🎨 **[D3.js v5 Documentation](https://d3js.org/)** - SVG visualization and DOM manipulation
- 📦 **[Parcel Bundler](https://parceljs.org/)** - Zero-configuration build system
- 🧮 **[MathJax](https://www.mathjax.org/)** - Mathematical notation rendering
- 🎭 **[Playwright Testing](https://playwright.dev/)** - Automated browser testing framework

### 🧮 Mathematical Background
- 📊 **Softmax Normalization**: Row-wise probability distribution for attention weights
- ⚡ **LeakyReLU Activation**: `f(x) = max(0.01x, x)` for attention score computation
- 🎯 **Dot Product Attention**: `Attention(Q,K,V) = softmax(QK^T/√d_k)V`
- 📈 **Graph Adjacency Matrices**: Representing word relationships as mathematical structures

### 🚀 Development Resources
- 🌐 **Local Network Access**: Automatic IP detection with `ip route get 1`
- 💻 **Cross-Platform Compatibility**: Bash scripts with fallback IP resolution
- 🔥 **Hot Reload Development**: Parcel dev server with `--no-hmr` for stability

---

✨ *This implementation provides a complete educational tool for understanding Graph Attention Networks through interactive visualization of attention weights, mathematical computation transparency, and real-time exploration of attention patterns.* 🎓