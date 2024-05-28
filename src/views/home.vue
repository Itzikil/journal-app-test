<template>
  <section class="container home text-center">
    <h1>Work Journal</h1>
    <h2 class="text-center">Orgnaize your work </h2>
    <img alt="Vue logo" src="/pwa-192x192.png">
    <div class="flex gap-10">
      <img src="../assets/imgs/arrived.svg" alt="V" v-if="IsPwa" class="vi-image">
      <downloadBtn @open-modal="handleOpenModal" />
    </div>
    <div class="flex gap-10">
      <img src="../assets/imgs/arrived.svg" alt="V" v-if="loggedInUser" class="vi-image">
      <router-link to="/login">
        <p>Signup</p>
      </router-link>
    </div>
    <p>Add students</p>
    <p>Organize your schedule</p>
    <ModalComponent :message="modalMessage" :imageSrc="modalImage" :visible="isModalVisible"
      @close="isModalVisible = false" />
  </section>
</template>

<script>
import downloadBtn from '../cmps/download-btn.vue'
import { utilService } from '../services/util.service';
import ModalComponent from '../cmps/alertModal.vue'; // Adjust the import path as necessary

export default {
  name: 'home',
  data() {
    return {
      isModalVisible: false,
      modalMessage: '',
      modalImage: ''
    }
  },
  computed: {
    IsPwa() {
      console.log(utilService.isRunningAsPWAOnDesktop());
      return utilService.isRunningAsPWA() || utilService.isRunningAsPWAOnDesktop()
    },
    loggedInUser() {
      return this.$store.getters.loggedinUser
    },
  },
  created() {
  },
  methods: {
    handleOpenModal(payload) {
      this.modalMessage = payload.message;
      this.modalImage = payload.image;
      this.isModalVisible = true;
    }
  },
  components: {
    downloadBtn,
    ModalComponent
  }
}
</script>