<template>
  <section v-if="user" class="user-detail-container container">
    <div class="user-details">
      <div>
        <h2>User Details - {{ user.fullname }}</h2>
        <button @click="doLogout">Logout</button>
      </div>
      <img :src="user.imgUrl" alt="user" />
    </div>
    <div class="monthly-income-container">
      <div class="monthly-income">
        <div>
          <!-- <button @click="prevMonth">&lt</button> -->
          <button @click="prevMonth"><img src="../assets/imgs/left-arrow.svg" alt="left arrow"></button>
          <p>Earning</p>
          <p>₪ {{ totalMonthEarn().paid.toLocaleString() }}</p>
        </div>
        <p class="month-name"> {{ monthNames[currentMonth] }} </p>
        <div>
          <button @click="nextMonth"><img src="../assets/imgs/right-arrow.svg" alt="right arrow"></button>
          <p>Unpaid</p>
          <p>₪ {{ totalMonthEarn().arrived.toLocaleString() }}</p>
        </div>
      </div>
      <div class="stat">
        <div class="stat-fill" :style="{ width: `${fillColor() * 100}%` }"></div>
      </div>
    </div>
    <div class="total">
      <p>{{ currentYear }}</p>
      <p>Total monthly earn </p>
      <p>₪ {{ (totalMonthEarn().arrived + totalMonthEarn().paid).toLocaleString() }}</p>
    </div>
    <div class="students-list">
      <h3>Students</h3>
      <ul>
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
          <!-- <p>{{ currStudent.classes.length }} classes overall</p> -->
          <!-- <p>{{ classesInMonth(currStudent).length }} classes this month</p> -->
          <p>{{ paidThisMonth(currStudent).length }} classes paid this month
            - ₪{{ paidThisMonth(currStudent).length * currStudent.price }}</p>
          <p>{{ arrivedThisMonth(currStudent).length }} classes unpaid this month
            - ₪{{ arrivedThisMonth(currStudent).length * currStudent.price }}</p>
          <!-- <div class="lessons-imgs">
            <div v-for="lesson in classesInMonth(currStudent)" :key="lesson.date">
              <img :src="`src/assets/imgs/${lesson.status}.svg`" alt="">
            </div>
          </div> -->
          <button @click="openWhatsApp(currStudent, '+972543060864')">'+972543060864'</button>
        </li>
      </ul>
    </div>
    <statistic class="stats" :months="months" />
    <div class="some">
      <h4>Didnt pay yet</h4>
      <div v-for="student in students">
        <div v-if="arrivedThisMonth(student).length" class="flex justify-space">
          <p>{{ student.name }}</p>
          <p>{{ arrivedThisMonth(student).length }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
// import {userService} from '../services/user.service'
import statistic from '../cmps/statistic.vue';

export default {
  data() {
    return {
      hevriz: '../assets/imgs/hevriz.svg',
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
    fillColor() {
      var full = this.monthlySum()
      var paid = this.totalMonthEarn().paid
      if (full === 0 && paid === 0) return 0
      return paid / full
    },
    doLogout() {
      this.$store.dispatch({ type: 'logout' })
      this.$router.push('/')
    },
    openWhatsApp(student , num) {
      var phoneNumber = student.phone || num;
      // var phoneNumber = student.phone || '+97254-306-0864';
      console.log(phoneNumber);
      var unpaid = this.arrivedThisMonth(student).length
      var message = `We had ${unpaid} lessons this ${this.monthNames[this.currentMonth]} in sum of ₪${unpaid * student.price}`;
      console.log(message);
      var whatsappUrl = 'https://api.whatsapp.com/send?phone=' + phoneNumber + '&text=' + encodeURIComponent(message);
      window.open(whatsappUrl);
    }
  },
  components: {
    statistic
  }
}
</script>