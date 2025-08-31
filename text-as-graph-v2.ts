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

  constructor() {
    // Use the effective character width that matches original rectangles
    this.charWidth = 15; // Matches the implied character width from original rectangles
    
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
    // Clear previous elements
    this.rectSel.selectAll('*').remove();
    this.wordSel.selectAll('*').remove();
    this.arrowSel.selectAll('*').remove();

    const words = this.inputNode.value.split(' ').map((word, i) => ({ word, i }));
    
    let x = 0;
    const pad = 5;
    const spaceWidth = this.charWidth + wordSpacing;
    const height = 100;

    // Draw rectangles and word labels
    words.forEach((d, i) => {
      const width = d.word.length * this.charWidth;

      // Add rectangle
      this.rectSel.append('rect')
        .attr('x', x - pad + padding)
        .attr('y', height / 4)
        .attr('width', width + pad * 2)
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
        .attr('x', x + width / 2 + padding)
        .attr('y', height / 2)
        .attr('dy', '.33em')
        .attr('text-anchor', 'middle')
        .attr('fill', '#000')
        .attr('font-family', 'monospace')
        .attr('font-size', fontSize)
        .attr('pointer-events', 'none')
        .text(d.word);

      x += width + spaceWidth;

      // Add arrow if not last word
      if (i < words.length - 1) {
        this.arrowSel.append('text')
          .attr('x', x - spaceWidth / 2 + padding)
          .attr('y', height / 2)
          .attr('dy', '.33em')
          .attr('text-anchor', 'middle')
          .attr('fill', blue)
          .attr('font-size', 30)
          .attr('data-from', i)
          .attr('data-to', i + 1)
          .text('→');
      }
    });

    // Center the words using full screen width
    const screenWidth = window.innerWidth;
    const actualGraphWidth = x - wordSpacing; // Remove trailing space 
    const centerOffset = (screenWidth - actualGraphWidth) / 2;
    this.wordsHolder.st({ left: Math.max(50, centerOffset) + 'px' });

    this.makeAdjMat(words);
  }

  private makeAdjMat(words) {
    this.adjMatSel.selectAll('*').remove();

    this.adjMatSel
      .attr('font-size', 12)
      .attr('fill', 'gray');
      
    const pairs = d3.cross(words, words);
    const w = 20;
    
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
}

function calcCharWidth() {
  const spanSel = d3.select('body').append('span').text('x')
    .st({ 
      fontFamily: 'monospace', 
      fontSize: fontSize + 'px',  // Use px unit for correct measurement
      position: 'absolute',
      visibility: 'hidden'
    });
  const w = spanSel.node().offsetWidth;
  spanSel.remove();
  return w;
}