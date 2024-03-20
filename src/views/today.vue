<template>
    <section class="today-container container">
        <h1>Today</h1>
        <day :day="getStudentsForDay" />
    </section>
</template>

<script>
import day from '../cmps/day.vue'
export default {
    data() {
        return {
            currentDate: new Date()
        }
    },
    created() {
        this.$store.dispatch({ type: "loadStudents" });
        console.log(this.currentDate);
    },
    computed: {
        students() {
            return this.$store.getters.students;
        },
        getStudentsForDay() {
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayIndex = this.currentDate.getDay();
            const dayName = daysOfWeek[dayIndex];
            var students = this.students.filter(student => { return student.day === dayName });
            return {
                date: this.currentDate.getDate(),
                dayName,
                month: this.currentDate.getMonth(),
                year: this.currentDate.getFullYear(),
                students
            }
        },
    },
    methods: {
    },
    components: {
        day
    }
}
</script>