<template>
    <section class="day-container container">
        <p class="day-header">{{ day.dayName }} {{ day.fullDate }}</p>
        <div class="hour" v-for="hour in hours" :key="hour">
            <div class="hour-label">{{ hour }}:00</div>
            <button class="student-slot student" v-for="(lesson, idx) in studentsByHour[hour]" :key="lesson.id"
                :style="calculateStudentStyle(lesson, idx)" @click="showLesson(lesson)">
                <p>{{ lesson.name }}</p>
                <div class="btns-container">
                    <button @click.stop="addClass(lesson, 'hevriz')">
                        <img src="../assets/imgs/hevriz.svg" alt="didnt come" :class="activeStatus(lesson, 'hevriz')">
                    </button>
                    <button @click.stop="addClass(lesson, 'arrived')">
                        <img src="../assets/imgs/arrived.svg" alt="arrived" :class="activeStatus(lesson, 'arrived')">
                    </button>
                    <button @click.stop="addClass(lesson, 'paid')">
                        <img src="../assets/imgs/paid.svg" alt="paid" :class="activeStatus(lesson, 'paid')">
                    </button>
                </div>
            </button>
        </div>
        <div v-if="lessonShown" class="lesson-info" @click="closeLesson()">
            <p>{{ lessonShown.name }}</p>
            <p>{{ lessonShown.time }} - {{ calculateEndTime(lessonShown.time, lessonShown.duration) }}</p>
        </div>
    </section>
</template>

<script>
import { showSuccessMsg } from '../services/event-bus.service'
import { studentService } from '../services/student.service.local';
import { utilService } from '../services/util.service'

export default {
    props: {
        day: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            lessonShown: '',
            user: null,
            students: this.$store.getters.students
        }
    },
    async created() {
        const userId = this.$store.getters.loggedinUser?._id;
        if (userId) this.user = await this.$store.dispatch({ type: 'loadAndWatchUser', userId })
        // console.log(this.day);
    },
    watch: {
        day(newValue, oldValue) {
            this.lessonShown = ''

        },
    },
    computed: {
        hours() {
            const startHour = +this.user?.pref.hours?.from || 8
            const endHour = +this.user?.pref.hours?.to || 20
            return Array.from({ length: endHour - startHour + 1 }, (_, i) => `${startHour + i}`)
        },
        studentsByHour() {
            const studentsByHour = {}
            if (this.day.students) {
                for (const student of this.day.students) {
                    const startTime = parseInt(student.time?.split(':')[0])
                    if (!studentsByHour[startTime]) {
                        studentsByHour[startTime] = []
                    }
                    studentsByHour[startTime].push(student)
                }
            }
            return studentsByHour
        },
    },
    methods: {
        calculateStudentStyle(student) {
            const startMinute = parseInt(student.time.split(':')[1])
            const lessonDuration = student.duration // Duration of lesson in minutes
            const slotHeight = (100 / 12) * (startMinute / 5) // Height of each 5-minute slot
            const marginTop = slotHeight // Calculate top margin for start time
            const height = lessonDuration * 1.6666666666 // Calculate height for lesson duration
            return {
                top: `${marginTop}%`,
                height: `${height}%`
            }
        },
        async addClass(student, status) {
            var todayClass = { date: this.day.fullDate, status, price: student.price, _id: student._id, time: student.time, duration: student.duration }
            let currStudent = await studentService.getById(student._id)
            var studentClone = utilService.deepClone(currStudent)

            const existingIndex = studentClone.classes.findIndex((c) => c.date === todayClass.date)
            if (existingIndex !== -1 && studentClone.classes[existingIndex].status === todayClass.status) {
                return console.log('same')
            }
            else if (existingIndex !== -1) {
                studentClone.classes.splice(existingIndex, 1, todayClass)
            } else {
                studentClone.classes.push(todayClass)
            }

            try {
                await this.$store.dispatch({ type: "updateStudent", student: studentClone })
                showSuccessMsg(student.name + " " + status)
            } catch (err) {
                console.log(err)
                showErrorMsg(`Cannot change ${student} ${status}`)
            }
        },
        activeStatus(lesson, status) {
            if (lesson.status === status) return 'active-status'
        },
        showLesson(student) {
            this.lessonShown = this.lessonShown._id === student._id ? '' : student
        },
        closeLesson() {
            this.lessonShown = ''
        },
        calculateEndTime(startTime, duration) {
            const [startHour, startMinute] = startTime.split(':').map(Number)
            let endHour = startHour + Math.floor((startMinute + duration) / 60)
            let endMinute = (startMinute + duration) % 60
            const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
            return endTime
        },
    }
}
</script>