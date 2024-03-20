<template>
  <section class="students-container container">
    <ul class="student-list">
      <li v-for="student in students" :key="student._id" >
        <router-link :to="`/student/${student._id}`" >
        <p class="student-name">{{ student.name }}</p>
        <div class="flex justify-space align-center">
          <p class="student-day">{{ student.day }}</p>
          <p class="student-price">₪{{ student.price?.toLocaleString() }}</p>
        </div>
        <button @click.prevent="removeStudent(student._id)">x</button>
        </router-link>
        <!-- <router-link :to="`/student/${student._id}`">Details</router-link> -->
      </li>
    </ul>
    <button @click="openAddStudent = !openAddStudent">Add student</button>
    <addStudent v-if="openAddStudent" />
  </section>
</template>

<script>
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service";
import { studentService } from "../services/student.service.local";
import { getActionRemoveStudent, getActionAddStudentMsg } from "../store/student.store";
import addStudent from '../cmps/addStudent.vue'

export default {
  data() {
    return {
      studentToAdd: studentService.getEmptyStudent(),
      daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      openAddStudent: false
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
    async addStudent() {
      try {
        await this.$store.dispatch({ type: "addStudent", student: this.studentToAdd });
        showSuccessMsg("Student added");
        this.studentToAdd = studentService.getEmptyStudent();
      } catch (err) {
        console.log(err);
        showErrorMsg("Cannot add student");
      }
    },
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
    printStudentToConsole(student) {
      console.log("Student msgs:", student.msgs);
    },
  },
  components: {
    addStudent,
  }
};
</script>
