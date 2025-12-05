<template>
  <div
    class="text-input-section"
    ref="draggableBox"
    :style="{ left: position.x + 'px', top: position.y + 'px', cursor: isDragging ? 'grabbing' : 'grab' }"
    @mousedown="startDrag"
  >
    <div class="drag-handle" @mousedown="startDrag"></div>

    <!-- Paragraph Input Section (Collapsible) -->
    <div class="paragraph-section">
      <div class="section-header">
        <div class="section-title">📄 Context Paragraph</div>
        <button class="toggle-btn" @click.stop="toggleParagraph">
          {{ isParagraphVisible ? '▼' : '▲' }}
        </button>
      </div>
      <div v-show="isParagraphVisible" class="paragraph-container">
        <textarea
          id="paragraph-input"
          v-model="paragraph"
          placeholder="Enter full paragraph for attention context..."
          maxlength="10000"
          @mousedown.stop
        ></textarea>
        <div class="char-count">
          <span>{{ paragraph.length }}</span>/10000 chars
        </div>
      </div>
    </div>

    <!-- Query Sentence Section -->
    <div class="query-section-title">🎯 Query Sentence</div>
    <input
      id="manual-text-input"
      type="text"
      v-model="query"
      placeholder="Enter query sentence..."
      class="query-input"
      @keydown.enter="emitUpdate"
      @mousedown.stop
    >

    <!-- Embedding Method Selection -->
    <div class="embedding-section">
      <label class="radio-label">
        <input
          type="radio"
          value="synthetic"
          v-model="embeddingMethod"
          @mousedown.stop
        >
        <span>🎲 Synthetic Embeddings (Fast)</span>
      </label>
      <label class="radio-label" :class="{ 'disabled': isRealEmbeddingLoading }">
        <input
          type="radio"
          value="real"
          v-model="embeddingMethod"
          :disabled="isRealEmbeddingLoading"
          @mousedown.stop
        >
        <span>
          {{ isRealEmbeddingLoading ? '🧠 EmbeddingGemma (Loading...)' : '🧠 EmbeddingGemma' }}
        </span>
      </label>
    </div>

    <div class="button-container">
      <button id="update-graph" class="update-btn" @click.stop="emitUpdate" @mousedown.stop>
        🔄 Compute GAT
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  query: String,
  paragraph: String,
  embeddingMethod: String,
  isLoading: Boolean
});

const emit = defineEmits(['update:query', 'update:paragraph', 'update:embeddingMethod', 'update']);

const query = ref(props.query);
const paragraph = ref(props.paragraph);
const embeddingMethod = ref(props.embeddingMethod);

// Sync local state with props
watch(() => props.query, (newVal) => query.value = newVal);
watch(() => props.paragraph, (newVal) => paragraph.value = newVal);
watch(() => props.embeddingMethod, (newVal) => embeddingMethod.value = newVal);

// Emit changes
watch(query, (newVal) => emit('update:query', newVal));
watch(paragraph, (newVal) => emit('update:paragraph', newVal));
watch(embeddingMethod, (newVal) => emit('update:embeddingMethod', newVal));

const isParagraphVisible = ref(true);
const isRealEmbeddingLoading = ref(true); // Initially true, check availability later

const toggleParagraph = () => {
  isParagraphVisible.value = !isParagraphVisible.value;
};

const emitUpdate = () => {
  emit('update');
};

// Drag functionality
const draggableBox = ref(null);
const position = reactive({ x: 20, y: window.innerHeight - 380 }); // Initial position similar to CSS
const isDragging = ref(false);
let dragStart = { x: 0, y: 0 };
let initialPos = { x: 0, y: 0 };

const startDrag = (e) => {
  // Prevent drag if clicking inputs (already handled by @mousedown.stop but good to be safe)
  if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName)) return;

  isDragging.value = true;
  dragStart.x = e.clientX;
  dragStart.y = e.clientY;
  initialPos.x = position.x;
  initialPos.y = position.y;

  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;

  const deltaX = e.clientX - dragStart.x;
  const deltaY = e.clientY - dragStart.y;

  // Simple boundary check
  const newX = Math.max(0, Math.min(window.innerWidth - 350, initialPos.x + deltaX));
  const newY = Math.max(0, Math.min(window.innerHeight - 50, initialPos.y + deltaY));

  position.x = newX;
  position.y = newY;
};

const stopDrag = () => {
  isDragging.value = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
};

onMounted(() => {
    // Check if real embedding is available (mock check for now or integrate with logic)
    // For now we just enable it after a "loading" period or check window
    setTimeout(() => {
        isRealEmbeddingLoading.value = false;
    }, 1000);
});
</script>

<style scoped>
.text-input-section {
  position: fixed;
  width: 350px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s ease;
  user-select: none;
}

.text-input-section:hover {
    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
}

.drag-handle {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  background: #dc3545;
  border-radius: 50%;
  cursor: grab;
  z-index: 1001;
  transition: background 0.2s ease;
}

.text-input-section:hover .drag-handle {
    background: #ff4757;
}

.paragraph-section {
  margin-bottom: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  color: #555;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  padding: 0;
}

.paragraph-container textarea {
  width: 100%;
  height: 80px;
  padding: 8px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: monospace;
  box-sizing: border-box;
}

.char-count {
  font-size: 10px;
  color: #888;
  text-align: right;
  margin-top: 2px;
}

.query-section-title {
  text-align: center;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
}

.query-input {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  box-sizing: border-box;
  margin-bottom: 8px;
}

.embedding-section {
  margin-bottom: 8px;
  font-size: 11px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  cursor: pointer;
}

.radio-label.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-container {
  text-align: center;
  margin-top: 8px;
}

.update-btn {
  background: #4285f4;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.update-btn:hover {
  background: #3367d6;
}
</style>
