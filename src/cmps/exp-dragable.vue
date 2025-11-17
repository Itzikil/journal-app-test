<template>
  <div>
    <h3>Order Message Inputs (Enhanced Drag & Drop)</h3>

    <div
      v-for="(f, i) in fields"
      :key="f.id"
      class="row"
      :class="{ 'drag-over': i === dragOverIndex }"
      @dragover.prevent="dragOver(i)"
      @drop="drop(i)"
      @touchstart="touchStart(i, $event)"
      @touchend="touchEnd"
    >
      <!-- DRAG HANDLE -->
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
      dragOverIndex: null,
      longPressTimer: null,

      fields: JSON.parse(localStorage.getItem("msg_fields")) || [
        { id: 1, label: "Number of Lessons" },
        { id: 2, label: "Price" },
        { id: 3, label: "Month" },
      ]
    };
  },

  methods: {
    // -----------------------
    // DESKTOP DRAG START
    // -----------------------
    dragStart(index, event) {
      this.dragIndex = index;

      // remove ghost
      const emptyImg = new Image();
      emptyImg.src = "";
      event.dataTransfer.setDragImage(emptyImg, 0, 0);
    },

    dragOver(index) {
      this.dragOverIndex = index;
    },

    drop(dropIndex) {
      const arr = [...this.fields];
      const dragged = arr.splice(this.dragIndex, 1)[0];
      arr.splice(dropIndex, 0, dragged);

      this.fields = arr;
      this.save();
      this.dragIndex = null;
      this.dragOverIndex = null;
    },

    // -----------------------
    // MOBILE LONG-PRESS ACTIVATION
    // -----------------------
    touchStart(index, event) {
      this.longPressTimer = setTimeout(() => {
        this.dragIndex = index;
        // simulate dragstart feel
        event.target.style.opacity = "0.4";
      }, 200);
    },

    touchEnd(event) {
      clearTimeout(this.longPressTimer);
      event.target.style.opacity = "1";
      this.dragIndex = null;
    },

    // -----------------------
    // UTIL
    // -----------------------
    save() {
      localStorage.setItem("msg_fields", JSON.stringify(this.fields));
    },

    buildMessage() {
      return this.fields.map(f => f.label).join(" | ");
    }
  }
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
  transition: transform 0.2s, background 0.2s;
}

/* SMOOTH ANIMATION WHEN MOVING */
.row.drag-over {
  background: #d9e8ff;
  transform: scale(1.03);
}

.handle {
  margin-right: 10px;
  font-size: 20px;
  cursor: grab;
  user-select: none;
}
</style>
