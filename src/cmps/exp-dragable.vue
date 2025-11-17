<template>
  <div>
    <h3>Order Message Inputs (Mobile + Desktop)</h3>

    <div
      v-for="(f, i) in fields"
      :key="f.id"
      class="row"
      :class="{ dragging: i === dragIndex, 'drag-over': i === dragOverIndex }"
      @pointermove="onPointerMove(i, $event)"
      @pointerup="onPointerUp"
    >
      <!-- DRAG HANDLE -->
      <span
        class="handle"
        @pointerdown="onPointerDown(i, $event)"
      >
        ☰
      </span>

      {{ f.label }}
    </div>

    <h3>Preview</h3>
    <div>{{ buildMessage() }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fields: [
        { id: 1, label: "Number of Lessons" },
        { id: 2, label: "Price" },
        { id: 3, label: "Month" },
      ],

      dragIndex: null,
      dragOverIndex: null,
      isDragging: false,

      startY: 0,
      currentY: 0,
    };
  },

  methods: {
    // Start dragging (when pressing the handle)
    onPointerDown(index, event) {
      this.dragIndex = index;
      this.isDragging = true;
      this.startY = event.clientY || event.touches?.[0]?.clientY;

      event.target.setPointerCapture(event.pointerId);
    },

    // Moving while dragging
    onPointerMove(index, event) {
      if (!this.isDragging) return;

      this.currentY = event.clientY || event.touches?.[0]?.clientY;
      const deltaY = this.currentY - this.startY;

      // Detect if drag passes into another row
      if (deltaY > 30 && index < this.fields.length - 1) {
        this.swap(index, index + 1);
        this.startY = this.currentY;
      }
      if (deltaY < -30 && index > 0) {
        this.swap(index, index - 1);
        this.startY = this.currentY;
      }

      this.dragOverIndex = index;
    },

    // When releasing finger/mouse
    onPointerUp(event) {
      this.isDragging = false;
      this.dragIndex = null;
      this.dragOverIndex = null;
    },

    swap(i1, i2) {
      const arr = [...this.fields];
      [arr[i1], arr[i2]] = [arr[i2], arr[i1]];
      this.fields = arr;
    },

    buildMessage() {
      return this.fields.map(f => f.label).join(" | ");
    },
  },
};
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #eee;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: 0.15s ease;
}

.handle {
  margin-right: 10px;
  font-size: 20px;
  cursor: grab;
  user-select: none;
}

.dragging {
  background: #ffe8a3;
  transform: scale(1.03);
}

.drag-over {
  background: #d9e8ff;
}
</style>
