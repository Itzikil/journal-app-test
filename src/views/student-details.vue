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
      <button @click="toggleEditCmp">Edit</button>
    </div>
    <addStudent v-if="editCmp" :editStudent="student" @toggleEditCmp="toggleEditCmp" />
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
                <button @click="toggleLessonNote(lesson)"><img src="../assets/imgs/note.svg" alt="note"></button>
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
    <div class="add-student-container" v-if="lessonNote">
      <p>Lesson note</p>
      <p>{{ lessonNote.date }} - {{ lessonNote.time }}</p>
      <form @submit.prevent="updateNoteLesson">
        <textarea v-model="lessonNote.note"></textarea>
        <button>Save</button>
        <button @click="lessonNote = ''" type="button">Close</button>
      </form>
    </div>
    <div class="add-student-container" v-if="lessonToEdit">
      <form @submit.prevent="updateLesson">
        <p class="text-center">Edit lesson</p>
        <label for="">Day<input type="text" v-model="lessonToEdit.date"></label>
        <label for="">Time<input type="text" v-model="lessonToEdit.time"></label>
        <label for="">Duration<input type="number" v-model="lessonToEdit.duration"></label>
        <label for="">Price<input type="number" v-model="lessonToEdit.price"></label>
        <button>Save</button>
        <button @click="lessonToEdit = ''" type="button">Close</button>
      </form>
    </div>
    <button @click="toggleAddSingle">{{ !addSingleOpen ? 'Add' : 'Close' }} single lesson</button>
    <singleClass :editStudent="student" v-if="addSingleOpen" @toggleAddSingle="toggleAddSingle" />
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
    classes() {
      return utilService.sortByDate(this.student.classes, 'backwards')
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

    updateNoteLesson() {
      this.updateLesson(this.lessonNote)
      this.lessonNote = ''
    },
    async updateLesson(lesson, status) {
      if (status) {
        if (lesson.status === status) return
        lesson.status = status
      } else {
        lesson = this.lessonNote || this.lessonToEdit
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
    },
    activeStatus(student, status) {
      if (student === status) return 'active-status'
    },
    toggleEditCmp() {
      this.editCmp = !this.editCmp;
      this.resetOtherStates('editCmp');
    },
    toggleLessonNote(lesson) {
      this.lessonNote = this.isSameLesson(lesson, this.lessonNote) ? '' : lesson;
      this.resetOtherStates('lessonNote');
      this.ScrollDown();
    },
    editLesson(lesson) {
      if (this.isSameLesson(lesson, this.lessonToEdit)) {
        this.lessonToEdit = '';
      } else {
        this.lessonToEdit = lesson;
        this.ScrollDown();
      }
      this.resetOtherStates('lessonToEdit');
    },
    toggleAddSingle() {
      this.addSingleOpen = !this.addSingleOpen;
      if (this.addSingleOpen && this.isMobile()) {
        this.ScrollDown();
      }
      this.resetOtherStates('addSingleOpen');
    },
    resetOtherStates(except) {
      if (except !== 'addSingleOpen') this.addSingleOpen = '';
      if (except !== 'lessonToEdit') this.lessonToEdit = '';
      if (except !== 'lessonNote') this.lessonNote = '';
      if (except !== 'editCmp') this.editCmp = '';
    },
    isMobile() {
      return window.innerWidth <= 768;
    },
    isSameLesson(lessonA, lessonB) {
      return lessonA?.date === lessonB?.date && lessonA?.time === lessonB?.time;
    },
  },
  components: {
    addStudent,
    singleClass
  }
}
</script>