<template>
  <section class="add-student-container">
    <h3>Student info</h3>
    <form @submit.prevent="addStudent()">
      <!-- <label>teacher: <input type="text" name="teacher" v-model="studentToAdd.teacher.name" required></label> -->
      <label>Name <input type="text" name="name" v-model="studentToAdd.name" placeholder="name" required /></label>
      <label>Day
        <div class="select-wrapper">
          <select v-model="studentToAdd.day" name="day" required class="custom-select">
            <option v-for="day in daysOfWeek" :value="day">{{ day }}</option>
          </select>
        </div>
      </label>
      <label>Time <input modern-time-input type="time" name="time" min="08:00" max="20:00" v-model="studentToAdd.time"
          required></label>
      <label>Duration <input type="number" name="duration" v-model="studentToAdd.duration" placeholder="30 / 45 / 60"
          required></label>
      <label>Price <input type="number" name="price" v-model="studentToAdd.price" placeholder="50 / 100 / 200"
          required></label>
      <label>Phone<input type="text" name="phone" placeholder="xxx-xxxxxxx" v-model="studentToAdd.phone"></label>
      <button type="submit">{{ addEdit }}</button>
    </form>
  </section>
</template>

<script>
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service';
import { studentService } from '../services/student.service.local';
import { utilService } from '../services/util.service';

export default {
  props: {
    editStudent: {
      type: Object,
    }
  },
  data() {
    return {
      studentToAdd: this.editStudent || studentService.getEmptyStudent(),
      daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      teacher: this.$store.getters.loggedinUser
    };
  },
  created() {
    this.studentToAdd.teacher = { 'name': this.teacher.fullname, '_id': this.teacher._id }
  },
  computed: {
    addEdit() {
      return this.$route.path === '/students' ? 'Add student' : 'Update student'
    }
  },
  methods: {
    async addStudent() {
      try {
        if (utilService.checkForConflict(this.studentToAdd, this.$store.getters.students)) return showErrorMsg('That time is taken');
        await this.$store.dispatch({ type: "addStudent", student: this.studentToAdd });
        var msg = this.studentToAdd._id ? " updated" : " added"
        showSuccessMsg(this.studentToAdd.name + msg);
        this.$emit('closeEdit')
        this.studentToAdd = studentService.getEmptyStudent();
      } catch (err) {
        console.log(err);
        showErrorMsg("Cannot add student");
      }
    },
  }
};
</script>