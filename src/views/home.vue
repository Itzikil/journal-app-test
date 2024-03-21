<template>
  <section class="container home text-center">
    <h1>Work Journal</h1>
    <h2 class="text-center">Orgnaize your work </h2>
    <img alt="Vue logo" src="../assets/logo.png">
    <downloadBtn />
    <button @click="openWhatsApp()">Open WhatsApp</button>

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
    openWhatsApp() {
      // Replace '1234567890' with the phone number of the contact you want to open in WhatsApp
      var phoneNumber = '0543060864';

      // You can also include a message to be sent along with the WhatsApp message
      var message = 'Hello from my app!';

      // Construct the WhatsApp URL with the phone number and optional message
      var whatsappUrl = 'https://api.whatsapp.com/send?phone=' + phoneNumber + '&text=' + encodeURIComponent(message);

      // Open WhatsApp in a new window or tab
      window.open(whatsappUrl);
    }
  },
  components: {
    downloadBtn
  }

}
</script>
