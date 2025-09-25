<template>
    <section class="today-container container">
        <h2>Today</h2>
        <day :day="getStudentsForDay" />
    </section>
</template>

<script>
import day from '../cmps/day.vue'
import { utilService } from '../services/util.service';

export default {
    data() {
        return {
            currentDate: new Date(),
        }
    },
    created() {
        this.$store.dispatch({ type: "loadStudents" });
    },
    computed: {
        students() {
            return this.$store.getters.students;
        },
        daysOfWeek() {
            return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        fullDate() {
            return `${this.currentDate.getDate()}.${this.currentDate.getMonth() + 1}.${this.currentDate.getFullYear()}`
        },
        dayName() {
            return this.daysOfWeek[this.currentDate.getDay()]
        },
        getStudentsForDay() {
            // var students = this.students.filter(student => { return student.day === this.dayName && utilService.biggerDate(student.start, this.fullDate) });
            var students = this.syncLessons
            return {
                fullDate: this.fullDate,
                dayName: this.dayName,
                students
            }
        },
        syncLessons() {
            var singleLesson = this.students.flatMap(student =>
                student.classes
                    .filter(lesson => lesson.date === this.fullDate)
                    .map(lesson => ({ ...lesson, _id: student._id, name: student.name }))
            );

            var todayStudents = this.getStudentsByDate
            singleLesson.forEach(lesson => {
                const existingIndex = todayStudents.findIndex(existingLesson =>
                    existingLesson._id === lesson._id && existingLesson.time === lesson.time
                );
                if (lesson.hide) {
                    todayStudents.splice(existingIndex, 1)
                    return
                }

                if (existingIndex !== -1) {
                    todayStudents[existingIndex].status = lesson.status;
                    todayStudents[existingIndex].note = lesson.note;
                }
                else todayStudents.push(lesson);
            });
            console.log(todayStudents);
            return todayStudents
        },
        getStudentsByDate() {
            return this.students.reduce((acc, student) => {
                if (student.lessonsInfo) {
                    const lessonsForDay = student.lessonsInfo.filter(lesson => lesson.day === this.dayName && utilService.biggerDate(lesson.start, this.fullDate))
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
    },
    methods: {
    },
    components: {
        day
    }
}
</script>