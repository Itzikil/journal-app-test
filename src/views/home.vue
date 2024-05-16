<template>
  <section class="container home text-center">
    <h1>Work Journal</h1>
    <h2 class="text-center">Orgnaize your work </h2>
    <img alt="Vue logo" src="../../public/pwa-192x192.png">
    <p>Download the app</p>
    <p>Signup</p>
    <p>Add students</p>
    <p>Organize your schedule</p>
    <downloadBtn />
  </section>


</template>

<script>
import downloadBtn from '../cmps/download-btn.vue'
export default {
  name: 'home',
  data() {
    return {
    }
  },
  computed: {
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
