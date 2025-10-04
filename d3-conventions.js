/**
 * d3.conventions implementation for exact compatibility
 * Based on d3-jetpack conventions
 */

import * as d3 from 'd3';

// Add d3-jetpack methods to d3 selection prototype
if (!d3.selection.prototype.st) {
  d3.selection.prototype.st = function(styles) {
    for (let key in styles) {
      this.style(key, styles[key]);
    }
    return this;
  };
}

if (!d3.selection.prototype.at) {
  d3.selection.prototype.at = function(attrs) {
    for (let key in attrs) {
      this.attr(key, attrs[key]);
    }
    return this;
  };
}

if (!d3.selection.prototype.parent) {
  d3.selection.prototype.parent = function() {
    return d3.select(this.node().parentNode);
  };
}

if (!d3.selection.prototype.appendMany) {
  d3.selection.prototype.appendMany = function(name, data) {
    return this.selectAll(name)
      .data(data)
      .enter()
      .append(name.split('.')[0]);
  };
}

if (!d3.selection.prototype.translate) {
  d3.selection.prototype.translate = function(x, y) {
    return this.attr('transform', `translate(${x}, ${y || 0})`);
  };
}

// d3.conventions function - export as standalone function
export function conventions(opts) {
  opts = opts || {};
  const sel = opts.sel || d3.select('body');
  const margin = opts.margin || { top: 0, right: 0, bottom: 0, left: 0 };
  const height = opts.height || 250;
  const width = opts.width || sel.node().getBoundingClientRect().width;
  const layers = opts.layers || 'sv';
  
  const result = {
    sel: sel,
    margin: margin,
    height: height,
    width: width,
    layers: []
  };
  
  // Create layers based on string specification
  for (let layer of layers) {
    switch(layer) {
      case 's': // SVG layer
        const svg = sel.append('svg')
          .attr('width', width)
          .attr('height', height);
        result.layers.push(svg);
        break;
      case 'd': // DIV layer
        const div = sel.append('div')
          .style('position', 'absolute');
        result.layers.push(div);
        break;
      case 'c': // Canvas layer
        const canvas = sel.append('canvas')
          .attr('width', width)
          .attr('height', height);
        result.layers.push(canvas);
        break;
    }
  }
  
  return result;
};

// Standalone cross function for cartesian products
export function cross(a, b) {
  const result = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result.push([a[i], b[j]]);
    }
  }
  return result;
}

export default d3;