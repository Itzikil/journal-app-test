<template>
  <transition name="switch" mode="out-in">
    <section v-if="!showTable" class="dashboard-container container">
      <div class="user-details">
        <div class="user-details-container">
          <h2>Dashboard</h2>
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
        <!-- <p><span class="fs12">₪</span>{{ (totalMonthEarn().arrived + totalMonthEarn().paid).toLocaleString() }}</p> -->
        <p><span class="fs12">₪</span>{{ monthlySum().toLocaleString() }}</p>
        <p class="normal-font">Total monthly earn </p>
        <p class="fs10"><span class="fs8">₪</span>{{ monthlyMax }}</p>
        <p class="fs12">Max Revenue</p>
      </div>

      <div class="students-list">
        <h3>Students <span class="fs14">({{ studentsByMonth.length }})</span></h3>
        <ul>
          <li v-for="student in studentsByMonth" :key="student._id">
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
        <p v-else>Choose student</p>
      </div>

      <div class="stats">
        <h3>statistics</h3>
        <button @click="showTable = true">For more deep stats -></button>
        <statistic :fourMonths="fourMonths" style="height: 130px; width: 100px;" />
      </div>

      <div class="some">
        <h4>Didnt pay yet</h4>
        <ul>
          <li v-if="students.every(student => !arrivedThisMonth(student).length)">
            <p class="fs14">Everyone paid this month</p>
          </li>
          <li v-for="student in students.filter(s => arrivedThisMonth(s).length)" :key="student.id">
            <div class="flex justify-space">
              <div class="flex">
                <button @click.stop="updateMonthlyLessons(student)" class="arrival-btn">
                  <img src="../assets/imgs/paid.svg" alt="paid">
                </button>
                <p class="normal-font">{{ student.name }}</p>
              </div>
              <p class="bold-font">{{ arrivedThisMonth(student).length }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section v-else class="charts-stats-container ">
      <div>
        <button @click="showTable = false">Back to dashboard</button>
        <monthTable :fourMonths="fourMonths" :chartData="chartData" />
      </div>
      <div>
        <h3>statistics</h3>
        <div style="padding: 15px; margin-bottom: 10px;">
          <statistic class="stats" :fourMonths="fourMonths" />
        </div>
      </div>
      <div style="padding: 15px; margin-bottom: 20px;">
        <h3>Deep statistic</h3>
        <div>
          <deepStatistic :chartData="chartData" />
        </div>
      </div>
    </section>
  </transition>
</template>

<script>
import statistic from '../cmps/statistic.vue';
import deepStatistic from '../cmps/deep-statistics.vue';
import invoice from '../cmps/invoice.vue';
import monthTable from '../cmps/monthTable.vue';
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service';
import { utilService } from '../services/util.service';

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
    // this.currStudent = this.students[0]
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
    studentsByMonth() {
      const lastDayOfMonth = `${new Date(this.currentYear, this.currentMonth + 1, 0).getDate()}.${this.currentMonth + 1}.${this.currentYear}`;
      return this.students.filter(student => {
        const firstLesson = student.lessonsInfo[0];
        if (firstLesson && utilService.biggerDate(firstLesson.start, lastDayOfMonth)) {
          return true;
        }
        return student.classes.some(lesson =>
          utilService.extractDatePart(lesson.date, 'month.year') === `${this.currentMonth + 1}.${this.currentYear}`
        );
      });
    },
    fourMonths() {
      var stats = []
      var month
      var year = this.currentYear
      for (let i = 0; i < 4; i++) {
        month = this.currentMonth - i
        if (month < 0) {
          month = 12 + (this.currentMonth - i)
          year = this.currentYear - 1
        }
        stats.unshift({
          name: this.monthNames[month].slice(0, 3),
          number: month + 1,
          year: year,
          earning: this.monthlySum(`${month + 1}.${year}`)
        })
      }
      return stats
    },
    monthlyMax() {
      return this.studentsByMonth.reduce((sum, student) => {
        if (student.lessonsInfo.length) {
          const studentRevenue = student.lessonsInfo.reduce((acc, lesson) => {
            const lessonDays = utilService.getWeekdayCountInMonth(
              this.currentYear,
              this.currentMonth,
              lesson.day
            );
            return acc + (lessonDays * lesson.price);
          }, 0);
          return sum + studentRevenue;
        } else {
          const classRevenue = student.classes.filter(cls => {
            const classMonth = utilService.extractDatePart(cls.date, 'month');
            const classYear = utilService.extractDatePart(cls.date, 'year');
            return classMonth === this.currentMonth + 1 && classYear === this.currentYear;
          }).reduce((acc, cls) => acc + cls.price, 0); // Sum up the price of each class
          return sum + classRevenue;
        }
      }, 0);
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
        monthlyMax: this.monthlyMax,
        studentsByMonth: this.studentsByMonth,
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
    classesInMonth(student, selectedDate, notHevriz) {
      var date
      if (/^\d{1,2}\.\d{4}$/.test(selectedDate)) {
        date = selectedDate
      }
      else {
        date = `${selectedDate || this.currentMonth + 1}.${this.currentYear}`
      }
      if (notHevriz) {
        return student.classes.filter(lesson => utilService.extractDatePart(lesson.date, 'month.year') === date && lesson.status !== 'hevriz')
      }
      else return student.classes.filter(lesson => utilService.extractDatePart(lesson.date, 'month.year') === date)
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
      this.currentMonth = month.number - 1
      this.currentYear = month.year
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
      var phoneNumber = this.formatPhoneNumber(student.phone || '0543060864');
      let userPref = this.fullUser.pref;

      var message = userPref.msg[0] || userPref.msg[1] || userPref.msg[2]
        ? `${userPref.msg[0]} ${this.arrivedThisMonth(student).length} ${userPref.msg[1]} ${this.sumArrivedThisMonth(student)} ${userPref.msg[2]}`
        : `We had ${this.arrivedThisMonth(student).length} lessons this ${this.monthNames[this.currentMonth]} in sum of ₪${this.sumArrivedThisMonth(student)}`;

      var isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      var whatsappUrl = isMobileDevice
        ? `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}` // Open WhatsApp app
        : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`; // Open WhatsApp Web

      window.open(whatsappUrl, '_blank'); // Opens in a new tab
    },
    formatPhoneNumber(phoneNumber, countryCode) {
      var countryCode = '+972'
      // Remove any non-digit characters from the phone number
      phoneNumber = phoneNumber.replace(/\D/g, '');
      if (phoneNumber.startsWith('0')) {
        phoneNumber = countryCode + phoneNumber.slice(1);
      }
      return phoneNumber;
    },
    async updateMonthlyLessons(student) {
      var lessonsList = this.arrivedThisMonth(student)
      var studentClone = utilService.deepClone(student)
      try {
        for (const lesson of lessonsList) {
          const lessonClone = { ...lesson, status: 'paid' };
          const existingIndex = studentClone.classes.findIndex((c) => c.date === lessonClone.date);
          studentClone.classes.splice(existingIndex, 1, lessonClone);
        }
        await this.$store.dispatch({ type: "updateStudent", student: studentClone });
        showSuccessMsg(student.name + " paid for the month");
      } catch (err) {
        showErrorMsg("Error in monthly pay");
      }
    },
  },
  components: {
    statistic,
    deepStatistic,
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