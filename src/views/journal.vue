<template>
  <section class="journal-container container">
    <calendar :parentData="parentData" />
    <day v-if="selectedDay" :day="getStudentsForDay" />
  </section>
</template>

<script>
import calendar from '../cmps/calendar.vue'
import day from '../cmps/day.vue'
import { utilService } from '../services/util.service';

export default {
  data() {
    const currentDate = new Date()
    return {
      selectedDay: null,
      currentYear: currentDate.getFullYear(),
      currentMonth: currentDate.getMonth(),
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
      const students = this.syncLessons(this.dayName, this.selectedDay?.date);
      return {
        fullDate: this.selectedDay?.fullDate,
        dayName: this.dayName,
        students,
      };
    },
    parentData() {
      return {
        currentYear: this.currentYear,
        currentMonth: this.currentMonth,
        showDay: this.showDay,
        syncLessons: this.syncLessons,
        prevMonth: this.prevMonth,
        nextMonth: this.nextMonth,
        fullDate: this.fullDate,
      }
    }
  },
  methods: {
    showDay(day) {
      this.selectedDay = day;
    },
    prevMonth() {
      this.currentMonth -= 1;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear -= 1;
      }
    },
    nextMonth() {
      this.currentMonth += 1;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear += 1;
      }
    },
    fullDate({ day, month, year } = {}) {
      if (!day && !month && !year) {
        return this.selectedDay?.fullDate ||
          `${this.currentDate.getDate()}.${this.currentDate.getMonth() + 1}.${this.currentDate.getFullYear()}`;
      }
      day = day || this.currentDate.getDate();
      month = month || this.currentMonth + 1;
      year = year || this.currentYear;
      return `${day}.${month}.${year}`;
    },
    syncLessons(dayName, date) {
      const singleLesson = this.students.flatMap(student =>
        student.classes
          .filter(lesson => lesson.date === this.fullDate({ day: date }))
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