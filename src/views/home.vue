<template>
  <section class="container home text-center">
    <h1>Work Journal</h1>
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
    <div>
      <p>Already have an account?</p>
      <router-link to="/login">Sign in</router-link>
      <p>Or </p>
      <button @click="pasteData">Paste students data</button>
    </div>
  </section>
</template>

<script>
import downloadBtn from '../cmps/download-btn.vue'
import { utilService } from '../services/util.service';
import ModalComponent from '../cmps/alertModal.vue'; // Adjust the import path as necessary
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service';

export default {
  name: 'home',
  data() {
    return {
      isModalVisible: false,
      modalMessage: '',
      modalImage: ''
    }
  },
  created() {
    if (this.loggedInUser) {
      this.$router.push('/today')
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
  methods: {
    handleOpenModal(payload) {
      this.modalMessage = payload.message;
      this.modalImage = payload.image;
      this.isModalVisible = true;
    },
    async pasteData() {
      try {
        const text = await navigator.clipboard.readText();
        const data = JSON.parse(text);
        if (data.user) {
          console.log(data.user);
          utilService.saveToStorage('user', data.user)
        }
        if (data.student) {
          utilService.saveToStorage('student', data.student)
        }
        showSuccessMsg("data pasted, now login");
        this.$router.push('/login')
      } catch (err) {
        console.error('Failed to paste objects: ', err);
      }
    },
  },
  components: {
    downloadBtn,
    ModalComponent
  }
}
</script>