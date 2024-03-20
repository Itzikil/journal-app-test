<template>
  <section class="container home text-center">
    <h1>I & M</h1>
    <h5 class="text-center">
      Powered up Frontend 
    </h5>
    <img alt="Vue logo" src="../assets/logo.png">
    <downloadBtn/>
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
  components:{
    downloadBtn
  }
  
}
</script>
