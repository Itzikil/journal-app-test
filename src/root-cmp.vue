<template>
  <section class="main-page">
      <PullToRefresh @refresh="handleRefresh">
      <user-msg />
      <app-header />
      <router-view />
    </PullToRefresh>
    </section>
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