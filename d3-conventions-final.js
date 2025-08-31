/**
 * Complete d3.conventions implementation 
 * Based on original Distill d3-jetpack usage
 */

import * as d3 from 'd3';

// Add d3-jetpack methods to d3 selection prototype
d3.selection.prototype.st = function(styles) {
  for (let key in styles) {
    this.style(key, typeof styles[key] === 'function' ? styles[key] : styles[key]);
  }
  return this;
};

d3.selection.prototype.at = function(attrs) {
  for (let key in attrs) {
    this.attr(key, typeof attrs[key] === 'function' ? attrs[key] : attrs[key]);
  }
  return this;
};

d3.selection.prototype.translate = function(x, y) {
  return this.attr('transform', d => {
    const existingTransform = d3.select(this.node()).attr('transform') || '';
    const translateMatch = existingTransform.match(/translate\([^)]*\)/);
    const newTranslate = `translate(${typeof x === 'function' ? x(d) : x},${typeof y === 'function' ? y(d) : y})`;
    
    if (translateMatch) {
      return existingTransform.replace(translateMatch[0], newTranslate);
    } else {
      return newTranslate + ' ' + existingTransform;
    }
  });
};

d3.selection.prototype.appendMany = function(type, data) {
  return this.selectAll(type).data(data).enter().append(type);
};

// d3.conventions function
d3.conventions = function(opts) {
  opts = opts || {};
  
  const sel = opts.sel || d3.select('body');
  const margin = opts.margin || { top: 0, right: 0, bottom: 0, left: 0 };
  const width = opts.width || 900;
  const height = opts.height || 250;
  const layers = opts.layers || 's'; // 's' for svg, 'd' for div, 'sd' for both
  
  const totalWidth = width + margin.left + margin.right;
  const totalHeight = height + margin.top + margin.bottom;
  
  const result = {
    width: width,
    height: height,
    totalWidth: totalWidth,
    totalHeight: totalHeight,
    margin: margin
  };
  
  if (layers.includes('s')) {
    // Create SVG layer
    result.svg = sel.append('svg')
      .attr('width', totalWidth)
      .attr('height', totalHeight);
    
    result.svg.container = result.svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  }
  
  if (layers.includes('d')) {
    // Create DIV layer
    result.div = sel.append('div')
      .st({
        position: 'absolute',
        width: totalWidth + 'px',
        height: totalHeight + 'px'
      });
  }
  
  // Return layers array if multiple layers requested
  if (layers === 'sd') {
    result.layers = [result.svg.container, result.div];
  } else if (layers === 'ds') {
    result.layers = [result.div, result.svg.container];
  }
  
  return result;
};

export default d3;