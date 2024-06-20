<template>
  <section class="main-page" v-if="!loading">
    <!-- <PullToRefresh v-if="runningAsPwa"> -->
    <user-msg />
    <app-header />
    <router-view />
    <!-- </PullToRefresh> -->
  </section>
  <section v-else>
    <h2 class="text-center">Loading</h2>
  </section>
</template>

<script>
import { store } from './store/store'
import appHeader from './cmps/app-header.vue'
import userMsg from './cmps/user-msg.vue'
import { userService } from './services/user.service'
import PullToRefresh from './cmps/PullToRefresh.vue';

export default {
  data() {
    return {
      loading: true
    }
  },
  async created() {
    const user = await userService.getLoggedinUser()
    if (user) await store.commit({ type: 'setLoggedinUser', user })
    await this.$store.dispatch({ type: "loadStudents" });
    this.loading = false
  },
  components: {
    appHeader,
    userMsg,
    PullToRefresh
  },
}
</script>