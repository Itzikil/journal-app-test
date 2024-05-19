<template>
    <div class="pull-to-refresh" v-if="isMobile && runningAsPwa" @touchstart="startTouch" @touchmove="moveTouch"
        @touchend="endTouch">
        <slot></slot>
        <div ref="spinner" class="spinner-container" :class="{ active: isRefreshing }">
            <div class="spinner"></div>
        </div>
    </div>
</template>

<script>
import { utilService } from '../services/util.service'
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
        runningAsPwa() {
            console.log(utilService.isRunningAsPWA());
            return utilService.isRunningAsPWA()
        },
        startTouch(event) {
            if (window.scrollY === 0) {
                this.startY = event.touches[0].pageY;
                console.log(this.startY);
                if (this.startY > 200) return
                this.currentY = this.startY;
                this.isTouching = true;
            }
        },
        moveTouch(event) {
            if (!this.isTouching || window.scrollY > 0) return;
            this.currentY = event.touches[0].pageY;
            const distance = this.currentY - this.startY;
            if (distance > 50) {
                this.isRefreshing = true;
            }
        },
        endTouch() {
            this.isTouching = false;
            const distance = this.currentY - this.startY;
            this.isRefreshing = false;
            if (distance > 50) {
                this.refreshPage();
            }
        },
        refreshPage() {
            setTimeout(() => {
                window.location.reload();
            }, 600);
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
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    display: none;
    opacity: 0;
    transition: 0.3s;
}

.spinner-container.active {
    opacity: 1;
    display: block;
    transform: translate(-50%, 120px);
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