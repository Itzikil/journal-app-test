<template>
    <div
      class="pull-to-refresh"
      @touchstart="startTouch"
      @touchmove="moveTouch"
      @touchend="endTouch"
    >
      <div :class="['refresh-indicator', { active: isRefreshing }]">
        <div class="spinner"></div>
      </div>
      <slot></slot>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        startY: 0,
        currentY: 0,
        isRefreshing: false,
      };
    },
    methods: {
      startTouch(event) {
        if (window.scrollY === 0) {
          this.startY = event.touches[0].pageY;
          this.currentY = this.startY;
        }
      },
      moveTouch(event) {
        if (this.startY === 0) return;
        this.currentY = event.touches[0].pageY;
        const distance = this.currentY - this.startY;
        if (distance > 50) {
          this.$refs.indicator.style.height = `${distance}px`;
        }
      },
      endTouch() {
        const distance = this.currentY - this.startY;
        if (distance > 50) {
          this.isRefreshing = true;
          this.refreshPage();
        } else {
          this.reset();
        }
      },
      refreshPage() {
        // Simulate a refresh action
        setTimeout(() => {
          this.isRefreshing = false;
          this.reset();
          this.$emit('refresh');
        }, 2000); // Adjust this duration based on your needs
      },
      reset() {
        this.startY = 0;
        this.currentY = 0;
        this.$refs.indicator.style.height = '0';
      },
    },
  };
  </script>
  
  <style scoped>
  .pull-to-refresh {
    position: relative;
    overflow: hidden;
  }
  .refresh-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 0;
    background-color: #f3f3f3;
    transition: height 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .refresh-indicator.active {
    height: 50px; /* Adjust this height to match the design */
  }
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #000;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  </style>
  