<template>
  <header>
    <nav>
      <router-link :to="`/user/${loggedInUser._id}`" class="loggedin-user" v-if="loggedInUser">
        <img :src="loggedInUser.imgUrl" alt="user image" />
        <p>{{ loggedInUser.username }}</p>
      </router-link>
      <router-link v-if="!loggedInUser" to="/login" class="loggedin-user">
        <div :class="['a-container', { active: $route.path === '/about' }]">
          <img src="../assets/imgs/header/login.svg" alt="login">
        </div>
      </router-link>
      <!-- <router-link to="/">
        <span role="img" aria-label="logo">Home</span>
      </router-link> -->
      <router-link v-if="loggedInUser" to="/today" class="link-container upper-curve">
        <div :class="['a-container', { active: $route.path === '/today' }]">
          <img :src=dayPic alt="day">
          <p>Today</p>
        </div>
      </router-link>
      <router-link v-if="loggedInUser" to="/journal" class="link-container">
        <div :class="['a-container', { active: $route.path === '/journal' }]">
          <img src="../assets/imgs/header/calendar.svg" alt="calendar">
          <p>Journal</p>
        </div>
      </router-link>
      <router-link v-if="loggedInUser" to="/students" class="link-container lower-curve">
        <div :class="['a-container', { active: $route.path === '/students' }]">
          <img src="../assets/imgs/header/students.svg" alt="students">
          <p>Students</p>
        </div>
      </router-link>
      <router-link v-if="loggedInUser" to="/dashboard" class="link-container lower-curve">
        <div :class="['a-container', { active: $route.path === '/dashboard' }]">
          <img src="../assets/imgs/header/dashboard.svg" alt="dashboard">
          <p>Dashboard</p>
        </div>
      </router-link>
      <!-- <router-link to="/review">Reviews</router-link> -->
      <!-- <router-link to="/chat">Chat</router-link> -->
      <!-- <router-link to="/about" class="link-container">
        <div :class="['a-container', {active: $route.path === '/about'}]">
          <img src="../assets/imgs/header/about.svg" alt="">
          <p>About</p>
        </div>
      </router-link> -->
    </nav>
  </header>
</template>
<script>
import Sunday from '@/assets/imgs/header/day-0.svg'
import Monday from '@/assets/imgs/header/day-1.svg'
import Tuesday from '@/assets/imgs/header/day-2.svg'
import Wednesday from '@/assets/imgs/header/day-3.svg'
import Thursday from '@/assets/imgs/header/day-4.svg'
import Friday from '@/assets/imgs/header/day-5.svg'
import Saturday from '@/assets/imgs/header/day-6.svg'

export default {
  computed: {
    loggedInUser() {
      return this.$store.getters.loggedinUser
    },
    dayPic() {
      var days = [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]
      return days[new Date().getDay()]
    },
  },
  methods: {
  }
}
</script>