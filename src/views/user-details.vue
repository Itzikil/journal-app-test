<template>
  <section class="user-detail-container container">
    <div>
      <p @click="openPref = 'msg'">Edit your whatsapp message</p>
      <div v-if="openPref">
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
    </div>
    <div>
      <p>Work hours</p>
    </div>
    <div>
      <p>Work days</p>
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
      currUser.pref = {}
      currUser.pref.msg = []
      currUser.pref.msg = [this.firstLine, this.secondLine, this.thirdLine]
      this.updateUser(currUser)
    }
  },
  components: {
  }
}
</script>