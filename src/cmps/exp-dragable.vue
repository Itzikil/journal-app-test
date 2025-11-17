<template>
  <div>
    <h3>Order Message Inputs (Native Drag & Drop)</h3>

    <div
      v-for="(f, i) in fields"
      :key="f.id"
      class="row"
      @dragover.prevent
      @drop="drop(i)"
    >
      <!-- HANDLE: only this starts dragging -->
      <span
        class="handle"
        draggable="true"
        @dragstart="dragStart(i, $event)"
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
      dragIndex: null,

      fields: [
        { id: 1, label: "Number of Lessons" },
        { id: 2, label: "Price" },
        { id: 3, label: "Month" },
      ]
    }
  },

  methods: {
    dragStart(index, event) {
      this.dragIndex = index;

      // 🔥 remove the ghost image
      const emptyImg = new Image();
      emptyImg.src = "";
      event.dataTransfer.setDragImage(emptyImg, 0, 0);
    },

    drop(dropIndex) {
      const arr = [...this.fields];
      const dragged = arr.splice(this.dragIndex, 1)[0];
      arr.splice(dropIndex, 0, dragged);

      this.fields = arr;
      this.dragIndex = null;
    },

    buildMessage() {
      return this.fields.map(f => f.label).join(" | ");
    }
  }
}
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #eee;
  border-radius: 8px;
  margin-bottom: 8px;
}

.handle {
  margin-right: 10px;
  font-size: 20px;
  cursor: grab;
  user-select: none;
}
</style>
