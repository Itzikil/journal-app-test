<template>
  <transition name="slide-down">
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
      const delay = msg.delay || 4500;
      this.alive = true;
      this.positionY = -50; // Start off-screen
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
      positionY: -50, // Initial position off-screen
      isDragging: false,
      startY: 0,
      initialPositionY: 0,
      hideThreshold: -100, // Threshold to fully hide the bar
    };
  },
  methods: {
    showBar() {
      this.positionY = 0; // Move to the top of the screen
    },
    hideBar() {
      this.positionY = -50; // Move back off-screen
      setTimeout(() => {
        this.alive = false;
      }, 300); // Wait for the transition to complete
    },
    startDrag(event) {
      this.isDragging = true;
      this.startY = event.touches[0].clientY;
      this.initialPositionY = this.positionY;
    },
    onDrag(event) {
      if (this.isDragging) {
        const deltaY = event.touches[0].clientY - this.startY;
        this.positionY = this.initialPositionY + deltaY;

        // No constraint on dragging up; allow to go above the screen
      }
    },
    endDrag() {
      this.isDragging = false;

      // Hide the bar if dragged above the hideThreshold
      if (this.positionY < this.hideThreshold) {
        this.hideBar();
      } else {
        this.positionY = 0; // Reset to the top if not dragged up enough
      }
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
  top: 0;
  /* left: 0; */
  /* right: 0; */
  background-color: #333;
  color: white;
  padding: 10px;
  text-align: center;
  z-index: 1000;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  transition: top 0.3s ease;
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter {
  top: -50px;
}

.slide-down-leave-to {
  top: -50px;
}
</style>

<!-- 

<template>
  <div class="alert" :class="alive? 'scroll-down' : ''">
    {{ msg?.txt }}
  </div>
</template>


<script>
import { eventBus, SHOW_MSG } from "../services/event-bus.service.js"

export default {
  created() {
    eventBus.on(SHOW_MSG, (msg) => {
      this.msg = msg
      var delay = msg.delay || 4500
      this.alive = true
      // window.scrollTo({top: 0, behavior: 'smooth'});
      setTimeout(() => {
        this.alive = false
      }, delay)
    })
  },
  data() {
    return {
      alive: false,
      msg: null,
    }
  },
  computed: {
    alertClass() {
      if (!this.msg) return
      return `alert-${this.msg.type}`
    },
  },
}
</script> -->