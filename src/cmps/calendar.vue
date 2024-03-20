<template>
    <section class="calendar-container">
        <div class="calendar-header">
            <button @click="prevMonth">Previous Month</button>
            <h2>{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
            <button @click="nextMonth">Next Month</button>
        </div>
        <table class="calendar">
            <tr>
                <th v-for="day in daysOfWeek" :key="day">{{ day }}</th>
            </tr>
            <tr v-for="week in calendar">
                <td v-for="day in week" :key="day.date" @click="showDay(day)"
                    :class="{ 'today': isToday(day), 'empty-cell': emptyCell(day) }">
                    <p class="calendar-date">{{ day.date ? day.date : '' }}</p>
                    <p class="students-count">{{ day.students?.length  }}</p>
                    <!-- <ul class="students-in-day">
                        <li v-for="student in day.students" :key="student.id">{{ student.name }}</li>
                    </ul> -->
                </td>
            </tr>
        </table>
    </section>
    <!-- <arrivalConfirm @changeStatus="changeStatus"/> -->
</template>
  
<script>
// import arrivalConfirm from '../cmps/arrival-confirm.vue'

export default {
    data() {
        const currentDate = new Date();
        return {
            currentYear: currentDate.getFullYear(),
            currentMonth: currentDate.getMonth(), // Note: Month is zero-indexed (0 for January, 1 for February, etc.)
            daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        };
    },
    created() {
        this.$store.dispatch({ type: "loadStudents" });
    },
    computed: {
        students() {
            return this.$store.getters.students;
        },
        calendar() {
            const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1).getDay();
            const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            let calendar = [];
            let day = 1;

            for (let i = 0; i < 6; i++) {
                let week = [];
                for (let j = 0; j < 7; j++) {
                    if (i === 0 && j < firstDayOfMonth) {
                        week.push({ date: null });
                    } else if (day > daysInMonth) {
                        break;
                    } else {
                        const date = day;
                        const dayName = dayNames[(day + firstDayOfMonth - 1) % 7]; // Calculate day name
                        var studentsForDay = this.getStudentsForDay(dayName);
                        const clonedStudents = studentsForDay.map(student => ({ ...student }));
                        clonedStudents.map(student => student.status = 'pending')
                        week.push({ date, dayName, students: clonedStudents }); // Include day name and students
                        day++;
                    }
                }
                calendar.push(week);
                if (day > daysInMonth) {
                    break;
                }
            }
            return calendar;
        },
    },
    methods: {
        isToday(day) {
            const today = new Date();
            return day.date === today.getDate() && this.currentMonth === today.getMonth() && this.currentYear === today.getFullYear();
        },
        emptyCell(day) {
            return !day.date
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
        showDay(day) {
            if (!day.date) return
            day.month = this.currentMonth
            day.year = this.currentYear
            this.$emit('showDay', day)
        },
        getStudentsForDay(dayName) {
            return this.students.filter(student => {
                return student.day === dayName
            });
        },
        // changeStatus(student){
        //     student.status = true
        // }
    },
    components: {
        // arrivalConfirm
    }
};
</script>
  
<style scoped></style>
  