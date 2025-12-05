<template>
  <div
    id="text-as-graph"
    ref="graphContainer"
    :style="{ cursor: isDragging ? 'grabbing' : 'grab' }"
    @mousedown="startDrag"
  ></div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineExpose, watch } from 'vue';
import * as d3 from 'd3';
import { TextAsGraph } from '../../text-as-graph-v2';

// We need to import the GAT logic.
// Since the original code was in index.js and global, we need to adapt it.
// Ideally we should extract it to a proper module.
// For now, I'll assume we've moved the logic to a utility file or I'll copy the relevant parts here.
// Let's create a utility file for GAT logic first to keep this component clean.
import {
  computeGATAttention,
  computeOriginalGATAttention,
  applyAttentionColoring,
  applyDualAttentionColoring
} from '../utils/gat-logic';

const props = defineProps({
  query: String,
  paragraph: String,
  embeddingMethod: String
});

const graphContainer = ref(null);
const textAsGraphInstance = ref(null);

const updateGraph = async () => {
  if (!textAsGraphInstance.value) return;

  const queryText = props.query.trim();
  const paragraphText = props.paragraph ? props.paragraph.trim() : '';

  if (!queryText) return;

  console.log(`Computing GAT attention with ${props.embeddingMethod}...`);

  let educationalGAT, originalGAT;

  // Logic adapted from index.js
  if (props.embeddingMethod === 'real' && window.EmbeddingGemmaManager) {
     // TODO: Implement Real Embedding Logic
     // For now fallback to synthetic as I haven't ported the async embedding logic yet
     console.warn('Real embedding not fully integrated in Vue port yet, falling back to synthetic');
     educationalGAT = computeGATAttention(paragraphText, queryText);
     originalGAT = computeOriginalGATAttention(paragraphText, queryText);
  } else {
    educationalGAT = computeGATAttention(paragraphText, queryText);
    originalGAT = computeOriginalGATAttention(paragraphText, queryText);
  }

  // Render graph (this might clear existing SVG so we need to be careful)
  // textAsGraphInstance.value.renderWithAttention(...) or render() then coloring

  // The original code does:
  // visualizationInput.value = queryText; // triggers render in TextAsGraph?
  // Actually TextAsGraph listens to input events on its internal input.

  // We need to see how TextAsGraph is implemented.
  // It attaches to #text-as-graph.

  // Direct manipulation of the TextAsGraph instance or DOM might be needed if it's not designed for Vue.
  // Assuming TextAsGraph has a method to set text or we re-instantiate it.

  // Let's look at TextAsGraph.ts content in a moment.
  // For now, I'll try to simulate the original behavior.

  // Update the input that TextAsGraph creates (if it does) or recreate the graph.
  // A cleaner way is to destroy and recreate if update API isn't clean, but that's slow.

  // HACK: TextAsGraph creates an input field inside #text-as-graph?
  // Let's check the DOM structure created by TextAsGraph in previous exploration.

  const visualizationInput = document.querySelector('#text-as-graph input');
  if (visualizationInput) {
      visualizationInput.value = queryText;
      visualizationInput.dispatchEvent(new Event('input', { bubbles: true }));

      // Wait for render to finish then apply coloring
      setTimeout(() => {
          applyDualAttentionColoring(educationalGAT, originalGAT, queryText);
      }, 100);
  } else {
      // Re-initialize if needed?
  }
};

onMounted(() => {
  textAsGraphInstance.value = new TextAsGraph();
  // Initial render might happen automatically or need a trigger

  // Wait for DOM
  setTimeout(() => {
      updateGraph();
  }, 500);
});

defineExpose({ updateGraph });

// Dragging logic for the graph container (similar to index.html logic)
const isDragging = ref(false);
let dragStart = { x: 0, y: 0 };
let initialPos = { x: 0, y: 0 };

const startDrag = (e) => {
    if (['rect', 'text', 'path', 'INPUT'].includes(e.target.tagName)) return;

    isDragging.value = true;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;

    // We need to set position style on the container if not set
    const style = window.getComputedStyle(graphContainer.value);
    initialPos.x = parseInt(style.left || 0);
    initialPos.y = parseInt(style.top || 0);

    graphContainer.value.style.position = 'relative'; // Or fixed/absolute depending on design

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
};

const onDrag = (e) => {
    if (!isDragging.value) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    graphContainer.value.style.left = (initialPos.x + deltaX) + 'px';
    graphContainer.value.style.top = (initialPos.y + deltaY) + 'px';
};

const stopDrag = () => {
    isDragging.value = false;
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', stopDrag);
};

</script>

<style scoped>
#text-as-graph {
  width: 100%;
  min-height: 400px;
  position: relative;
}
</style>
