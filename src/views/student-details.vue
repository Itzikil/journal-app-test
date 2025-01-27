<template>
  <section v-if="!loading && student" class="student-details-container container">
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
        <transition-group v-if="student.classes" tag="ul" name="lesson-list" class="lessons-group" :key="student._id">
          <li v-for="(lessons, idx) in slicedClasses" :key="idx + '1'" class="monthly-lesson">
            <div class="monthly-header">
              <h4 class="text-center">{{ getMonthName(lessons[0].date) }}</h4>
              <button @click.stop="updateMonthlyLessons(lessons[0].date)" class="pay-all-btn">
                <img src="../assets/imgs/paid.svg" alt="paid">
              </button>
            </div>

            <transition-group tag="ul" name="lesson-list" class="lessons-group" :key="idx">
          <li v-for="lesson in lessons" :key="lesson.date + lesson.time" class="lesson-item">
            <div class="edit-lesson">
              <button @click="deleteLesson(lesson)">
                <img src="../assets/imgs/delete.svg" alt="delete">
              </button>
              <button @click="openEditLesson(lesson)">
                <img src="../assets/imgs/edit.svg" alt="edit">
              </button>
              <button @click="toggleLessonNote(lesson)">
                <img :src="lesson.note ? greenNoteImage : noteImage" alt="note">
              </button>
            </div>

            <p>{{ lesson.date }}</p>

            <div class="btns-container">
              <button @click.stop="updateLesson(lesson, 'hevriz')">
                <img src="../assets/imgs/hevriz.svg" alt="didn't come" :class="activeStatus(lesson.status, 'hevriz')">
              </button>
              <button @click.stop="updateLesson(lesson, 'arrived')">
                <img src="../assets/imgs/arrived.svg" alt="arrived" :class="activeStatus(lesson.status, 'arrived')">
              </button>
              <button @click.stop="updateLesson(lesson, 'paid')">
                <img src="../assets/imgs/paid.svg" alt="paid" :class="activeStatus(lesson.status, 'paid')">
              </button>
            </div>
          </li>
        </transition-group>
        </li>
        </transition-group>

        <div v-else>
          <p>No classes yet</p>
        </div>
      </div>
    </div>

    <div class="notes-container">
      <h3>Notes</h3>
      <ul v-if="allNotes.length">
        <li v-for="note in allNotes">
          <button @click="openNote(note)">{{ note.date }}</button>
          <p v-if="openedNote === note.date">{{ note.note }}</p>
        </li>
      </ul>
      <p v-else>No notes yet</p>
    </div>

    <div class="reports-container notes-container">
      <h3>Reports</h3>
      <p>Here you can recive reports as much as you want in the future</p>
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

  <section v-else class="main-loader">
    <img src="@/assets/imgs/page-‏‏loader.gif" alt="">
  </section>
</template>

<script>
import { utilService } from '../services/util.service'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service';
import noteImg from '@/assets/imgs/note.svg'
import greenNoteImg from '@/assets/imgs/green-note.svg'
import addStudent from '../cmps/addStudent.vue'
import singleClass from '../cmps/singleClass.vue';

export default {
  data() {
    return {
      loading: true,
      addSingleOpen: false,
      editCmp: false,
      monthNumber: 0,
      lessonToEdit: '',
      lessonNote: '',
      openedNote: '',
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    }
  },
  async created() {
    const id = this.$route.params.id
    try {
      await this.$store.dispatch({ type: "getStudentById", id });
    } catch (err) {
      console.log(err);
    }
    this.groupClassesByMonth
    this.loading = false
  },
  computed: {
    student() {
      return utilService.deepClone(this.$store.getters.currStudent)
    },
    classes() {
      return utilService.sortByDate(this.student.classes, 'backwards')
    },
    slicedClasses() {
      return this.groupClassesByMonth.slice(this.monthNumber, this.monthNumber + 2)
    },
    groupClassesByMonth() {
      const groupedClasses = {};
      this.classes.forEach(cls => {
        const monthKey = utilService.extractDatePart(cls.date, 'month.year')
        if (!groupedClasses[monthKey]) {
          groupedClasses[monthKey] = [];
        }
        groupedClasses[monthKey].push(cls);
      });
      const keys = Object.keys(groupedClasses);
      var classesForDisplay = keys.map(key => groupedClasses[key])
      return classesForDisplay
    },
    noteImage() {
      return noteImg
    },
    greenNoteImage() {
      return greenNoteImg
    },
    allNotes() {
      return this.classes.filter(cls => cls.note)
    }
  },
  methods: {
    ScrollDown() {
      setTimeout(() =>
        window.scrollTo({
          top: document.documentElement.scrollHeight, // Scroll to the bottom
          behavior: 'smooth' // Smooth scroll
        })
        , 100)
    },
    getMonthName(monthKey) {
      const [day, month, year] = monthKey.split('.');
      return `${this.monthNames[month - 1]} ${year}`
    },
    changeMonth(idx) {
      if ((this.monthNumber === 0 && idx === -1) || (this.monthNumber === this.groupClassesByMonth.length - 2 && idx === 1) ||
        (this.groupClassesByMonth.length < 2)) return
      this.monthNumber += idx
    },
    updateNoteLesson() {
      this.updateLesson(this.lessonNote)
      this.lessonNote = ''
    },
    async updateMonthlyLessons(month) {
      var monthWanted = utilService.extractDatePart(month, 'month')
      var monthlyLessons = this.student.classes.filter(lesson => {
        var monthStr = utilService.extractDatePart(lesson.date, 'month')
        return monthWanted === monthStr && lesson.status === 'arrived'
      })
      monthlyLessons.forEach(lesson => {
        lesson.status = 'paid'
      })
      this.updateStudentToStore(this.student, "All arrived " + this.monthNames[monthWanted - 1] + " lessons are paid ",
        `Cannot pay all ${this.student} for ${this.monthNames[monthWanted - 1]}`)
    },
    async updateLesson(lesson, status) {
      if (status) {
        if (lesson.status === status) return
        lesson.status = status
      } else {
        console.log(lesson);
        lesson = this.lessonNote || this.lessonToEdit
        console.log(lesson);
      }
      const existingIndex = this.student.classes.findIndex((c) => c.date === lesson.date);
      this.student.classes.splice(existingIndex, 1, lesson);
      this.updateStudentToStore(this.student, this.student.name + " " + (status ? status : 'updated'), `Cannot change ${this.student} to ${status}`)
      this.resetOtherStates()
    },
    async deleteLesson(lesson) {
      const existingIndex = this.student.classes.findIndex((c) => c.date === lesson.date);
      this.student.classes.splice(existingIndex, 1);
      this.updateStudentToStore(this.student, lesson.date + ' lesson has been deleted', `Cannot change ${this.student}`)
    },
    async updateStudentToStore(student, successMsg, errorMsg) {
      try {
        await this.$store.dispatch({ type: "updateStudent", student });
        showSuccessMsg(successMsg);
      } catch (err) {
        console.log(err);
        showErrorMsg(errorMsg);
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
    openEditLesson(lesson) {
      if (this.isSameLesson(lesson, this.lessonToEdit)) this.lessonToEdit = ''
      else {
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
    openNote(note) {
      this.openedNote = this.openedNote === note.date ? '' : note.date
    }
  },
  components: {
    addStudent,
    singleClass
  }
}
</script>

<style>
.lesson-list-enter-active,
.lesson-list-leave-active {
  transition: all 0.4s ease;
}

.lesson-list-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}

.lesson-list-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.lesson-list-move {
  transition: all 0.8s ease;
}

.lesson-list-leave-active {
  position: absolute;
}
</style>