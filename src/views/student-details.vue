<template>
  <section v-if="student" class="student-details-container container">
    <div class="student-card">
      <h1>Student Details - {{ student.name }}</h1>
      <div>
        <p>teacher </p>
        <p>{{ student.teacher.name }}</p>
      </div>
      <div>
        <p>time </p>
        <p>{{ student.time }} {{ student.day }}'s</p>
      </div>
      <div>
        <p>duration </p>
        <p>{{ student.duration }} min </p>
      </div>
      <div>
        <p>price</p>
        <p>₪{{ student.price }}</p>
      </div>
      <button @click="openEdit">Edit</button>
    </div>
    <addStudent v-if="editable" :editStudent="student" />
    <div class="last-lessons">
      <div class="btn-container">
        <button @click="monthsBackwards('', -1)">&lt</button>
        <h3>Last months</h3>
        <button @click="monthsBackwards('', 1)">></button>
      </div>
      <div class="lessons-list">
        <ul v-if="student.classes" v-for="lessons in classesForMonth" class="lesson-list">
          <h3>{{ monthNames[lessons[0].date.split('.')[1] - 1] }}</h3>
          <li v-for="lesson in lessons">
            <p>{{ lesson.date }} </p>
            <button>{{ lesson.status }}</button>
          </li>
        </ul>
      </div>
    </div>
    <div>
      <!-- <p>earned this period ₪{{ arrivedClassesSum + paidClassesSum }}</p>
      <p>need to be paid ₪{{ arrivedClassesSum }}</p> -->
    </div>
    <!-- <p> ₪ {{ arrivedClassesSum }} / <span class="bold"> {{ paidClassesSum }}</span></p> -->
  </section>
</template>

<script>
import { studentService } from '../services/student.service.local'
import addStudent from '../cmps/addStudent.vue'

export default {
  data() {
    return {
      student: null,
      editable: false,
      classes: [],
      classesForMonth: [],
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      currMonth: new Date().getMonth(),
      currYear: new Date().getFullYear(),
      monthNumber: 0
    }
  },
  async created() {
    const id = this.$route.params.id
    this.student = await studentService.getById(id)
    this.classes = this.student.classes.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('.').map(Number);
      const [dayB, monthB, yearB] = b.date.split('.').map(Number);

      if (yearA !== yearB) {
        return yearA - yearB;
      }
      if (monthA !== monthB) {
        return monthA - monthB;
      }
      return dayA - dayB;
    })
    const classesByMonth = {};
    this.classes.forEach(lesson => {
      const [day, month, year] = lesson.date.split('.').map(Number);
      const monthKey = `${year}-${month}`;
      if (!classesByMonth[monthKey]) {
        classesByMonth[monthKey] = [];
      }
      classesByMonth[monthKey].push(lesson);
    });
    // this.classes = classesByMonth
    console.log(classesByMonth);
    console.log(this.classes);
    this.monthsBackwards(classesByMonth)
  },
  computed: {
    classesSum() {
      this.displayClasses
    },
    calculateClassSum() {
      return (status) => {
        return this.displayClasses.reduce((total, lesson) => {
          if (lesson.status === status) {
            return total + this.student.price;
          } else {
            return total;
          }
        }, 0);
      };
    },
    arrivedClassesSum() {
      return this.calculateClassSum("arrived");
    },
    paidClassesSum() {
      return this.calculateClassSum("paid");
    },
  },
  methods: {
    // displayClasses() {
    //   const classesByMonth = {};
    //   this.classes.forEach(lesson => {
    //     const [day, month, year] = lesson.date.split('.').map(Number);
    //     const monthKey = `${year}-${month}`;
    //     if (!classesByMonth[monthKey]) {
    //       classesByMonth[monthKey] = [];
    //     }
    //     classesByMonth[monthKey].push(lesson);
    //   });
    //   this.monthsBackwards(classesByMonth)
    //   return classesByMonth
    // },
    monthsBackwards(sortedObj, chosenDate = 0) {
      console.log(sortedObj);
      let lessonArray = sortedObj || this.classes
      const keys = Object.keys(lessonArray);
      if (this.monthNumber === 0 && chosenDate === 1 || this.monthNumber <= -(keys.length - 3) && chosenDate === -1) return
      else this.monthNumber += chosenDate
      // const index = keys.indexOf(`${this.currYear}-${this.currMonth + 1}`) + this.monthNumber;
      const index = keys.indexOf(`2024-2`) + this.monthNumber;
      console.log(index);
      if (index !== -1 && index >= 2 && index < keys.length) {
        console.log('hi');
        this.classesForMonth = keys.slice(index - 2, index + 1).map(key => lessonArray[key]);
      } else {
        return [];
      }
    },
    openEdit() {
      this.editable = !this.editable
    },
  },
  components: {
    addStudent
  }
}
</script>