<template>
  <section class="user-detail-container container">
    <div>
      <p>Edit your whatsapp message</p>
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
    }
  },
  async created() {
    try {
      const userId = this.$store.getters.loggedinUser?._id;
      if (userId) {
        console.log(`Fetching user with ID: ${userId}`);
        this.user = await this.$store.dispatch({ type: 'loadAndWatchUser', userId });
        console.log(this.user);
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