/**
 * Main entry point for text-as-graph visualization
 */

import './d3-conventions';
import { TextAsGraph } from './text-as-graph-v2';

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  // Create the text-as-graph visualization
  new TextAsGraph();
  
  console.log('Text-as-graph visualization initialized');
}