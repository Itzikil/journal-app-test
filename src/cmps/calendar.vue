<template>
    <section class="calendar-container">
        <div class="calendar-header">
            <button @click="parentData.prevMonth()"><img src="../assets/imgs/left-arrow.svg" alt=""></button>
            <h2>{{ monthNames[parentData.currentMonth] }} {{ parentData.currentYear }}</h2>
            <button @click="parentData.nextMonth()"><img src="../assets/imgs/right-arrow.svg" alt=""></button>
        </div>

        <table class="calendar">
            <tr>
                <th v-for="day in daysOfWeek" :key="day">{{ day }}</th>
            </tr>
            <tr v-for="week in calendar">
                <td v-for="day in week" :key="day.date" @click="showDay(day)"
                    :class="{ 'today': isToday(day), 'empty-cell': emptyCell(day), 'chosen-day': chosenDay(day) }">
                    <p class="calendar-date">{{ day.date ? day.date : '' }}</p>
                    <p class="students-count">{{ day.students?.length }}</p>
                </td>
            </tr>
        </table>
    </section>
</template>

<script>
export default {
    props: {
        parentData: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            dayShown: '',
        };
    },
    created() { },
    computed: {
        students() {
            return this.$store.getters.students;
        },
        calendar() {
            const firstDayOfMonth = new Date(this.parentData.currentYear, this.parentData.currentMonth, 1).getDay();
            const daysInMonth = new Date(this.parentData.currentYear, this.parentData.currentMonth + 1, 0).getDate();
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
                        const dayName = dayNames[(day + firstDayOfMonth - 1) % 7];
                        var studentsForDay = this.parentData.syncLessons(dayName, date);
                        const clonedStudents = studentsForDay.map(student => ({ ...student }));
                        week.push({ date, dayName, students: clonedStudents });
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
        emptyCell(day) {
            return !day.date
        },
        isToday(day) {
            const today = new Date();
            return day.date === today.getDate() && this.parentData.currentMonth === today.getMonth() && this.parentData.currentYear === today.getFullYear();
        },
        chosenDay(day) {
            if (!day.date) return
            return this.parentData.fullDate({ day: day.date }) === this.dayShown.fullDate
        },
        showDay(day) {
            if (!day.date) return
            day.fullDate = this.parentData.fullDate({ day: day.date })
            this.parentData.showDay(day)
            this.dayShown = day
        },
    },
};
</script>