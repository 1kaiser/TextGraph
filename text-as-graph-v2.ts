/**
 * Fixed implementation of text-as-graph visualization
 */

import * as d3 from 'd3';

const padding = 30;
const wordSpacing = 30;
const fontSize = 30;
const steelblue = d3.color('steelblue');
const blue = steelblue.darker(-.5);
const blueDark = steelblue.darker(2);

export class TextAsGraph {
  private rectSel;
  private arrowSel;
  private wordSel;
  private inputNode;
  private sel = d3.select('#text-as-graph');
  private wordsHolder = this.sel.append('div');
  private coords = [null, null];
  private adjMatSel;
  private charWidth;
  private measurementSvg; // SVG for text measurement

  constructor() {
    console.log('🚀 TextGraph: Initializing with enhanced text measurement system...');
    
    // Create measurement SVG for accurate text sizing  
    this.measurementSvg = d3.select('body').append('svg')
      .style('position', 'absolute')
      .style('left', '-9999px')  // Use left instead of visibility
      .style('top', '0px')
      .attr('width', 1000)
      .attr('height', 100);
    
    console.log('📏 TextGraph: Created hidden measurement SVG for precise text calculations');
    
    // Calculate dynamic character width using actual text measurement
    this.charWidth = this.calculateDynamicCharWidth();
    console.log(`✨ TextGraph: Dynamic character width calculated: ${this.charWidth}px (replaces hardcoded 15px)`);
    console.log('🎯 TextGraph: Enhanced text measurement system active - getBBox() API enabled!');
    
    // Make the z index lower to make overflow go behind words.
    this.sel.parent().style('z-index', '-1');
    const c = d3.conventions({ 
      sel: this.wordsHolder, 
      margin: { left: 0 }, 
      layers: 'sd', 
      height: 400,
      width: window.innerWidth - 40
    });
    const [svgSel, divSel] = c.layers;

    divSel.st({ left: 0, top: 20 + padding, height: 30 });
    const that = this;
    const inputSel = divSel.append('input')
      .st({ 
        'word-spacing': wordSpacing + 'px', 
        fontSize,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        position: 'absolute',
        zIndex: 10,
        color: 'transparent'  // Hide the input text
      })
      .at({ maxlength: 100 })
      .on('input', () => this.render())
      .on('mousemove', function () {
        const x = d3.mouse(this)[0];
        let offset = 0;
        let wordIdx = 0;
        for (let l of [...this.value]) {
          const isSpace = l == ' ';
          offset += isSpace ? that.charWidth + wordSpacing : that.charWidth;
          wordIdx += isSpace ? 1 : 0;
          if (offset > x) {
            that.hover(wordIdx, isSpace ? wordIdx - 1 : wordIdx);
            return;
          }
        }
      })
      .on('mouseout', d => this.hover());

    this.inputNode = inputSel.node();
    this.inputNode.value = 'Graphs are all around us';

    const height = 100;

    // Create groups for rectangles, words, and arrows
    const rectGroup = svgSel.append('g').attr('class', 'rects');
    const wordGroup = svgSel.append('g').attr('class', 'words');
    const arrowGroup = svgSel.append('g').attr('class', 'arrows');

    this.rectSel = rectGroup;
    this.wordSel = wordGroup;
    this.arrowSel = arrowGroup;

    this.adjMatSel = this.sel.append('svg')
      .st({ position: 'absolute', top: 200, left: 50, overflow: 'visible' });

    this.render();
  }

  public render() {
    console.log('🎨 TextGraph: Starting render with enhanced text measurement...');
    
    // Clear previous elements
    this.rectSel.selectAll('*').remove();
    this.wordSel.selectAll('*').remove();
    this.arrowSel.selectAll('*').remove();

    const words = this.inputNode.value.split(' ').map((word, i) => ({ word, i }));
    console.log(`📝 TextGraph: Processing ${words.length} words:`, words.map(w => w.word));
    
    // Precompute text dimensions for all words for better performance
    const startTime = performance.now();
    const wordDimensions = this.precomputeTextDimensions(words.map(w => w.word));
    const endTime = performance.now();
    
    const wordsWithDimensions = words.map((word, i) => ({
      ...word,
      width: wordDimensions[i].width,
      height: wordDimensions[i].height
    }));
    
    console.log(`⚡ TextGraph: Precomputed text dimensions in ${(endTime - startTime).toFixed(2)}ms`);
    console.log('📊 TextGraph: Word measurements:', wordsWithDimensions.map(w => `"${w.word}": ${w.width.toFixed(1)}px`));
    
    // Calculate total improvement over old method
    const totalNewWidth = wordsWithDimensions.reduce((sum, w) => sum + w.width, 0);
    const totalOldWidth = wordsWithDimensions.reduce((sum, w) => sum + (w.word.length * 15), 0);
    const improvementPercent = ((totalNewWidth - totalOldWidth) / totalOldWidth * 100);
    
    console.log(`🎯 TextGraph: Total width accuracy improvement: ${improvementPercent > 0 ? '+' : ''}${improvementPercent.toFixed(1)}% (${totalNewWidth.toFixed(1)}px vs ${totalOldWidth.toFixed(1)}px old method)`);
    console.log('🔧 TextGraph: Enhanced measurement system provides pixel-perfect text-rectangle alignment!');
    
    const pad = 5;
    const spaceWidth = this.charWidth + wordSpacing;
    const height = 100;
    const maxWidth = window.innerWidth - 100; // Leave margin for wrapping
    const lineHeight = 120; // Space between lines
    
    // Calculate word positions with wrapping using precomputed dimensions
    const wordPositions = [];
    let currentX = 0;
    let currentY = 0;
    let currentLine = 0;

    wordsWithDimensions.forEach((d, i) => {
      const width = d.width; // Use precomputed width
      const wordWidth = width + pad * 2;
      
      // Check if word would overflow current line
      if (currentX + wordWidth > maxWidth && currentX > 0) {
        // Move to next line
        currentLine++;
        currentX = 0;
        currentY = currentLine * lineHeight;
      }
      
      // Store position for this word
      wordPositions.push({
        ...d,
        x: currentX,
        y: currentY,
        width: width, // Already using precomputed width
        line: currentLine
      });
      
      currentX += wordWidth + spaceWidth;
    });

    // Draw rectangles and word labels with wrapped positioning
    wordPositions.forEach((d, i) => {
      // Add rectangle
      this.rectSel.append('rect')
        .attr('x', d.x - pad + padding)
        .attr('y', d.y + height / 4)
        .attr('width', d.width + pad * 2)
        .attr('height', height / 2)
        .attr('rx', height / 6)
        .attr('ry', height / 6)
        .attr('fill', `hsl(51, 100%, ${Math.random()*50 + 50}%)`)
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .attr('data-index', i)
        .on('mouseover', () => this.hover(i, i))
        .on('mouseout', () => this.hover());

      // Add word text
      this.wordSel.append('text')
        .attr('x', d.x + d.width / 2 + padding)
        .attr('y', d.y + height / 2)
        .attr('dy', '.33em')
        .attr('text-anchor', 'middle')
        .attr('fill', '#000')
        .attr('font-family', 'monospace')
        .attr('font-size', fontSize)
        .attr('pointer-events', 'none')
        .text(d.word);
    });

    // Draw arrows with simple straight routing
    wordPositions.forEach((d, i) => {
      if (i < wordPositions.length - 1) {
        const nextWord = wordPositions[i + 1];
        
        // Calculate connection points at word rectangle edges
        const fromX = d.x + d.width + pad * 2 + padding;
        const fromY = d.y + height / 2;
        const toX = nextWord.x - pad + padding;
        const toY = nextWord.y + height / 2;
        
        // Use simple straight arrows for all connections
        this.arrowSel.append('text')
          .attr('x', (fromX + toX) / 2)
          .attr('y', (fromY + toY) / 2)
          .attr('dy', '.33em')
          .attr('text-anchor', 'middle')
          .attr('fill', blue)
          .attr('font-size', 30)
          .attr('data-from', i)
          .attr('data-to', i + 1)
          .text('→');
      }
    });

    // Center the wrapped graph horizontally
    const screenWidth = window.innerWidth;
    const maxLineWidth = Math.max(...Array.from(new Set(wordPositions.map(w => w.line)))
      .map(lineNum => {
        const lineWords = wordPositions.filter(w => w.line === lineNum);
        const lastWord = lineWords[lineWords.length - 1];
        return lastWord.x + lastWord.width + pad * 2;
      }));
    
    const centerOffset = (screenWidth - maxLineWidth) / 2;
    
    // Apply translation to center all SVG elements
    this.rectSel.attr('transform', `translate(${centerOffset}, 0)`);
    this.wordSel.attr('transform', `translate(${centerOffset}, 0)`);
    this.arrowSel.attr('transform', `translate(${centerOffset}, 0)`);

    this.makeAdjMat(words);
  }

  private makeAdjMat(words) {
    // DISABLED: Central matrix removed - using dual GAT matrices instead
    this.adjMatSel.selectAll('*').remove();
    return; // Exit early to prevent central matrix creation

    this.adjMatSel
      .attr('font-size', 12)
      .attr('fill', 'gray');
      
    const pairs = d3.cross(words, words);
    const w = 26; // 20 * 1.3 = 26
    
    // Add adjacency matrix rectangles
    this.adjMatSel
      .selectAll('rect')
      .data(pairs)
      .enter()
      .append('rect')
      .attr('width', w)
      .attr('height', w)
      .attr('transform', d => `translate(${d[0].i * w}, ${d[1].i * w})`)
      .attr('fill', d => this.isEdge(d) ? blue : 'white')
      .attr('stroke', '#aaa')
      .attr('stroke-width', .2)
      .on('mouseover', d => this.hover(d[0].i, d[1].i))
      .on('mouseout', d => this.hover());

    // Center adj matrix using full screen width
    const screenWidth = window.innerWidth;
    const matrixWidth = w * words.length;
    const matrixLeftOffset = Math.max(0, (screenWidth - matrixWidth) / 2);
    this.adjMatSel.st({ left: matrixLeftOffset + 'px' });

    // Add top words (rotated)
    this.adjMatSel.selectAll('text.top')
      .data(words)
      .enter()
      .append('text')
      .attr('class', 'top')
      .attr('transform', d => `translate(${d.i * w + w / 2}, -5) rotate(-90)`)
      .attr('text-anchor', 'start')
      .text(d => d.word);

    // Add side words
    this.adjMatSel.selectAll('text.side')
      .data(words)
      .enter()
      .append('text')
      .attr('class', 'side')
      .attr('transform', d => `translate(-5, ${(d.i + .75) * w})`)
      .attr('text-anchor', 'end')
      .text(d => d.word);
  }

  private isEdge(d) {
    return d[1].i - d[0].i === 1;
  }

  private hover(i?: number, j?: number) {
    if (this.coords[0] == i && this.coords[1] == j) {
      return;
    }
    this.coords = [i, j];
    
    // Update the adj mat square color
    this.adjMatSel.selectAll('rect')
      .attr('fill', d => !this.isEdge(d) ? 'white' : 
        (d[0].i === i && d[1].i === j ? blueDark : blue));

    // Highlight the text on the adj mat
    const highlightColor = '#000';
    this.adjMatSel.selectAll('text.top')
      .attr('fill', d => d.i === i ? highlightColor : 'gray')
      .style('font-weight', d => d.i === i ? 'bold' : '');
    this.adjMatSel.selectAll('text.side')
      .attr('fill', d => d.i === j ? highlightColor : 'gray')
      .style('font-weight', d => d.i === j ? 'bold' : '');

    // Highlight rectangles
    this.rectSel.selectAll('rect')
      .attr('stroke', function() {
        const idx = +this.getAttribute('data-index');
        return (idx === i || idx === j) ? highlightColor : '#000';
      })
      .attr('stroke-width', function() {
        const idx = +this.getAttribute('data-index');
        return (idx === i || idx === j) ? 3 : 1;
      });

    // Highlight arrows
    this.arrowSel.selectAll('text')
      .attr('stroke', function() {
        const from = +this.getAttribute('data-from');
        const to = +this.getAttribute('data-to');
        return (from === j && to === i) ? blueDark : blue;
      })
      .attr('stroke-width', function() {
        const from = +this.getAttribute('data-from');
        const to = +this.getAttribute('data-to');
        return (from === j && to === i) ? 4 : 0;
      })
      .attr('fill', function() {
        const from = +this.getAttribute('data-from');
        const to = +this.getAttribute('data-to');
        return (from === j && to === i) ? blueDark : blue;
      });
  }

  /**
   * Calculate dynamic character width using actual text measurement
   */
  private calculateDynamicCharWidth(): number {
    const testText = this.measurementSvg.append('text')
      .attr('font-family', 'monospace')
      .attr('font-size', fontSize + 'px')  // Add 'px' unit
      .style('font-family', 'monospace')   // Ensure style is applied
      .style('font-size', fontSize + 'px') // Ensure style is applied
      .text('x');
    
    const width = testText.node().getComputedTextLength();
    testText.remove();
    
    console.log(`🔍 TextGraph: Calculated dynamic char width using getComputedTextLength(): ${width}px`);
    console.log(`📈 TextGraph: Improvement over hardcoded (15px): ${width > 15 ? '+' : ''}${(width - 15).toFixed(1)}px`);
    
    return width > 0 ? width : 18; // Use actual monospace character width as fallback
  }

  /**
   * Measure the actual width of text using getBBox()
   */
  private measureTextWidth(text: string): number {
    if (!text || text.length === 0) return 0;
    
    const textElement = this.measurementSvg.append('text')
      .attr('font-family', 'monospace')
      .attr('font-size', fontSize + 'px')  // Add 'px' unit
      .style('font-family', 'monospace')   // Ensure style is applied
      .style('font-size', fontSize + 'px') // Ensure style is applied
      .text(text);
    
    const bbox = textElement.node().getBBox();
    const width = bbox.width;
    const oldMethodWidth = text.length * 15; // Old hardcoded method
    const actualWidth = width > 0 ? width : text.length * this.charWidth;
    
    textElement.remove();
    
    console.log(`📐 TextGraph: getBBox() measurement for "${text}": ${actualWidth.toFixed(1)}px (vs old method: ${oldMethodWidth}px, diff: ${(actualWidth - oldMethodWidth).toFixed(1)}px)`);
    
    return actualWidth;
  }

  /**
   * Precompute text dimensions for a list of words
   */
  private precomputeTextDimensions(words: string[]): Array<{word: string, width: number, height: number}> {
    return words.map(word => ({
      word,
      width: this.measureTextWidth(word),
      height: fontSize * 1.2 // Approximate line height
    }));
  }

  /**
   * Alternative measurement using getComputedTextLength for performance
   */
  private measureTextWidthFast(text: string): number {
    if (!text || text.length === 0) return 0;
    
    const textElement = this.measurementSvg.append('text')
      .attr('font-family', 'monospace')
      .attr('font-size', fontSize)
      .text(text);
    
    const width = textElement.node().getComputedTextLength();
    textElement.remove();
    
    return width;
  }

  /**
   * Clean up measurement SVG when destroying instance
   */
  public destroy(): void {
    if (this.measurementSvg) {
      this.measurementSvg.remove();
    }
  }
}

