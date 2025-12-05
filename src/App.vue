<template>
  <div class="app-container">
    <ControlPanel
      v-model:query="queryText"
      v-model:paragraph="paragraphText"
      v-model:embeddingMethod="embeddingMethod"
      :is-loading="isLoading"
      @update="handleUpdate"
    />
    <GraphVisualizer
      ref="graphVisualizer"
      :query="queryText"
      :paragraph="paragraphText"
      :embedding-method="embeddingMethod"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ControlPanel from './components/ControlPanel.vue';
import GraphVisualizer from './components/GraphVisualizer.vue';

const queryText = ref('Graph attention mechanisms capture relationships');
const paragraphText = ref('Neural networks are powerful machine learning models. Graph attention mechanisms capture complex relationships between words. These models can transform how we process natural language understanding.');
const embeddingMethod = ref('synthetic');
const isLoading = ref(false);
const graphVisualizer = ref(null);

const handleUpdate = () => {
  if (graphVisualizer.value) {
    graphVisualizer.value.updateGraph();
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
}

.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}
</style>
