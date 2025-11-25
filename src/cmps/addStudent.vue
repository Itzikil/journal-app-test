<template>
  <section class="add-student-container">
    <h3>Student info</h3>
    <form @submit.prevent="addStudent()">
      <label>Name <input type="text" name="name" v-model="studentToAdd.name" placeholder="name" required /></label>
      <label>Phone<input type="text" name="phone" placeholder="xxx-xxxxxxx" v-model="studentToAdd.phone"></label>
      <label>Category<input type="text" name="category" placeholder="student/gig etc" ></label>
      
      <p>Lesson info</p>
      <div class="flex btn-container">
        <button @click="changeMode('weekly')" type="button" :class="{ 'not-active': lessonMode === 'single' }">Weekly
          lessons</button>
        <button v-if="!atStudentDetails" @click="changeMode('single')" type="button"
          :class="{ 'not-active': lessonMode === 'weekly' }">single
          lesson</button>
      </div>
      <div v-for="(lesson, idx) in lessonsInfo" class="lessons-info-container">
        <label v-if="lessonMode === 'weekly'">Day
          <div class="select-wrapper">
            <select v-model="lesson.day" name="day" required class="custom-select">
              <option v-for="day in daysOfWeek" :value="day">{{ day }}</option>
            </select>
          </div>
        </label>
        <label v-else>Lesson day <input type="text" :ref="'lessonDatePicker' + idx" class="custom-date-input"
            v-model="lesson.day" required></label>
        <label>Time <input modern-time-input type="time" name="time" :min="startHour" :max="endHour"
            v-model="lesson.time" required></label>
        <label>Duration <input type="number" name="duration" v-model="lesson.duration" placeholder="Minutes"
            required></label>
        <label>Price <input type="number" name="price" v-model="lesson.price" placeholder="100 / 200" required></label>
        <label> {{ !studentToAdd._id ? 'Joined at' : 'changed at' }}
          <input type="text" :ref="'joinedDatePicker' + idx" class="custom-date-input" v-model="lesson.start" />
        </label>
      </div>
      <div class="btn-container">
        <button @click="addLesson" type="button">Add Lesson</button>
        <button @click="removeLesson" type="button">Remove Lesson</button>
      </div>
      <button type="submit">{{ addEdit }}</button>
    </form>
  </section>
</template>

<script>
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service';
import { studentService } from '../services/student.service.local';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default {
  props: {
    editStudent: {
      type: Object,
    }
  },
  data() {
    return {
      studentToAdd: this.editStudent || studentService.getEmptyStudent(),
      lessonsInfo: this.editStudent?.lessonsInfo || [],
      daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      teacher: this.$store.getters.loggedinUser,
      lessonMode: 'weekly',
      startHour: '',
      endHour: '',
      atStudentDetails: this.$route.name === 'student-details'
    };
  },
  async created() {
    this.studentToAdd.teacher = { 'name': this.teacher.username, '_id': this.teacher._id }
    if (this.teacher) var user = await this.$store.dispatch({ type: 'loadAndWatchUser', userId: this.teacher._id })
    this.startHour = user.pref.hours?.from
      ? `${user.pref.hours.from < 10 ? '0' : ''}${user.pref.hours.from}:00`
      : '08:00';
    this.endHour = user.pref.hours?.to
      ? `${user.pref.hours.to < 10 ? '0' : ''}${user.pref.hours.to}:00`
      : '20:00';
  },
  mounted() {
    if (!this.lessonsInfo.length) this.addLesson()
    // this.addFlatPickr('joinedDatePicker0')

    this.$nextTick(() => {
      const el = this.$refs['joinedDatePicker0']
      if (el) this.addFlatPickr(el)
    })
  },
  computed: {
    addEdit() {
      return this.$route.path === '/students' ? 'Add student' : 'Update student'
    },
  },
  methods: {
    removeLesson() {
      if (this.lessonsInfo.length) this.lessonsInfo.pop()
    },
    addLesson() {
      this.lessonsInfo.push(studentService.getEmptyClass());
      const index = this.lessonsInfo.length - 1;
      this.$nextTick(() => {
        ['joinedDatePicker', 'lessonDatePicker'].forEach(ref => {
          var currRef = this.$refs[ref + index];
          if (currRef) this.addFlatPickr(currRef)
        })
      })
    },
    addFlatPickr(ref) {
      if (ref) flatpickr(ref, { dateFormat: 'j.n.Y' })
    },
    changeMode(mode) {
      this.lessonMode = mode
      this.lessonsInfo.forEach((lesson) => lesson.day = '')
      if (mode === 'single') {
        this.$nextTick(() => {
          this.lessonsInfo.forEach((lesson, idx) => this.addFlatPickr(this.$refs['lessonDatePicker' + idx]))
        })
      }
    },
    async addStudent() {
      if (this.lessonMode === 'weekly') this.studentToAdd.lessonsInfo = this.lessonsInfo
      else {
        var lesson = this.lessonsInfo[0]
        lesson.date = lesson.day
        lesson.status = ''
        delete lesson.day
        delete lesson.start
        this.studentToAdd.classes.push(lesson)
      }
      try {
        await this.$store.dispatch({ type: this.studentToAdd._id ? "updateStudent" : "addStudent", student: this.studentToAdd });
        var msg = this.studentToAdd._id ? " updated" : " added"
        showSuccessMsg(this.studentToAdd.name + msg);
        this.$emit('closeAll')
        this.studentToAdd = studentService.getEmptyStudent();
      } catch (err) {
        console.log(err);
        showErrorMsg("Cannot add student");
      }
    },
  },
};
</script>