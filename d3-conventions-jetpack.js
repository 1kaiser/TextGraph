/**
 * d3.conventions using d3-jetpack for exact compatibility
 */

import * as d3 from 'd3';
import 'd3-jetpack';

// d3-jetpack automatically adds methods like .st(), .at(), .appendMany() to d3 selections
// This ensures exact compatibility with the original Distill implementation

// Verify d3-jetpack is loaded
if (typeof d3.conventions === 'undefined') {
  console.error('d3-jetpack not loaded properly');
}

export default d3;