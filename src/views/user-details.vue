<template>
  <section v-if="user" class="user-detail-container container">
    <div class="user-details">
      <div>
        <h2>User Details - {{ user.fullname }}</h2>
        <button @click="doLogout">Logout</button>
      </div>
      <img :src="user.imgUrl" alt="user" />
    </div>
    <div class="monthly-income">
      <div>
        <button @click="prevMonth">&lt</button>
        <p>Earning</p>
        <p>₪ {{ totalMonthEarn().paid }}</p>
      </div>
      <p> {{ monthNames[currentMonth] }} </p>
      <div>
        <button @click="nextMonth">></button>
        <p>Unpaid</p>
        <p>₪ {{ totalMonthEarn().arrived }}</p>
      </div>
    </div>
    <div class="total">
      <p>Total monthly earn </p>
      <p>₪ {{ totalMonthEarn().arrived + totalMonthEarn().paid }}</p>
    </div>
    <div class="students-list">
      <h3>Students</h3>
      <ul >
        <li v-for="student in students" :key="student._id">
          <button @click="openStudentDetails(student)">{{ student.name }}</button>
          <router-link :to="`/student/${student._id}`"></router-link>
        </li>
      </ul>
    </div>
    <div class="student-info">
      <ul v-if="currStudent">
        <li>
          <router-link :to="`/student/${currStudent._id}`">{{ currStudent.name }}</router-link>
          <p>{{ currStudent.classes.length }} classes overall</p>
          <p>{{ classesInMonth(currStudent).length }} classes this month</p>
          <p>{{ paidThisMonth(currStudent).length }} classes paid this month (₪{{ paidThisMonth(currStudent).length *
    currStudent.price }})
          </p>
          <p>{{ arrivedThisMonth(currStudent).length }} classes unpaid this month (₪{{
    arrivedThisMonth(currStudent).length * currStudent.price }})</p>
        </li>
      </ul>
    </div>
    <statistic class="stats" :months="months" />
    <div class="some">
      <p>Total earning this month ₪{{ totalMonthEarn().paid }} from ₪{{ totalMonthEarn().arrived + totalMonthEarn().paid
        }}
      </p>
    </div>
  </section>
</template>

<script>
// import {userService} from '../services/user.service'
import statistic from '../cmps/statistic.vue';

export default {
  data() {
    return {
      currStudent: null,
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    }
  },
  async created() {
    this.$store.dispatch({ type: "getStudentByTeacher", teacherId: this.userId });
    this.currStudent = this.students[0]
    // const user = await userService.getById(id)
    // this.user = user
  },
  watch: {
    userId: {
      handler() {
        if (this.userId) {
          this.$store.dispatch({ type: "loadAndWatchUser", userId: this.userId })
        }
      },
      immediate: true,
    },
  },
  computed: {
    user() {
      return this.$store.getters.watchedUser
    },
    userId() {
      return this.$route.params.id
    },
    students() {
      return this.$store.getters.students;
    },
    months() {
      var stats = []
      var month
      for (let i = 0; i < 4; i++) {
        month = this.currentMonth - i
        if (month < 0) {
          month = 12 + (this.currentMonth - i)
        }
        stats.unshift({
          name: this.monthNames[month].slice(0, 3),
          earning: this.monthlySum(`${month + 1}.${this.currentYear}`)
        }
        )
      }
      return stats
    }
  },
  methods: {
    prevMonth() {
      this.currentMonth -= 1;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear -= 1;
      }
    },
    nextMonth() {
      this.currentMonth += 1;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear += 1;
      }
    },
    classesInMonth(student, selectedDate) {
      var date = selectedDate || `${this.currentMonth + 1}.${this.currentYear}`
      // console.log(`${student.classes[0].date.split(".")[1]}.${student.classes[0].date.split(".")[2]}`);
      // console.log(`${month + 1}.${this.currentYear}`);
      return student.classes.filter(lesson => `${lesson.date.split(".")[1]}.${lesson.date.split(".")[2]}` === date)
    },
    paidThisMonth(student, selectedDate) {
      return this.classesInMonth(student, selectedDate).filter(lesson => lesson.status === 'paid')
    },
    arrivedThisMonth(student, selectedDate) {
      return this.classesInMonth(student, selectedDate).filter(lesson => lesson.status === 'arrived')
    },
    openStudentDetails(student) {
      this.currStudent = student
    },
    totalMonthEarn(selectedDate) {
      return this.students.reduce((acc, student) => {
        acc.arrived += this.arrivedThisMonth(student, selectedDate).length * student.price;
        acc.paid += this.paidThisMonth(student, selectedDate).length * student.price;
        return acc;
      }, { arrived: 0, paid: 0 });
    },
    monthlySum(selectedDate) {
      var sum = this.totalMonthEarn(selectedDate)
      return sum.arrived + sum.paid
    },
    doLogout() {
      this.$store.dispatch({ type: 'logout' })
    },

  },
  components: {
    statistic
  }
}
</script>