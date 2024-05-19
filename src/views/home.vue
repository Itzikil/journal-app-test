<template>
  <section class="container home text-center">
    <h1>Work Journal</h1>
    <h2 class="text-center">Orgnaize your work </h2>
    <img alt="Vue logo" src="/pwa-192x192.png">
    <div class="flex gap-10">
      <img src="../assets/imgs/arrived.svg" alt="V" v-if="IsPwa" class="vi-image">
      <p> Download the app</p>
    </div>
    <div class="flex gap-10">
      <img src="../assets/imgs/arrived.svg" alt="V" v-if="loggedInUser" class="vi-image">
      <router-link to="/login">
        <p>Signup</p>
      </router-link>
    </div>
    <p>Add students</p>
    <p>Organize your schedule</p>
    <downloadBtn />
  </section>


</template>

<script>
import downloadBtn from '../cmps/download-btn.vue'
import { utilService } from '../services/util.service';

export default {
  name: 'home',
  data() {
    return {
    }
  },
  computed: {
    IsPwa() {
      return utilService.isRunningAsPWA()
    },
    loggedInUser() {
      return this.$store.getters.loggedinUser
    },
  },
  created() {
  },
  methods: {
  },
  components: {
    downloadBtn
  }

}
</script>
