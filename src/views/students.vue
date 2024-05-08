<template>
  <section class="students-container container">
    <div class="students-header">
      <button @click="editCmp = !editCmp">{{ editCmp ? '-' : '+' }}</button>
      <h2>{{ students.length }} Students</h2>
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
                <img :src="`src/assets/imgs/${lesson.status}.svg`" alt="" :title="lesson.date">
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
import { getActionRemoveStudent, getActionAddStudentMsg } from "../store/student.store";
import addStudent from '../cmps/addStudent.vue'

export default {
  data() {
    return {
      studentToAdd: studentService.getEmptyStudent(),
      daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      editCmp: false
    };
  },
  computed: {
    loggedInUser() {
      return this.$store.getters.loggedinUser;
    },
    students() {
      return this.$store.getters.students;
    },
  },
  created() {
    this.$store.dispatch({ type: "loadStudents" });
  },
  methods: {
    async removeStudent(studentId) {
      try {
        await this.$store.dispatch(getActionRemoveStudent(studentId));
        showSuccessMsg("Student removed");
      } catch (err) {
        console.log(err);
        showErrorMsg("Cannot remove student");
      }
    },
    async addStudentMsg(studentId) {
      try {
        await this.$store.dispatch(getActionAddStudentMsg(studentId));
        showSuccessMsg("Student msg added");
      } catch (err) {
        console.log(err);
        showErrorMsg("Cannot add student msg");
      }
    },
    classesInMonth(student) {
      var copiedStudent = utilService.deepClone(student)
      var sortedLessons = utilService.sortByDate(copiedStudent.classes)
      return sortedLessons.slice(-4)
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
