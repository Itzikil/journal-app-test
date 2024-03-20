<template>
    <div>
      <button @click="downloadPWA">Download PWA</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      downloadPWA() {
        if (window.navigator && window.navigator.userAgent.match(/Mobile/)) {
          // Check if the user is on a mobile device
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          if (isSafari) {
            // For Safari on iOS
            alert('Please tap the Share button below and then select "Add to Home Screen" to download the PWA.');
          } else {
            // For other mobile browsers
            alert('Please use your browser\'s options menu to "Add to Home Screen" to download the PWA.');
          }
        } else {
          alert('Please use your browser\'s options menu to "Install" or "Add to Home Screen" to download the PWA.');
        }
      }
    }
  };
  </script>
  