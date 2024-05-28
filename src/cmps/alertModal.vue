<template>
    <div v-if="visible" class="modal-overlay" @click="close">
        <div class="modal-content">
            <span class="close-btn" @click="close">X</span>
            <p>{{ message }}</p>
            <img :src=shareImg alt="">
        </div>
    </div>
</template>

<script>
import safariIcon from '@/assets/imgs/download/safari-install.svg'
import desktopInstall from '@/assets/imgs/download/desktop-install.svg'
export default {
    props: {
        message: String,
        imageSrc: String,
        visible: Boolean
    },
    computed: {
        shareImg() {
            return this.imageSrc === 'safari' ? safariIcon : desktopInstall
        }
    },
    methods: {
        close() {
            this.$emit('close');
        }
    }
};
</script>

<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    max-width: 300px;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    color: white;
}
</style>