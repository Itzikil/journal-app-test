<template>
  <section class="container about login-container">
    <p>{{ msg }}</p>
    <div v-if="loggedinUser">
      <h3>
        Loggedin User:
        {{ loggedinUser.fullname }}
        <button @click="doLogout">Logout</button>
      </h3>
    </div>
    <div v-else class="login-signup">
      <h2>Login</h2>
      <form @submit.prevent="doLogin">
        <select v-model="loginCred.username" >
        <!-- <option value="">Select User</option> -->
          <option v-for="user in users" :key="user._id" :value="user.username">{{ user.fullname }}</option>
        </select>
        <!-- <input type="text" v-model="loginCred.username" placeholder="User name" />
        <input
          type="text"
          v-model="loginCred.password"
          placeholder="Password"
        /> -->
        <button>Login</button>
      </form>
      <form @submit.prevent="doSignup">
        <h2>Signup</h2>
        <input type="text" v-model="signupCred.fullname" placeholder="Your full name" />
        <input type="text" v-model="signupCred.password" placeholder="Password" />
        <input type="text" v-model="signupCred.username" placeholder="Username" />
        <!-- <img-uploader @uploaded="onUploaded"></img-uploader> -->
        <button>Signup</button>
      </form>
    </div>
    <details>
      <summary>
        Admin Section
      </summary>
      <ul class="admin-only">
        <li v-for="user in users" :key="user._id">
          <p>username: {{ user.username }}</p>
          <p>password: {{ user.password }}</p>
          <p>id: {{ user._id }}</p>
          <button @click="removeUser(user._id)">Remove</button>
        </li>
      </ul>
    </details>
  </section>
</template>

<script>

import imgUploader from '../cmps/img-uploader.vue'

export default {
  name: 'login-signup',
  data() {
    return {
      msg: '',
      loginCred: { username: 'user1', password: '123' },
      signupCred: { username: '', password: '', fullname: '', imgUrl: '' },
    }
  },
  computed: {
    users() {
      return this.$store.getters.users
    },
    loggedinUser() {
      return this.$store.getters.loggedinUser
    },
  },
  created() {
    this.loadUsers()
  },
  methods: {
    async doLogin() {
      if (!this.loginCred.username) {
        this.msg = 'Please enter username/password'
        return
      }
      try {
        await this.$store.dispatch({ type: "login", userCred: this.loginCred })
        this.$router.push('/')
      } catch (err) {
        console.log(err)
        this.msg = 'Failed to login'
      }
    },
    doLogout() {
      this.$store.dispatch({ type: 'logout' })
    },
    async doSignup() {
      if (!this.signupCred.fullname || !this.signupCred.password || !this.signupCred.username) {
        this.msg = 'Please fill up the form'
        return
      }
      await this.$store.dispatch({ type: 'signup', userCred: this.signupCred })
      this.$router.push('/')

    },
    loadUsers() {
      this.$store.dispatch({ type: "loadUsers" })
    },
    async removeUser(userId) {
      try {
        await this.$store.dispatch({ type: "removeUser", userId })
        this.msg = 'User removed'
      } catch (err) {
        this.msg = 'Failed to remove user'
      }
    },
    onUploaded(imgUrl) {
      this.signupCred.imgUrl = imgUrl
    }

  },
  components: {
    imgUploader
  }
}
</script>