<template>
  <transition name="switch" mode="out-in">
    <section v-if="!showTable" class="dashboard-container container">
      <div class="user-details">
        <div class="user-details-container">
          <h2>Dashboard</h2>
          <!-- <p class="fs20">{{ user.fullname }}</p> -->
          <button @click="doLogout">Logout</button>
        </div>
        <img :src="user.imgUrl" alt="user" />
      </div>
      <div class="monthly-income-container">
        <div class="monthly-income">
          <div>
            <button @click="prevMonth"><img src="../assets/imgs/left-arrow.svg" alt="left arrow"></button>
            <p><span class="fs12">₪</span>{{ totalMonthEarn().paid.toLocaleString() }}</p>
            <p class="normal-font">Earning</p>
          </div>
          <p class="month-name"> {{ monthNames[currentMonth] }} </p>
          <div>
            <button @click="nextMonth"><img src="../assets/imgs/right-arrow.svg" alt="right arrow"></button>
            <p><span class="fs12">₪</span>{{ totalMonthEarn().arrived.toLocaleString() }}</p>
            <p class="normal-font">Unpaid</p>
          </div>
        </div>
        <div class="stat">
          <div class="stat-fill" :style="{ width: `${fillColor() * 100}%` }"></div>
        </div>
      </div>
      <div class="total">
        <p class="text-center fs20">{{ currentYear }}</p>
        <p><span class="fs12">₪</span>{{ (totalMonthEarn().arrived + totalMonthEarn().paid).toLocaleString() }}</p>
        <p class="normal-font">Total monthly earn </p>
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
            <p class="bold-font">{{ paidThisMonth(currStudent).length }}
              <span class="normal-font">classes paid this month</span>
              <span class="fs12"> ₪</span>{{ sumPaidThisMonth(currStudent) }}
            </p>
            <p class="bold-font">{{ arrivedThisMonth(currStudent).length }}
              <span class="normal-font"> classes unpaid this month</span>
              <span class="fs12"> ₪</span>{{ sumArrivedThisMonth(currStudent) }}
            </p>
            <button @click="openWhatsApp(currStudent)">Send bill with whatsapp</button>
            <invoice :student="currStudent" :classesAmount="paidThisMonth(currStudent).length"
              :classesSum="sumPaidThisMonth(currStudent)" />
          </li>
        </ul>
      </div>
      <div class="stats">
        <h3>statistics</h3>
        <button @click="showTable = true">For more deep stats -></button>
        <statistic :fourMonths="fourMonths" style="height: 130px; width: 100px;" />
      </div>
      <div class="some">
        <h4>Didnt pay yet</h4>
        <div v-for="student in students">
          <div v-if="arrivedThisMonth(student).length" class="flex justify-space">
            <p class="normal-font">{{ student.name }}</p>
            <p class="bold-font">{{ arrivedThisMonth(student).length }}</p>
          </div>
          <!-- <p v-else>Everyone paid this month</p> -->
        </div>
      </div>
    </section>
    <section v-else class="charts-stats-container ">
      <div>
        <button @click="showTable = false">Back to dashboard</button>
        <monthTable :fourMonths="fourMonths" :chartData="chartData" />
      </div>
      <div>
        <h3>statistics</h3>
        <div style="padding: 15px;">
          <statistic class="stats" :fourMonths="fourMonths" />
        </div>
      </div>
    </section>
  </transition>
</template>

<script>
import statistic from '../cmps/statistic.vue';
import invoice from '../cmps/invoice.vue';
import monthTable from '../cmps/monthTable.vue';

export default {
  data() {
    return {
      currStudent: null,
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      fullUser: null,
      showTable: false,
    }
  },
  async created() {
    await this.$store.dispatch({ type: "loadStudents" });
    this.currStudent = this.students[0]
    const userId = this.$store.getters.loggedinUser?._id;
    if (userId) this.fullUser = await this.$store.dispatch({ type: 'loadAndWatchUser', userId })
  },
  computed: {
    user() {
      return this.$store.getters.loggedinUser
    },
    students() {
      return this.$store.getters.students;
    },
    fourMonths() {
      var stats = []
      var month
      for (let i = 0; i < 4; i++) {
        month = this.currentMonth - i
        if (month < 0) {
          month = 12 + (this.currentMonth - i)
        }
        stats.unshift({
          name: this.monthNames[month].slice(0, 3),
          number: month + 1,
          earning: this.monthlySum(`${month + 1}`)
        }
        )
      }
      return stats
    },
    chartData() {
      return {
        sumPaidThisMonth: this.sumPaidThisMonth,
        sumArrivedThisMonth: this.sumArrivedThisMonth,
        classesInMonth: this.classesInMonth,
        monthlySum: this.monthlySum,
        prevMonth: this.prevMonth,
        nextMonth: this.nextMonth,
        changeMonth: this.changeMonth,
        currentYear: this.currentYear,
        currentMonth: this.currentMonth,
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      }
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
      var date = selectedDate ? `${selectedDate}.${this.currentYear}` : `${this.currentMonth + 1}.${this.currentYear}`
      return student.classes.filter(lesson => `${lesson.date.split(".")[1]}.${lesson.date.split(".")[2]}` === date)
    },
    sumPaidThisMonth(student, selectedDate) {
      return this.paidThisMonth(student, selectedDate).reduce((acc, lesson) => acc + lesson.price, 0)
    },
    sumArrivedThisMonth(student, selectedDate) {
      return this.arrivedThisMonth(student, selectedDate).reduce((acc, lesson) => acc + lesson.price, 0)
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
        acc.arrived += this.arrivedThisMonth(student, selectedDate).reduce((acc, lesson) => acc + lesson?.price, 0)
        acc.paid += this.paidThisMonth(student, selectedDate).reduce((acc, lesson) => acc + lesson?.price, 0)
        return acc;
      }, { arrived: 0, paid: 0 });
    },
    monthlySum(selectedDate) {
      var sum = this.totalMonthEarn(selectedDate)
      return sum.arrived + sum.paid
    },
    changeMonth(month) {
      this.currentMonth = month
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
    openWhatsApp(student) {
      var phoneNumber = this.formatPhoneNumber(student.phone || '0543060864')
      let userPref = this.fullUser.pref
      if (userPref.msg[0] || userPref.msg[1] || userPref.msg[2]) {
        var message = `${userPref.msg[0]} ${this.arrivedThisMonth(student).length} ${userPref.msg[1]} ${this.sumArrivedThisMonth(student)} ${userPref.msg[2]}`
      }
      else var message = `We had ${this.arrivedThisMonth(student).length} lessons this ${this.monthNames[this.currentMonth]} in sum of ₪${this.sumArrivedThisMonth(student)}`;
      console.log(message);
      var isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      var urlStart = isMobileDevice ? 'https://api.whatsapp.com/send?phone=' : 'https://web.whatsapp.com/send?phone='
      var whatsappUrl = urlStart + phoneNumber + '&text=' + encodeURIComponent(message);
      window.open(whatsappUrl);
    },
    formatPhoneNumber(phoneNumber, countryCode) {
      var countryCode = '+972'
      // Remove any non-digit characters from the phone number
      phoneNumber = phoneNumber.replace(/\D/g, '');
      if (phoneNumber.startsWith('0')) {
        phoneNumber = countryCode + phoneNumber.slice(1);
      }
      return phoneNumber;
    }
  },
  components: {
    statistic,
    invoice,
    monthTable
  }
}
</script>

<style>
.switch-enter-from,
.switch-leave-to {
  opacity: 0;
  transform: translateX(500px);
}

.switch-leave-to {
  transform: translateX(-500px);
}

.switch-enter-to,
.switch-leave-from {
  opacity: 1;
  transform: translateX(0px);
}

.switch-leave-active {
  transition: all 0.5s ease
}

.switch-enter-active {
  transition: all 0.5s ease
}
</style>