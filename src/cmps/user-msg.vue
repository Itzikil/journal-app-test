first remeber the new code:
<template>
  <transition name="slide-down" @before-enter="beforeEnter" @enter="enter" @leave="leave">
    <div
      v-if="alive"
      class="alert"
      :class="alertClass"
      :style="{ top: `${positionY}px` }"
      @touchstart="startDrag"
      @touchmove="onDrag"
      @touchend="endDrag"
    >
      {{ msg?.txt }}
    </div>
  </transition>
</template>

<script>
import { eventBus, SHOW_MSG } from "../services/event-bus.service.js";

export default {
  created() {
    eventBus.on(SHOW_MSG, (msg) => {
      this.msg = msg;
      const delay = msg.delay || 2500;
      this.alive = true;
      this.positionY = 20; // Start 20px from the top
      this.showBar();
      setTimeout(() => {
        if (!this.isDragging) {
          this.hideBar();
        }
      }, delay);
    });
  },
  data() {
    return {
      alive: false,
      msg: null,
      positionY: 20, // Initial position 20px from the top
      isDragging: false,
      startY: 0,
      initialPositionY: 20, // Adjusted to match initial position
      hideThreshold: 0, // Threshold to fully hide the bar, adjust as needed
      maxDragDown: 10, // Maximum pixels to drag down
    };
  },
  methods: {
    showBar() {
      this.positionY = 20; // Set initial position when showing
    },
    hideBar() {
      this.positionY = -150; // Move off-screen, adjust to ensure complete hide
      setTimeout(() => {
        this.alive = false;
      }, 300); // Wait for the transition to complete
    },
    startDrag(event) {
      event.preventDefault(); // Prevent default behavior for both touch and mouse events
      this.isDragging = true;
      this.startY = event.touches ? event.touches[0].clientY : event.clientY;
      this.initialPositionY = this.positionY;
    },
    onDrag(event) {
      if (this.isDragging) {
        event.preventDefault(); // Prevent default behavior for both touch and mouse events
        const deltaY = (event.touches ? event.touches[0].clientY : event.clientY) - this.startY;
        
        // Constrain dragging down to a maximum of `maxDragDown` pixels
        if (deltaY > this.maxDragDown) {
          this.positionY = this.initialPositionY + this.maxDragDown;
        } else {
          this.positionY = this.initialPositionY + deltaY;
        }
        
        // Allow dragging up beyond the screen
      }
    },
    endDrag() {
      this.isDragging = false;

      // Hide the bar if dragged above the hideThreshold
      if (this.positionY < this.hideThreshold) {
        this.hideBar();
      } else {
        this.positionY = 20; // Reset to initial position if not dragged up enough
      }
    },
    beforeEnter(el) {
      el.style.top = '-150px'; // Start off-screen before enter transition
    },
    enter(el, done) {
      el.offsetHeight; // Trigger reflow to apply the CSS transition
      el.style.transition = 'top 0.8s ease'; // Ensure transition is applied
      el.style.top = '20px'; // Final position when enter transition is complete
      done(); // Call done to indicate transition is complete
    },
    leave(el, done) {
      el.style.transition = 'top 0.8s ease'; // Ensure transition is applied
      el.style.top = '-150px'; // Move off-screen when leave transition is complete
      done(); // Call done to indicate transition is complete
    },
  },
  computed: {
    alertClass() {
      if (!this.msg) return;
      return `alert-${this.msg.type}`;
    },
  },
};
</script>

<style scoped>
.alert {
  position: fixed;
  top: 20px; /* Initial position for styling */
  padding: 13px;
  text-align: center;
  z-index: 1000;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  transition: top 0.8s ease; /* Transition for smooth sliding */
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: top 0.8s ease; /* Ensure transition is applied */
}

.slide-down-enter {
  top: -150px; /* Start off-screen before enter transition */
}

.slide-down-leave-to {
  top: -150px; /* Move off-screen when leave transition is complete */
}
</style>
