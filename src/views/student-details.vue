<template>
  <section v-if="student" class="student-details-container container">
    <div class="student-card">
      <h1>Student Details - {{ student.name }}</h1>
      <div>
        <p>teacher </p>
        <p>{{ student.teacher.name }}</p>
      </div>
      <div>
        <p>time </p>
        <p>{{ student.time }} {{ student.day }}'s</p>
      </div>
      <div>
        <p>duration </p>
        <p>{{ student.duration }} min </p>
      </div>
      <div>
        <p>price</p>
        <p>₪{{ student.price }}</p>
      </div>
      <button @click="openEdit">Edit</button>
    </div>
    <addStudent v-if="editCmp" :editStudent="student" @closeEdit="closeEdit" />
    <div class="last-lessons">
      <div class="btn-container">
        <button @click="changeMonth(1)">&lt</button>
        <h3>Last months</h3>
        <button @click="changeMonth(-1)">></button>
      </div>
      <div class="lessons-list">
        <ul v-if="student.classes" v-for="(lessons,idx) in slicedClasses" class="lesson-list" :key="idx">
          <h4 class="text-center ">{{ getMonthName(lessons[0].date) }}</h4>
          <div v-for="lesson in lessons" :key="lesson.date">
            <div class="lesson-item">
              <p>{{ lesson.date }} </p>
              <div class="btns-container">
                <button @click.stop="addClass(lesson, 'hevriz')">
                  <img src="../assets/imgs/hevriz.svg" alt="didnt come" :class="activeStatus(lesson.status, 'hevriz')">
                </button>
                <button @click.stop="addClass(lesson, 'arrived')">
                  <img src="../assets/imgs/arrived.svg" alt="arrived" :class="activeStatus(lesson.status, 'arrived')">
                </button>
                <button @click.stop="addClass(lesson, 'paid')">
                  <img src="../assets/imgs/paid.svg" alt="paid" :class="activeStatus(lesson.status, 'paid')">
                </button>
              </div>
            </div>
          </div>
        </ul>
        <div v-else>
          <p>No classes yet</p>
        </div>
      </div>
    </div>
    <div>
      <!-- <p>earned this period ₪{{ arrivedClassesSum + paidClassesSum }}</p>
      <p>need to be paid ₪{{ arrivedClassesSum }}</p> -->
    </div>
    <!-- <p> ₪ {{ arrivedClassesSum }} / <span class="bold"> {{ paidClassesSum }}</span></p> -->
  </section>
</template>

<script>
import { studentService } from '../services/student.service.local'
import addStudent from '../cmps/addStudent.vue'
import { utilService } from '../services/util.service'
import { showSuccessMsg } from '../services/event-bus.service';
import { showErrorMsg } from '../services/event-bus.service';

export default {
  data() {
    return {
      student: null,
      editCmp: false,
      classes: [],
      classesForDisplay: [],
      monthNumber: 0,
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    }
  },
  async created() {
    const id = this.$route.params.id
    this.student = await studentService.getById(id)
    this.classes = utilService.sortByDate(this.student.classes , 'backwards')
    this.groupClassesByMonth()
  },
  computed: {
    classesSum() {
      this.displayClasses
    },
    calculateClassSum() {
      return (status) => {
        return this.displayClasses.reduce((total, lesson) => {
          if (lesson.status === status) {
            return total + this.student.price;
          } else {
            return total;
          }
        }, 0);
      };
    },
    arrivedClassesSum() {
      return this.calculateClassSum("arrived");
    },
    paidClassesSum() {
      return this.calculateClassSum("paid");
    },
    slicedClasses(){
      return this.classesForDisplay.slice(this.monthNumber, this.monthNumber + 2)
    }
  },
  methods: {
    groupClassesByMonth() {
      const groupedClasses = {};
      this.classes.forEach(cls => {
        const [day, month, year] = cls.date.split('.');
        const monthKey = `${parseInt(month)}.${year}`; // Combine month and year as key
        if (!groupedClasses[monthKey]) {
          groupedClasses[monthKey] = [];
        }
        groupedClasses[monthKey].push(cls);
      });
      const keys = Object.keys(groupedClasses);
      this.classesForDisplay = keys.map(key => groupedClasses[key])
      return groupedClasses
    },
    getMonthName(monthKey) {
      const [day, month, year] = monthKey.split('.');
      return `${this.monthNames[month - 1]} ${year}`
    },
    changeMonth(idx) {
      if ((this.monthNumber === 0 && idx === -1) || (this.monthNumber === this.classesForDisplay.length - 2 && idx === 1)) return
      this.monthNumber += idx
    },
    openEdit() {
      this.editCmp = !this.editCmp
    },
    closeEdit() {
      this.editCmp = false
    },
    async addClass(lesson, status) {
      if (lesson.status === status) return
      lesson.status = status
      var studentClone = utilService.deepClone(this.student)
      const existingIndex = studentClone.classes.findIndex((c) => c.date === lesson.date);
      studentClone.classes.splice(existingIndex, 1, lesson);
      try {
        await this.$store.dispatch({ type: "updateStudent", student: studentClone });
        showSuccessMsg(studentClone.name + " " + status);
      } catch (err) {
        console.log(err);
        showErrorMsg(`Cannot change ${studentClone} ${status}`);
      }
    },
    activeStatus(student, status) {
      if (student === status) return 'active-status'
    },
  },
  components: {
    addStudent
  }
}
</script>