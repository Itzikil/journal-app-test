<template>
  <section class="main-page">
    <!-- <PullToRefresh v-if="runningAsPwa"> -->
      <user-msg />
      <app-header />
      <router-view />
    <!-- </PullToRefresh> -->
  </section>
</template>

<script>
import { store } from './store/store'
import appHeader from './cmps/app-header.vue'
import userMsg from './cmps/user-msg.vue'
import { userService } from './services/user.service'
import PullToRefresh from './cmps/PullToRefresh.vue';
import { utilService } from './services/util.service';

export default {
  async created() {
    const user = await userService.getLoggedinUser()
    if (user) store.commit({ type: 'setLoggedinUser', user })
  },
  components: {
    appHeader,
    userMsg,
    PullToRefresh
  },
}
</script>