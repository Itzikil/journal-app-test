<template>
  <button @click="downloadPWA">Download APP</button>
</template>

<script>
export default {
  methods: {
    downloadPWA() {
      let modalMessage = '';
      let modalImage = '';

      if (window.navigator && window.navigator.userAgent.match(/Mobile/)) {
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari) {
          modalMessage = 'Please tap the Share button below and then select "Add to Home Screen" to download the App.';
          modalImage = 'safari';
        } else {
          modalMessage = 'Please use your browser\'s options menu to "Add to Home Screen" to download the App.';
          modalImage = 'desktop';
        }
      } else {
        modalMessage = 'Please use your browser\'s options menu to "Install" or "Add to Home Screen" to download the App.';
        modalImage = 'desktop';
      }

      this.$emit('open-modal', { message: modalMessage, image: modalImage });
    }
  }
};
</script>
