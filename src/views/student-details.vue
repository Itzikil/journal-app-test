<template>
  <section v-if="student" class="student-details-container container">
    <div class="student-card">
      <h1>Student Details - {{ student.name }}</h1>
      <div>
        <p>teacher </p>
        <p>{{ student.teacher.name }}</p>
      </div>
      <div v-for="lesson in student.lessonsInfo" class="flex column">
        <div>
          <p>time </p>
          <p>{{ lesson.time }} {{ lesson.day }}'s</p>
        </div>
        <div>
          <p>duration </p>
          <p>{{ lesson.duration }} min </p>
        </div>
        <div>
          <p>price</p>
          <p>₪{{ lesson.price }}</p>
        </div>
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
        <ul v-if="student.classes" v-for="(lessons, idx) in slicedClasses" class="lesson-list" :key="idx">
          <div class="monthly-header">
            <h4 class="text-center ">{{ getMonthName(lessons[0].date) }}</h4>
            <button @click.stop="updateMonthlyLessons(lessons[0].date)"><img src="../assets/imgs/paid.svg"
                alt="paid"></button>
          </div>
          <div v-for="lesson in lessons" :key="lesson.date">
            <div class="lesson-item">
              <div class="edit-lesson">
                <button @click="deleteLesson(lesson)"><img src="../assets/imgs/delete.svg" alt="delete"></button>
                <button @click="editLesson(lesson)"><img src="../assets/imgs/edit.svg" alt="edit"></button>
                <button><img src="../assets/imgs/note.svg" alt="note"></button>
              </div>
              <p>{{ lesson.date }} </p>
              <div class="btns-container">
                <button @click.stop="updateLesson(lesson, 'hevriz')">
                  <img src="../assets/imgs/hevriz.svg" alt="didnt come" :class="activeStatus(lesson.status, 'hevriz')">
                </button>
                <button @click.stop="updateLesson(lesson, 'arrived')">
                  <img src="../assets/imgs/arrived.svg" alt="arrived" :class="activeStatus(lesson.status, 'arrived')">
                </button>
                <button @click.stop="updateLesson(lesson, 'paid')">
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
    </div>
    <button @click="toggleAddSingle">{{ !addSingleOpen ? 'Add' : 'Close' }} single lesson</button>
    <singleClass :editStudent="student" v-if="addSingleOpen" @closeAddSingle="closeAddSingle" />
    <div class="add-student-container" v-if="lessonToEdit">
      <form @submit.prevent="updateLesson">
        <p class="text-center">Edit lesson</p>
        <label for="">
          Day
          <input type="text" v-model="lessonToEdit.date">
        </label>
        <label for="">
          Time
          <input type="text" v-model="lessonToEdit.time">
        </label>
        <label for="">
          Duration
          <input type="number" v-model="lessonToEdit.duration">
        </label>
        <label for="">
          Price
          <input type="number" v-model="lessonToEdit.price">
        </label>
        <button>Save</button>
        <button @click="lessonToEdit = ''" type="button">Close</button>
      </form>
    </div>
    <form v-if="lessonNote">
      <input type="text" v-model="lessonNote">
    </form>
  </section>
</template>

<script>
import { utilService } from '../services/util.service'
import { studentService } from '../services/student.service.local'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service';
import addStudent from '../cmps/addStudent.vue'
import singleClass from '../cmps/singleClass.vue';

export default {
  data() {
    return {
      addSingleOpen: false,
      student: null,
      editCmp: false,
      classesForDisplay: [],
      monthNumber: 0,
      lessonToEdit: '',
      lessonNote: '',
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    }
  },
  async created() {
    const id = this.$route.params.id
    this.student = await studentService.getById(id)
    this.groupClassesByMonth()
  },
  computed: {
    classesSum() {
      this.displayClasses
    },
    classes() {
      return utilService.sortByDate(this.student.classes, 'backwards')
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
    slicedClasses() {
      return this.classesForDisplay.slice(this.monthNumber, this.monthNumber + 2)
    }
  },
  methods: {
    async updateMonthlyLessons(month) {
      const [monthDay, monthWanted, monthyear] = month.split('.')
      var monthlylessons = this.student.classes.filter(lesson => {
        const [day, monthStr, year] = lesson.date.split('.')
        return monthWanted === monthStr && lesson.status === 'arrived'
      })
      try {
        for (const lesson of monthlylessons) {
          await this.updateLesson(lesson, 'paid');
        }
        showSuccessMsg("All arrived " + this.monthNames[monthWanted - 1] + " lessons are paid ");
      } catch (err) {
        showErrorMsg("Error activating students");
      }
    },
    closeAddSingle() {
      this.addSingleOpen = '';
    },
    toggleAddSingle() {
      if (this.addSingleOpen) {
        this.addSingleOpen = '';
      } else {
        this.addSingleOpen = true;
        const isMobile = window.innerWidth <= 768; // 768px is a common mobile breakpoint
        if (isMobile) {
          this.ScrollDown()
        }
      }
    },
    ScrollDown() {
      setTimeout(() =>
        window.scrollTo({
          top: document.documentElement.scrollHeight, // Scroll to the bottom
          behavior: 'smooth' // Smooth scroll
        })
        , 100)
    },
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
      if ((this.monthNumber === 0 && idx === -1) || (this.monthNumber === this.classesForDisplay.length - 2 && idx === 1) ||
        (this.classesForDisplay.length < 2)) return
      this.monthNumber += idx
    },
    openEdit() {
      this.editCmp = !this.editCmp
    },
    closeEdit() {
      this.editCmp = false
    },
    async updateLesson(lesson, status) {
      if (status) {
        if (lesson.status === status) return
        lesson.status = status
      } else {
        lesson = this.lessonToEdit
      }
      var studentClone = utilService.deepClone(this.student)
      const existingIndex = studentClone.classes.findIndex((c) => c.date === lesson.date);
      studentClone.classes.splice(existingIndex, 1, lesson);
      try {
        await this.$store.dispatch({ type: "updateStudent", student: studentClone });
        showSuccessMsg(studentClone.name + " " + (status ? status : 'updated'));
        this.lessonToEdit = ''
      } catch (err) {
        console.log(err);
        showErrorMsg(`Cannot change ${studentClone} ${status}`);
      }
    },
    async deleteLesson(lesson) {
      var studentClone = utilService.deepClone(this.student)
      const existingIndex = studentClone.classes.findIndex((c) => c.date === lesson.date);
      studentClone.classes.splice(existingIndex, 1);
      try {
        await this.$store.dispatch({ type: "updateStudent", student: studentClone });
        showSuccessMsg(lesson.date + ' class has been deleted');
      } catch (err) {
        console.log(err);
        showErrorMsg(`Cannot change ${studentClone}`);
      }
      console.log(studentClone);
    },
    editLesson(lesson) {
      if (lesson.time === this.lessonToEdit?.time && lesson.date === this.lessonToEdit?.date) this.lessonToEdit = ''
      else {
        this.lessonToEdit = lesson
        this.ScrollDown()
      }
    },
    activeStatus(student, status) {
      if (student === status) return 'active-status'
    },
  },
  components: {
    addStudent,
    singleClass
  }
}
</script>