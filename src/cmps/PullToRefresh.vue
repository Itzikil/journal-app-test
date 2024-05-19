<template>
    <div class="pull-to-refresh" v-if="isMobile" @touchstart="startTouch" @touchmove="moveTouch" @touchend="endTouch">
        <slot></slot>
        <div ref="spinner" class="spinner-container" :class="{ active: isRefreshing }">
            <div class="spinner"></div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            startY: 0,
            currentY: 0,
            isRefreshing: false,
            isMobile: false,
            isTouching: false,
        };
    },
    mounted() {
        this.isMobile = this.detectMobile();
    },
    methods: {
        detectMobile() {
            return /Mobi|Android/i.test(navigator.userAgent);
        },
        startTouch(event) {
            if (window.scrollY === 0) {
                this.startY = event.touches[0].pageY;
                if (this.startY > 200) return
                this.currentY = this.startY;
                console.log(this.currentY);
                this.isTouching = true;
            }
        },
        moveTouch(event) {
            if (!this.isTouching || window.scrollY > 0) return;
            this.currentY = event.touches[0].pageY;
            const distance = this.currentY - this.startY;
            // if (distance > 0) {
            // document.documentElement.style.scrollBehavior = 'auto';
            // window.scrollTo(0, -distance);
            if (distance > 50) {
                this.isRefreshing = true;
            }
            // event.preventDefault();
            // }
        },
        endTouch() {
            this.isTouching = false;
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
                this.$emit('refresh'); // Notify the parent component to refresh content
            }, 2000); // Adjust this duration based on your needs
        },
        reset() {
            this.startY = 0;
            this.currentY = 0;
            document.documentElement.style.scrollBehavior = '';
            window.scrollTo(0, 0);
        },
    },
};
</script>

<style scoped>
.pull-to-refresh {
    position: relative;
}

.spinner-container {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.spinner-container.active {
    opacity: 1;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #000;
    width: 24px;
    height: 24px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>