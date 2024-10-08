<template>
  <section class="students-container container">
    <div class="students-header">
      <div class="sub-students-header">
        <h3>{{ activeStudentsList.length }} <span class="fs14">Students</span></h3>
        <button @click="toggleEditCmp">{{ editCmp ? '-' : '+' }}</button>
      </div>
      <form action="" @submit.prevent="">
        <input type="text" name="" id="" v-model="filterBy.name" @input="setFilter">
      </form>
    </div>
    <button @click="activeStudents = true" :class="{ 'inactive-btn': !activeStudents }">Active ({{
      activeStudentsList.length }})</button>
    <button @click="activeStudents = false" :class="{ 'inactive-btn': activeStudents }">Inactive ({{
      inactiveStudentsList.length }})</button>
    <!-- <button @click="activatatedStudents">activate all students</button> -->
    <addStudent v-if="editCmp" @toggleEditCmp="toggleEditCmp" />
    <div class="days-container">
      <ul v-for="(students, day) in groupedStudents" :key="day" class="students-list">
        <p v-if="activeStudents" class="fs14">{{ day }}</p>
        <!-- One TransitionGroup for the student list -->
        <TransitionGroup tag="ul" name="student-list" class="student-list" :key="day">
          <li v-for="student in students" :key="student._id">
            <router-link :to="`/student/${student._id}`">
              <p class="student-name">{{ student.name }}</p>
              <button v-if="!student.active" @click.prevent="activateStudent(student)"
                class="activate-btn">Activate</button>
              <button @click.prevent="deleteStudent = student" class="delete-btn">x</button>
            </router-link>
          </li>
        </TransitionGroup>
      </ul>

    </div>
    <div v-if="deleteStudent" class="delete-student-container">
      <p>Are you sure you want to delete {{ deleteStudent.name }}?</p>
      <div class="btns-delete-container">
        <button @click="removeStudent(deleteStudent._id)">yes</button>
        <button @click="deleteStudent = null">no</button>
        <button v-if="deleteStudent.active" @click="deactivateStudent(deleteStudent)">deactivate</button>
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
      filterBy: {
        name: ''
      },
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
    toggleEditCmp() {
      this.editCmp = !this.editCmp
    },
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
      studentClone.lessonsInfo = []
      try {
        await this.$store.dispatch({ type: "updateStudent", student: studentClone });
        showSuccessMsg(studentClone.name + " " + ('deactivated'));
        this.deleteStudent = null
      } catch (err) {
        console.log(err);
        showErrorMsg(`Cannot change ${studentClone} `);
      }
    },
    async setFilter() {
      try {
        await this.$store.dispatch({ type: "setFilter", filterBy: { ...this.filterBy } });
      } catch (err) {
        showErrorMsg(`Cannot change ${studentClone} `);
      }
    }
  },
  components: {
    addStudent,
  }
};
</script>

<style>
.student-list-move {
  transition: all 0.4s ease;
}

.student-list-enter-active,
.student-list-leave-active {
  transition: all 0.6s ease;
}

.student-list-enter-from,
.student-list-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.student-list-leave-to {
  transform: translateX(50px);
}

.student-list-leave-active {
  position: absolute;
  bottom: 0;
}
</style>