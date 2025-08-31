/**
 * Main entry point for text-as-graph visualization
 */

import './d3-conventions';
import { TextAsGraph } from './text-as-graph-v2';

// Global variables for the interface
let textAsGraphInstance = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  // Create the text-as-graph visualization
  textAsGraphInstance = new TextAsGraph();
  
  // Set up manual text input interface
  setupTextInput();
  
  console.log('Text-as-graph visualization initialized');
}

function setupTextInput() {
  const textInput = document.getElementById('manual-text-input');
  const charCount = document.getElementById('char-count');
  const updateButton = document.getElementById('update-graph');
  
  if (!textInput || !charCount || !updateButton) {
    console.warn('Text input interface elements not found');
    return;
  }
  
  // Update character count in real-time
  function updateCharCount() {
    const count = textInput.value.length;
    const maxLength = textInput.getAttribute('maxlength') || 100;
    charCount.textContent = count;
    
    // Change color when approaching limit
    if (count > maxLength * 0.9) {
      charCount.style.color = '#dc3545';
    } else if (count > maxLength * 0.75) {
      charCount.style.color = '#fd7e14';
    } else {
      charCount.style.color = '#6c757d';
    }
  }
  
  // Set initial character count
  updateCharCount();
  
  // Add event listeners
  textInput.addEventListener('input', updateCharCount);
  textInput.addEventListener('keydown', function(e) {
    // Allow Enter key to trigger update
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      updateVisualization();
    }
  });
}

// Global function to update the visualization
window.updateVisualization = function updateVisualization() {
  const textInput = document.getElementById('manual-text-input');
  if (!textInput || !textAsGraphInstance) {
    console.warn('Cannot update visualization: missing elements');
    return;
  }
  
  const newText = textInput.value.trim();
  if (!newText) {
    console.warn('Cannot update visualization: empty text');
    return;
  }
  
  // Update the hidden input in the visualization
  const visualizationInput = document.querySelector('#text-as-graph input');
  if (visualizationInput) {
    visualizationInput.value = newText;
    
    // Trigger the render function
    if (textAsGraphInstance && typeof textAsGraphInstance.render === 'function') {
      textAsGraphInstance.render();
    } else {
      // Fallback: trigger input event
      visualizationInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    console.log('Visualization updated with: "' + newText + '"');
  }
}