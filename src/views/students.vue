<template>
  <section class="students-container container">
    <div class="students-header">
      <div class="sub-students-header">
        <h3>{{ students.length }} <span class="fs14">Students</span></h3>
        <button @click="editCmp = !editCmp">{{ editCmp ? '-' : '+' }}</button>
      </div>
      <input type="text" name="" id="">
    </div>
    <button @click="activeStudents = true" :class="{ 'inactive-btn': !activeStudents }">Active ({{
      activeStudentsList.length }})</button>
    <button @click="activeStudents = false" :class="{ 'inactive-btn': activeStudents }">Inactive ({{
      inactiveStudentsList.length }})</button>
    <button @click="activatatedStudents">activate all students</button>
    <addStudent v-if="editCmp" @closeEdit="closeEdit" />
    <div class="days-container">
      <ul v-for="(students, day) in groupedStudents" :key="day">
        <p>{{ day }}</p>
        <ul class="student-list">
          <li v-for="student in students" :key="student._id">
            <router-link :to="`/student/${student._id}`">
              <p class="student-name">{{ student.name }}</p>
              <button @click.prevent="deleteStudent = student">x</button>
            </router-link>
          </li>
        </ul>
      </ul>
    </div>
    <!-- <ul class="student-list">
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
          <button @click.prevent="deleteStudent = student">x</button>
        </router-link>
      </li>
    </ul> -->
    <div v-if="deleteStudent" class="delete-student-container">
      <p>Are you sure you want to delete {{ deleteStudent.name }}?</p>
      <div class="btns-delete-container">
        <button @click="removeStudent(deleteStudent._id)">yes</button>
        <button @click="deleteStudent = null">no</button>
        <button @click="deactivateStudent(deleteStudent)">deactivate</button>
      </div>
    </div>
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
      editCmp: false,
      deleteStudent: null,
      activeStudents: true,
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
    groupedStudents() {
      var sortedStudents = this.daysOfWeek.reduce((acc, day) => {
        const studentsForDay = (this.activeStudents ? this.activeStudentsList : this.inactiveStudentsList).filter(student => student?.lessonsInfo[0]?.day === day);
        if (studentsForDay.length) {
          acc[day] = studentsForDay;
        }
        return acc;
      }, {})
      sortedStudents.Singles = this.students.filter(student => !student.lessonsInfo[0] && student.active === this.activeStudents)
      if (!sortedStudents.Singles.length) delete sortedStudents.Singles
      return sortedStudents
    },
    activeStudentsList() {
      return this.students.filter(student => student?.active);
    },
    inactiveStudentsList() {
      return this.students.filter(student => student.active === false);
    },
  },
  methods: {
    loadImage(status) {
      var imgs = { arrived, paid, hevriz }
      return imgs[status]
    },
    async activatatedStudents() {
      try {
        for (const student of this.students) {
          await this.activateStudent(student);
        }
        showSuccessMsg("All students activated successfully");
      } catch (err) {
        console.log(err);
        showErrorMsg("Error activating students");
      }
    },
    async activateStudent(student) {
      var studentClone = utilService.deepClone(student)
      studentClone.active = true
      try {
        await this.$store.dispatch({ type: "updateStudent", student: studentClone });
        showSuccessMsg(studentClone.name + " " + ('activated'));
      } catch (err) {
        console.log(err);
        showErrorMsg(`Cannot change ${studentClone} `);
      }
    },
    async removeStudent(studentId) {
      try {
        await this.$store.dispatch({ type: 'removeStudent', studentId })
        showSuccessMsg("Student removed");
        this.deleteStudent = null
      } catch (err) {
        console.log(err);
        showErrorMsg("Cannot remove student");
      }
    },
    async deactivateStudent(student) {
      var studentClone = utilService.deepClone(student)
      studentClone.active = false
      try {
        await this.$store.dispatch({ type: "updateStudent", student: studentClone });
        showSuccessMsg(studentClone.name + " " + ('deactivated'));
        this.deleteStudent = null
      } catch (err) {
        console.log(err);
        showErrorMsg(`Cannot change ${studentClone} `);
      }
    },
    classesInMonth(student) {
      // var copiedStudent = utilService.deepClone(student)
      // var sortedLessons = utilService.sortByDate(copiedStudent.classes)
      // return sortedLessons.slice(-4)
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
