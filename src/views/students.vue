<template>
  <section class="students-container container">
    <div class="students-header">
      <div class="sub-students-header">
        <h3>{{ students.length }} <span class="fs14">Students</span></h3>
        <button @click="editCmp = !editCmp">{{ editCmp ? '-' : '+' }}</button>
      </div>
      <input type="text" name="" id="">
    </div>
    <addStudent v-if="editCmp" @closeEdit="closeEdit" />
    <ul class="student-list">
      <li v-for="student in students" :key="student._id">
        <router-link :to="`/student/${student._id}`">
          <p class="student-name">{{ student.name }}</p>
          <div class="flex justify-space align-center">
            <p class="student-day">{{ student.day }}</p>
            <div class="lessons-imgs">
              <div v-for="lesson in classesInMonth(student)" :key="lesson.date">
                <img :src="loadImage(lesson.status)" :alt="lesson.status" :title="lesson.date">
              </div>
            </div>
          </div>
          <button @click.prevent="removeStudent(student._id)">x</button>
        </router-link>
      </li>
    </ul>
  </section>
</template>

<script>
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service";
import { studentService } from "../services/student.service.local";
import { utilService } from "../services/util.service";
import addStudent from '../cmps/addStudent.vue'
import arrived from '@/assets/imgs/arrived.svg'
import hevriz from '@/assets/imgs/hevriz.svg'
import paid from '@/assets/imgs/paid.svg'

export default {
  data() {
    return {
      studentToAdd: studentService.getEmptyStudent(),
      daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      editCmp: false
    };
  },
  created() {
    this.$store.dispatch({ type: "loadStudents" });
  },
  computed: {
    loggedInUser() {
      return this.$store.getters.loggedinUser;
    },
    students() {
      return this.$store.getters.students;
    },
  },
  methods: {
    loadImage(status) {
      var imgs = { arrived, paid, hevriz }
      return imgs[status]
    },
    async removeStudent(studentId) {
      try {
        await this.$store.dispatch({ type: 'removeStudent', studentId })
        showSuccessMsg("Student removed");
      } catch (err) {
        console.log(err);
        showErrorMsg("Cannot remove student");
      }
    },
    async addStudentMsg(studentId) {
      try {
        await this.$store.dispatch({ type: 'addStudent', studentId })
        showSuccessMsg("Student msg added");
      } catch (err) {
        console.log(err);
        showErrorMsg("Cannot add student msg");
      }
    },
    classesInMonth(student) {
      // var copiedStudent = utilService.deepClone(student)
      // var sortedLessons = utilService.sortByDate(copiedStudent.classes)
      // return sortedLessons.slice(-4)
    },
    printStudentToConsole(student) {
      console.log("Student msgs:", student.msgs);
    },
    closeEdit() {
      this.editCmp = false
    },
  },
  components: {
    addStudent,
  }
};
</script>
