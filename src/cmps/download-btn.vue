<template>
    <div>
      <!-- Your other Vue.js components and UI elements -->
      <button v-if="showInstallButton" @click="installPWA">Install PWA</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        deferredPrompt: null,
        showInstallButton: false
      };
    },
    mounted() {
      window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
    },
    beforeUnmount() {
      window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
    },
    methods: {
      handleBeforeInstallPrompt(event) {
        event.preventDefault();
        this.deferredPrompt = event;
        this.showInstallButton = true;
      },
      installPWA() {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          this.deferredPrompt.userChoice
            .then(choiceResult => {
              if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the PWA installation');
              } else {
                console.log('User dismissed the PWA installation');
              }
              this.deferredPrompt = null;
            });
        }
      }
    }
  };
  </script>
  