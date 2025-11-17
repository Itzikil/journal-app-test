<template>
  <div class="container">
    <h3>Order Message Inputs (Desktop + Mobile)</h3>

    <div
      v-for="(f, i) in fields"
      :key="f.id"
      class="row"
      :class="{ 'drag-over': i === dragOverIndex, dragging: i === draggingIndex }"
      @dragover.prevent="onDragOver(i)"
      @drop="onDrop(i)"
    >
      <!-- handle: native drag on desktop -->
      <span
        class="handle"
        draggable="true"
        @dragstart="onDragStart(i, $event)"
        @dragend="onDragEnd"
        @touchstart.prevent="onTouchStart(i, $event)"
        @touchmove.prevent="onTouchMove($event)"
        @touchend.prevent="onTouchEnd($event)"
        @touchcancel.prevent="onTouchEnd($event)"
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

      // Desktop (native) drag
      nativeDragIndex: null,

      // Touch fallback
      touchActive: false,          // whether touch-driven dragging is active
      draggingIndex: null,         // index of item being dragged (touch)
      dragOverIndex: null,         // highlighted index while moving
      touchStartTimer: null,
      touchLongPressDelay: 200,    // ms
      floatingCln: null,           // DOM clone element that follows finger
      startTouchY: 0,
    };
  },
  methods: {
    // ---------- SHARED UTIL ----------
    save() {
      localStorage.setItem("msg_fields", JSON.stringify(this.fields));
    },

    buildMessage() {
      return this.fields.map((f) => f.label).join(" | ");
    },

    // ---------- DESKTOP (native HTML5) ----------
    onDragStart(index, event) {
      this.nativeDragIndex = index;

      // prevent ghost image by using an empty image
      const empty = new Image();
      empty.src = "";
      try {
        event.dataTransfer.setDragImage(empty, 0, 0);
      } catch (e) {
        // some browsers might throw; ignore
      }
    },

    onDragOver(index) {
      // highlight the item you're dragging over
      if (this.nativeDragIndex !== null) {
        this.dragOverIndex = index;
      }
    },

    onDrop(dropIndex) {
      if (this.nativeDragIndex === null) return;
      const arr = [...this.fields];
      const dragged = arr.splice(this.nativeDragIndex, 1)[0];
      arr.splice(dropIndex, 0, dragged);
      this.fields = arr;
      this.save();
      this.nativeDragIndex = null;
      this.dragOverIndex = null;
    },

    onDragEnd() {
      this.nativeDragIndex = null;
      this.dragOverIndex = null;
    },

    // ---------- TOUCH FALLBACK (mobile) ----------
    onTouchStart(index, e) {
      // start a long-press timer. only after this fires we enable touch dragging.
      // store the initial touch position to compute movements.
      this.clearTouchState();

      const touch = e.touches ? e.touches[0] : e;
      this.startTouchY = touch.clientY;

      // short-circuit: if device supports native drag and it's good, the user may still expect default.
      // But we purposely provide a fallback regardless.
      this.touchStartTimer = setTimeout(() => {
        // begin touch-driven dragging
        this.touchActive = true;
        this.draggingIndex = index;
        this.createFloatingClone(index, touch.clientX, touch.clientY);
        // add a small vibration / visual feedback (if supported)
        if (navigator.vibrate) navigator.vibrate(10);
      }, this.touchLongPressDelay);
    },

    onTouchMove(e) {
      if (!this.touchActive) return;

      const touch = e.touches ? e.touches[0] : e;
      const x = touch.clientX;
      const y = touch.clientY;

      // move floating clone with the finger
      if (this.floatingCln) {
        // offset so finger is not exactly centered on clone
        this.floatingCln.style.transform = `translate(${x + 8}px, ${y + 8}px)`;
      }

      // detect which row is currently under the finger
      const el = document.elementFromPoint(x, y);
      const rowEl = this.findAncestorRow(el);
      if (!rowEl) {
        this.dragOverIndex = null;
        return;
      }
      const indexAttr = rowEl.getAttribute("data-index");
      // if data-index not set (we'll set it below), compute index using children
      let idx = null;
      if (indexAttr !== null) idx = Number(indexAttr);
      else {
        // fallback: find index by comparing nodes in DOM
        const rows = Array.from(this.$el.querySelectorAll(".row"));
        idx = rows.indexOf(rowEl);
      }

      // don't highlight the dragged item itself as drag-over
      if (idx === this.draggingIndex) {
        this.dragOverIndex = null;
      } else {
        this.dragOverIndex = idx;
      }

      // auto-swap behavior if finger passes midpoint of another row
      // compute bounding rect of the row under finger
      const rowRect = rowEl.getBoundingClientRect();
      const midY = rowRect.top + rowRect.height / 2;
      if (this.draggingIndex !== null && idx !== null && idx !== this.draggingIndex) {
        if (y > midY && idx > this.draggingIndex) {
          // move dragged down
          this.moveItem(this.draggingIndex, idx);
          this.draggingIndex = idx;
        } else if (y < midY && idx < this.draggingIndex) {
          // move dragged up
          this.moveItem(this.draggingIndex, idx);
          this.draggingIndex = idx;
        }
      }
    },

    onTouchEnd(e) {
      // stop long-press timer if it didn't start dragging
      if (!this.touchActive) {
        this.clearTouchState();
        return;
      }

      // finalize drop: nothing to do besides cleanup because we swapped during move
      this.touchActive = false;
      this.dragOverIndex = null;
      this.draggingIndex = null;
      this.removeFloatingClone();
      this.save();
    },

    clearTouchState() {
      if (this.touchStartTimer) {
        clearTimeout(this.touchStartTimer);
        this.touchStartTimer = null;
      }
      this.touchActive = false;
      this.draggingIndex = null;
      this.dragOverIndex = null;
      this.removeFloatingClone();
    },

    createFloatingClone(index, x, y) {
      this.removeFloatingClone(); // safe
      const rowEls = this.$el.querySelectorAll(".row");
      const el = rowEls[index];
      if (!el) return;

      // set data-index attributes to rows to make elementFromPoint simpler
      rowEls.forEach((r, i) => r.setAttribute("data-index", i));

      // clone node and style it as floating helper
      const clone = el.cloneNode(true);
      clone.classList.add("floating-clone");
      clone.style.position = "fixed";
      clone.style.left = "0";
      clone.style.top = "0";
      clone.style.margin = "0";
      clone.style.zIndex = 9999;
      clone.style.pointerEvents = "none";
      clone.style.transform = `translate(${x + 8}px, ${y + 8}px)`;
      clone.style.transition = "transform 0.05s linear";
      document.body.appendChild(clone);
      this.floatingCln = clone;

      // style original row to indicate dragging
      el.classList.add("placeholder-dragging");
    },

    removeFloatingClone() {
      if (this.floatingCln && this.floatingCln.parentNode) {
        // remove placeholder class from original rows
        const placeholders = this.$el.querySelectorAll(".placeholder-dragging");
        placeholders.forEach((p) => p.classList.remove("placeholder-dragging"));

        this.floatingCln.parentNode.removeChild(this.floatingCln);
        this.floatingCln = null;
      }
    },

    // moves item from i1 to i2 (inclusive). updates fields reactively.
    moveItem(i1, i2) {
      if (i1 === i2) return;
      const arr = [...this.fields];
      const item = arr.splice(i1, 1)[0];
      arr.splice(i2, 0, item);
      this.fields = arr;
    },

    // helper to find nearest .row ancestor of an element
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
    // ensure rows are annotated for touch detection each mount/update
    this.$nextTick(() => {
      const rows = this.$el.querySelectorAll(".row");
      rows.forEach((r, i) => r.setAttribute("data-index", i));
    });

    // cleanup on page unload
    window.addEventListener("beforeunload", () => {
      this.save();
    });
  },

  beforeDestroy() {
    // Vue 2 hook
    this.clearTouchState();
  },
  beforeUnmount() {
    // Vue 3 hook
    this.clearTouchState();
  },
};
</script>

<style scoped>
.container {
  max-width: 520px;
  margin: 10px;
}

.row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: transform 160ms ease, background 160ms ease;
  will-change: transform;
}

/* smooth subtle lift while dragging */
.row.dragging,
.row.placeholder-dragging {
  background: #fff1c9;
  transform: scale(1.02);
}

/* highlight target row */
.row.drag-over {
  background: #d9e8ff;
  transform: scale(1.03);
}

.handle {
  margin-right: 10px;
  font-size: 20px;
  cursor: grab;
  user-select: none;
  width: 28px;
  text-align: center;
}

/* optional label styling */
.label {
  flex: 1;
}

/* floating clone shown while touch-dragging */
.floating-clone {
  box-shadow: 0 10px 20px rgba(0,0,0,0.12);
  border-radius: 8px;
  background: #fff;
  padding: 10px 12px;
  opacity: 0.95;
  transform-origin: left top;
}

/* preview area */
.preview {
  margin-top: 12px;
  background: #f6f7fb;
  padding: 10px;
  border-radius: 6px;
}

/* small responsive tweak */
@media (max-width: 420px) {
  .container { padding: 8px; }
  .row { padding: 10px; }
  .handle { font-size: 18px; width: 26px; }
}
</style>
