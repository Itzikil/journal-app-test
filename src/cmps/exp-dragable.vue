<template>
  <div class="container">
    <h3>Order Message Inputs (Swap on Release)</h3>

    <div
      v-for="(f, i) in fields"
      :key="f.id"
      class="row"
      :class="{ 'drag-over': i === dragOverIndex, dragging: i === draggingIndex }"
      @dragover.prevent="onDragOver(i)"
      @drop="onDrop(i)"
    >
      <!-- handle -->
      <span
        class="handle"
        draggable="true"
        @dragstart="onDragStart(i, $event)"
        @dragend="onDragEnd"
        @touchstart.prevent="onTouchStart(i, $event)"
        @touchmove.prevent="onTouchMove($event)"
        @touchend.prevent="onTouchEnd"
        @touchcancel.prevent="onTouchEnd"
      >☰</span>

      <span class="label">{{ f.label }}</span>
    </div>

    <h3>Preview</h3>
    <div class="preview">{{ buildMessage() }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fields: JSON.parse(localStorage.getItem("msg_fields")) || [
        { id: 1, label: "Number of Lessons" },
        { id: 2, label: "Price" },
        { id: 3, label: "Month" },
      ],

      // Desktop drag
      nativeDragIndex: null,

      // Touch drag
      draggingIndex: null,
      dragOverIndex: null,
      touchStartTimer: null,
      touchLongPressDelay: 200,
      startTouchY: 0,
      touchCurrentY: 0,
      touchActive: false,
    };
  },
  methods: {
    // ---------- UTIL ----------
    save() {
      localStorage.setItem("msg_fields", JSON.stringify(this.fields));
    },
    buildMessage() {
      return this.fields.map(f => f.label).join(" | ");
    },

    // ---------- DESKTOP ----------
    onDragStart(index, event) {
      this.nativeDragIndex = index;
      const empty = new Image();
      empty.src = "";
      try { event.dataTransfer.setDragImage(empty, 0, 0); } catch {}
    },
    onDragOver(index) { if (this.nativeDragIndex !== null) this.dragOverIndex = index; },
    onDrop(dropIndex) {
      if (this.nativeDragIndex === null) return;
      this.moveItem(this.nativeDragIndex, dropIndex);
      this.nativeDragIndex = null;
      this.dragOverIndex = null;
    },
    onDragEnd() { this.nativeDragIndex = null; this.dragOverIndex = null; },

    // ---------- TOUCH ----------
    onTouchStart(index, e) {
      this.clearTouchState();
      this.startTouchY = e.touches[0].clientY;
      this.touchStartTimer = setTimeout(() => {
        this.touchActive = true;
        this.draggingIndex = index;
      }, this.touchLongPressDelay);
    },
    onTouchMove(e) {
      if (!this.touchActive) return;
      this.touchCurrentY = e.touches[0].clientY;
      const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      const rowEl = this.findAncestorRow(el);
      if (!rowEl) { this.dragOverIndex = null; return; }
      const indexAttr = rowEl.getAttribute("data-index");
      this.dragOverIndex = indexAttr !== null ? Number(indexAttr) : null;
    },
    onTouchEnd() {
      if (this.draggingIndex !== null && this.dragOverIndex !== null && this.draggingIndex !== this.dragOverIndex) {
        this.moveItem(this.draggingIndex, this.dragOverIndex);
        this.save();
      }
      this.clearTouchState();
    },
    clearTouchState() {
      if (this.touchStartTimer) { clearTimeout(this.touchStartTimer); this.touchStartTimer = null; }
      this.draggingIndex = null;
      this.dragOverIndex = null;
      this.touchActive = false;
    },

    moveItem(i1, i2) {
      const arr = [...this.fields];
      const item = arr.splice(i1, 1)[0];
      arr.splice(i2, 0, item);
      this.fields = arr;
    },

    findAncestorRow(el) {
      if (!el) return null;
      let cur = el;
      while (cur && cur !== document.body) {
        if (cur.classList && cur.classList.contains("row")) return cur;
        cur = cur.parentNode;
      }
      return null;
    },
  },

  mounted() {
    // set data-index attributes for touch detection
    this.$nextTick(() => {
      const rows = this.$el.querySelectorAll(".row");
      rows.forEach((r, i) => r.setAttribute("data-index", i));
    });
  },
};
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: transform 160ms ease, background 160ms ease;
}

.row.drag-over { background: #d9e8ff; transform: scale(1.03); }
.row.dragging { background: #fff1c9; transform: scale(1.02); }

.handle {
  margin-right: 10px;
  font-size: 20px;
  cursor: grab;
  user-select: none;
  width: 28px;
  text-align: center;
}

.label { flex: 1; }

.preview {
  margin-top: 12px;
  background: #f6f7fb;
  padding: 10px;
  border-radius: 6px;
}
</style>
