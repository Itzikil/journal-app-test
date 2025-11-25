<template>
  <section class="students-container container">
    <div class="students-header">
      <div class="sub-students-header">
        <h3>{{ activeStudentsList.length }} <span class="fs14">Students</span></h3>
        <button @click="openAddCmp">+</button>
      </div>
      <form action="" @submit.prevent="">
        <input type="text" name="" id="" v-model="filterBy.name" @input="setFilter">
      </form>
    </div>

    <button @click="setActiveStudents('active')" :class="{ 'inactive-btn': activeStudents === 'active' }">
      Active ({{ activeStudentsList.length }})</button>
    <button @click="setActiveStudents('inactive')" :class="{ 'inactive-btn': activeStudents === 'inactive' }">
      Inactive ({{ inactiveStudentsList.length }})</button>
    <!-- <button @click="setActiveStudents('groups')" :class="{ 'inactive-btn': activeStudents === 'groups' }">
      Groups ({{ groupsList.length }})</button> -->
    <!-- <button @click="activatatedStudents">activate all students</button> -->

    <!-- Overlay -->
    <transition name="overlay-fade">
      <div v-if="addCmp" class="adding-cmp-overlay" @click="closeAll">

        <!-- Bottom sheet -->
        <transition name="bottom-sheet">
          <div class="adding-cmp-container" @click.stop>

            <!-- First menu -->
            <div v-if="!editCmp" class="menu-screen">
              <button class="close-btn" @click="closeAll">X</button>

              <button class="option-btn" @click="toggleEditCmp('student')">
                <img src="../assets/imgs/student.svg" />
                Add student
              </button>

              <button class="option-btn" @click="toggleEditCmp('group')">
                <img src="../assets/imgs/header/students.svg" />
                Add group
              </button>

              <button class="option-btn" @click="toggleEditCmp('group')">
                <img src="../assets/imgs/group.svg" />
                Add group lesson
              </button>
            </div>

            <!-- Student form -->
            <transition name="bottom-sheet">
              <div v-if="editCmp === 'student'" class="menu-screen">
                <button class="close-btn" @click="editCmp = false">X</button>
                <addStudent @closeAll="closeAll" />
              </div>
            </transition>

            <!-- Group form -->
            <transition name="bottom-sheet">
              <div v-if="editCmp === 'group'" class="menu-screen">
                <button class="close-btn" @click="editCmp = false">X</button>
                <addStudentToGroup @makeGroup="makeGroup" :activeStudents="activeStudentsList" />
              </div>
            </transition>

          </div>
        </transition>

      </div>
    </transition>

    <div class="days-container">
      <ul v-for="(students, day) in groupedStudents" :key="day" class="students-list">
        <p v-if="activeStudents === 'active'" class="fs14">{{ day }}</p>
        <TransitionGroup tag="ul" name="student-list" :key="day">

          <div v-if="activeStudents !== 'groups'" class="student-list">
            <li v-for="student in students" :key="student._id">
              <router-link :to="`/student/${student._id}`">
                <p class="student-name">{{ student.name }}</p>
                <button v-if="!student.active" @click.prevent="activateStudent(student)"
                  class="activate-btn">Activate</button>
                <button @click.prevent="deleteStudent = student" class="delete-btn">x</button>
              </router-link>
            </li>
          </div>

          <div v-else class="student-list groups-container">
            <li v-for="group in groupsList" :key="group.name">
              <div class="group-name" @click="toggleGroup(group)">
                <p class="fs18">{{ group.groupName }}</p>
                <ul class="student-ingroup-list">
                  <li v-for="student in group.student">
                    <p class="fs14">{{ student.name }}</p>
                  </li>
                </ul>
              </div>
              <ul v-if="group.showStudents">
                <li v-for="student in group.students" :key="student.id">
                  <router-link :to="`/student/${student._id}`">
                    <p class="student-name">{{ student.name }}</p>
                  </router-link>
                </li>
              </ul>
            </li>
          </div>

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
import addStudentToGroup from '../cmps/addStudentToGroup.vue'
import arrived from '@/assets/imgs/arrived.svg'
import hevriz from '@/assets/imgs/hevriz.svg'
import paid from '@/assets/imgs/paid.svg'

export default {
  data() {
    return {
      studentToAdd: studentService.getEmptyStudent(),
      daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      addCmp: false,
      editCmp: null,
      deleteStudent: null,
      activeStudents: 'active',
      filterBy: {
        name: ''
      },
      allStudents: this.$store.getters.students,
      students: '',
    };
  },
  created() {
    this.$store.dispatch({ type: "loadStudents" });
    this.students = this.$store.getters.students;
  },
  watch: {
    addCmp(isOpen) {
      document.body.classList.toggle('no-scroll', isOpen);
    }
  },
  computed: {
    loggedInUser() {
      return this.$store.getters.loggedinUser;
    },
    groupedStudents() {
      if (this.activeStudents === 'groups') return this.groupsList
      var sortedStudents = this.daysOfWeek.reduce((acc, day) => {
        const studentsForDay = (this.activeStudents === 'active' ? this.activeStudentsList : this.inactiveStudentsList).filter(student => student?.lessonsInfo[0]?.day === day);
        if (studentsForDay.length) {
          acc[day] = studentsForDay;
        }
        return acc;
      }, {})
      sortedStudents.Singles = this.students.filter(student => !student.lessonsInfo[0] && student.active === (this.activeStudents === 'active'))
      if (!sortedStudents.Singles.length) delete sortedStudents.Singles
      return sortedStudents
    },
    activeStudentsList() {
      return this.students.filter(student => student?.active);
    },
    inactiveStudentsList() {
      return this.students.filter(student => student.active === false);
    },
    groupsList() {
      return this.loggedInUser.groups
    },
  },
  methods: {
    setActiveStudents(type) {
      this.activeStudents = type
    },
    toggleEditCmp(whatToAdd) {
      this.editCmp = whatToAdd
      // this.addCmp = false
    },
    openAddCmp() {
      this.addCmp = true
    },
    closeAll() {
      this.editCmp = null
      this.addCmp = false
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
      const regex = new RegExp(this.filterBy.name, 'i')
      this.students = this.allStudents.filter(student => regex.test(student.name))
      // try {
      //   await this.$store.dispatch({ type: "setFilter", filterBy: { ...this.filterBy } });
      // } catch (err) {
      //   showErrorMsg(`Cannot filter`);
      // }
    },
    async makeGroup(group) {
      var user = await this.$store.dispatch({ type: 'loadAndWatchUser', userId: this.loggedInUser._id });
      console.log(group);
      if (!user.groups) user.groups = []
      user.groups.push(group)
      try {
        await this.$store.dispatch({ type: "updateUser", user });
      } catch (err) {
        showErrorMsg(`Cannot change ${studentClone} `);
      }
    }
  },
  components: {
    addStudent,
    addStudentToGroup
  }
};
</script>

<style>
.adding-cmp-enter-active,
.adding-cmp-leave-active {
  transition: transform 0.5s ease-out;
}

.adding-cmp-enter,
.adding-cmp-leave-to {
  transform: translateY(100%);
}

.adding-cmp-enter-to,
.adding-cmp-leave {
  transform: translateY(0);
  /* Moves to normal position */
}

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