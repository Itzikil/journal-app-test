<template>
  <PullToRefresh @refresh="handleRefresh">
    <section class="main-page">
      <user-msg />
      <app-header />
      <router-view />
    </section>
  </PullToRefresh>
</template>

<script>
import { store } from './store/store'
import appHeader from './cmps/app-header.vue'
import userMsg from './cmps/user-msg.vue'
import { userService } from './services/user.service'
import PullToRefresh from './cmps/PullToRefresh.vue';
export default {
  async created() {
    const user = await userService.getLoggedinUser()
    if (user) store.commit({ type: 'setLoggedinUser', user })
  },
  methods: {
    handleRefresh() {
      console.log('Refreshing...');
      // Handle the refresh logic here, e.g., fetching data or reloading the page
      this.refreshContent();
    },
    refreshContent() {
      // Replace this with your data fetching logic if needed
      window.location.reload();
    },
  },
  components: {
    appHeader,
    userMsg,
    PullToRefresh
  },
}
</script>