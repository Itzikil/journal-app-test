<template>
    <section class="calendar-container">
        <div class="calendar-header">
            <button @click="prevMonth"><img src="../assets/imgs/left-arrow.svg" alt=""></button>
            <h2>{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
            <button @click="nextMonth"><img src="../assets/imgs/right-arrow.svg" alt=""></button>
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
import { utilService } from '../services/util.service';
export default {
    data() {
        const currentDate = new Date();
        return {
            currentYear: currentDate.getFullYear(),
            currentMonth: currentDate.getMonth(), // Note: Month is zero-indexed (0 for January, 1 for February, etc.)
            daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            dayShown: '',
        };
    },
    created() {

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
                        var studentsForDay = this.syncLessons(dayName, date);
                        const clonedStudents = studentsForDay.map(student => ({ ...student }));
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
        fullDate({ day, month, year }) {
            if (!day) day = new Date().getDate()
            if (!month) month = this.currentMonth + 1
            if (!year) year = this.currentYear
            return `${day}.${month}.${year}`
        },
        showDay(day) {
            if (!day.date) return
            day.fullDate = this.fullDate({ day: day.date })
            this.$emit('showDay', day)
            this.dayShown = day
        },
        chosenDay(day) {
            if (!day.date) return
            return this.fullDate({ day: day.date }) === this.dayShown.fullDate
        },
        getStudentsForDay(dayName, date) {
            return this.students.reduce((acc, student) => {
                if (student.lessonsInfo) {
                    const lessonsForDay = student.lessonsInfo.filter(lesson => lesson.day === dayName && utilService.biggerDate(lesson.start, this.fullDate({ day: date })))
                    if (lessonsForDay.length > 0) {
                        for (let i = 0; i < lessonsForDay.length; i++) {
                            acc.push({
                                _id: student._id,
                                name: student.name,
                                ...lessonsForDay[i]
                            });
                        }
                    }
                }
                return acc;
            }, []);
        },
        syncLessons(dayName, date) {
            var singleLesson = this.students.flatMap(student =>
                student.classes
                    .filter(lesson => lesson.date === this.fullDate({ day: date }))
                    .map(lesson => ({ ...lesson, _id: student._id, name: student.name }))
            );
            var todayStudents = this.getStudentsForDay(dayName, date)
            singleLesson.forEach(lesson => {
                const existingIndex = todayStudents.findIndex(existingLesson =>
                    existingLesson._id === lesson._id && existingLesson.time === lesson.time
                );
                if (existingIndex !== -1) todayStudents[existingIndex].status = lesson.status;
                else todayStudents.push(lesson);
            });
            return todayStudents
        },
    },
    components: {
    }
};
</script>