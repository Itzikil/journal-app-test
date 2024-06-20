<template>
  <section class="user-detail-container container">
    <div v-if="user">
      <p @click="togglePref('info')">Your info</p>
      <div class="content" :class="{ active: openPref === 'info' }">
        <p>{{ user.username }}</p>
        <img :src="user.imgUrl" alt="your img" style="height: 100px; border-radius: 5px;">
      </div>
    </div>
    <div>
      <p @click="togglePref('msg')">Edit your whatsapp message</p>
      <!-- <transition name="expand"> -->
      <div class="content" :class="{ active: openPref === 'msg' }">
        <form @submit.prevent="updateMessage()">
          <input type="text" placeholder="Add your text" v-model="firstLine">
          <p>(Number of lessons)</p>
          <input type="text" placeholder="Add your text" v-model="secondLine">
          <p>(sum the price)</p>
          <input type="text" placeholder="Add your text" v-model="thirdLine">
          <button>Update</button>
        </form>
        <p>{{ fullMessage }}</p>
      </div>
      <!-- </transition> -->
    </div>
    <div>
      <p @click="togglePref('hours')">Work hours</p>
      <transition name="expand">
        <!-- <div v-if="openPref === 'hours'" class="content" :class="{active: openPref === 'hours'}"> -->
        <div class="content" :class="{ active: openPref === 'hours' }">
          <form @submit.prevent="updateHours()">
            <p>choose the hours in a day you want to work</p>
            <input type="number" placeholder="from" v-model="this.from">
            <input type="number" placeholder="to" v-model="this.to" >
            <button>Update</button>
          </form>
        </div>
      </transition>
    </div>
    <div>
      <p @click="togglePref('days')">Work days</p>
      <transition name="expand" :class="{ active: openPref === 'days' }">
        <div class="content">
          <p>choose the days in a week you want to work</p>
          <input type="text" placeholder="from">
          <input type="text" placeholder="to">
        </div>
      </transition>
    </div>
  </section>
</template>

<script>
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service';
import { utilService } from '../services/util.service';

export default {
  data() {
    return {
      firstLine: '',
      secondLine: '',
      thirdLine: '',
      user: null,
      openPref: '',
      from:'',
      to:'',
    }
  },
  async created() {
    try {
      const userId = this.$store.getters.loggedinUser?._id;
      if (userId) {
        this.user = await this.$store.dispatch({ type: 'loadAndWatchUser', userId });
        if (this.user && this.user.pref && this.user.pref.msg) {
          this.firstLine = this.user.pref.msg[0] || '';
          this.secondLine = this.user.pref.msg[1] || '';
          this.thirdLine = this.user.pref.msg[2] || '';
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  },
  computed: {
    fullMessage() {
      return `${this.firstLine} 3 ${this.secondLine} 300 ${this.thirdLine}`
    }
  },
  methods: {
    async updateUser(user) {
      try {
        console.log(user);
        await this.$store.dispatch({ type: "updateUser", user });
        showSuccessMsg("User msg added");
      } catch (err) {
        console.log(err);
        showErrorMsg("Cannot add User msg");
      }
    },
    updateMessage() {
      var currUser = utilService.deepClone(this.user)
      if (!currUser.pref) currUser.pref = {}
      currUser.pref.msg = []
      currUser.pref.msg = [this.firstLine, this.secondLine, this.thirdLine]
      this.updateUser(currUser)
    },
    updateHours() {
      var currUser = utilService.deepClone(this.user)
      if (!currUser.pref) currUser.pref = {}
      if (!currUser.pref.hours) currUser.pref.hours = {}
      currUser.pref.hours.from = this.from
      currUser.pref.hours.to = this.to
      this.updateUser(currUser)
    },
    togglePref(name) {
      this.openPref = this.openPref === name ? null : name;
    }
  },
  components: {
  }
}
</script>

<style>
.content {
  max-height: 0px;
  transition: 1s;
  overflow: hidden;
}

.active {
  max-height: 250px;
}
</style>