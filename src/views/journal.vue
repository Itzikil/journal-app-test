<template>
  <section class="journal-container container">
    <calendar @showDay="showDay" :sync-lessons="syncLessons" :fullDate="fullDate"/>
    <day v-if="selectedDay" :day="getStudentsForDay" />
  </section>
</template>

<script>
import calendar from '../cmps/calendar.vue'
import day from '../cmps/day.vue'
import { utilService } from '../services/util.service';

export default {
  data() {
    return {
      selectedDay: null,
      currentDate: new Date(),
    };
  },
  computed: {
    students() {
      return this.$store.getters.students;
    },
    daysOfWeek() {
      return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    dayName() {
      return this.selectedDay?.dayName || this.daysOfWeek[this.currentDate.getDay()];
    },
    getStudentsForDay() {
      const date = this.selectedDay?.fullDate || this.fullDate();
      const students = this.syncLessons(this.dayName, date);
      return {
        fullDate: date,
        dayName: this.dayName,
        students,
      };
    },
  },
  methods: {
    showDay(day) {
      this.selectedDay = day;
    },
    fullDate({ day, month, year } = {}) {
      if (!day && !month && !year) {
        return this.selectedDay?.fullDate || `${this.currentDate.getDate()}.${this.currentDate.getMonth() + 1}.${this.currentDate.getFullYear()}`;
      }
      day = day || this.currentDate.getDate();
      month = month || this.currentDate.getMonth() + 1;
      year = year || this.currentDate.getFullYear();
      return `${day}.${month}.${year}`;
    },
    syncLessons(dayName, date) {
      const singleLesson = this.students.flatMap(student =>
        student.classes
          .filter(lesson => lesson.date === date)
          .map(lesson => ({ ...lesson, _id: student._id, name: student.name }))
      );
      const todayStudents = this.getStudentsByDate(dayName, date);
      singleLesson.forEach(lesson => {
        const existingIndex = todayStudents.findIndex(existingLesson =>
          existingLesson._id === lesson._id && existingLesson.time === lesson.time
        );
        if (existingIndex !== -1) {
          todayStudents[existingIndex].status = lesson.status;
          todayStudents[existingIndex].note = lesson.note;
        } else {
          todayStudents.push(lesson);
        }
      });
      return todayStudents;
    },
    getStudentsByDate(dayName, date) {
      return this.students.reduce((acc, student) => {
        if (student.lessonsInfo) {
          const lessonsForDay = student.lessonsInfo.filter(lesson =>
            lesson.day === dayName && utilService.biggerDate(lesson.start, this.fullDate({ day: date }))
          );
          lessonsForDay.forEach(lesson => {
            acc.push({
              _id: student._id,
              name: student.name,
              ...lesson
            });
          });
        }
        return acc;
      }, []);
    },
  },
  components: {
    calendar,
    day
  }
};
</script>