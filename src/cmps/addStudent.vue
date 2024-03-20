<template>
  <section class="add-student-container">
    <h2>Add Student</h2>
    <form @submit.prevent="addStudent()">
      <!-- <label>teacher: <input type="text" name="teacher" v-model="studentToAdd.teacher.name" required></label> -->
      <label>Name: <input type="text" name="name" v-model="studentToAdd.name" placeholder="name" required /></label>
      <label>Day:
        <select v-model="studentToAdd.day" name="day" required>
          <option v-for="day in daysOfWeek" :value="day">{{ day }}</option>
        </select>
      </label>
      <label>Time: <input type="time" name="time" v-model="studentToAdd.time" required></label>
      <label>Duration: <input type="number" name="duration" v-model="studentToAdd.duration" required></label>
      <label>price: <input type="number" name="price" v-model="studentToAdd.price" required></label>

      <button type="submit">Save</button>
    </form>
  </section>
</template>
  
<script>
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service';
import { studentService } from '../services/student.service.local';

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
    console.log(this.editStudent);
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
  }
};
</script>
  
<style>
/* CSS styles */
</style>
  