<template>
    <section class="add-student-container">
        <form @submit.prevent="addClass()">
            <div v-for="(lesson, idx) in lessonsInfo" class="lessons-info-container">
                <p class="text-center fs12" v-if="idx === 0">Add single lesson</p>
                <label>Lesson day <input type="text" :ref="'lessonDatePicker' + idx" class="custom-date-input"
                        v-model="lessonsInfo[idx].day" required></label>
                <label>Time <input modern-time-input type="time" name="time" :min="startHour" :max="endHour"
                        v-model="lessonsInfo[idx].time" required></label>
                <label>Duration <input type="number" name="duration" v-model="lessonsInfo[idx].duration"
                        placeholder="Minutes" required></label>
                <label>Price <input type="number" name="price" v-model="lessonsInfo[idx].price" placeholder="100 / 200"
                        required></label>
            </div>
            <div class="btn-container">
                <button @click="addLesson" type="button">Add Lesson</button>
                <button @click="removeLesson" type="button">Remove Lesson</button>
            </div>
            <button type="submit">Submit lesson</button>
        </form>
    </section>
</template>

<script>
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service';
import { studentService } from '../services/student.service.local';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { utilService } from '../services/util.service';

export default {
    props: {
        editStudent: {
            type: Object,
        }
    },
    data() {
        return {
            lessonsInfo: [],
            daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            startHour: '',
            endHour: '',
            endHour: '',
            studentClone: utilService.deepClone(this.editStudent)
        };
    },
    async created() {
        if (this.editStudent) var user = await this.$store.dispatch({ type: 'loadAndWatchUser', userId: this.editStudent.teacher._id })
        this.startHour = user.pref.hours?.from
            ? `${user.pref.hours.from < 10 ? '0' : ''}${user.pref.hours.from}:00`
            : '08:00';
        this.endHour = user.pref.hours?.to
            ? `${user.pref.hours.to < 10 ? '0' : ''}${user.pref.hours.to}:00`
            : '20:00';
    },
    mounted() {
        this.addLesson()
    },
    computed: {
    },
    methods: {
        removeLesson() {
            if (this.lessonsInfo.length) this.lessonsInfo.pop()
        },
        addLesson() {
            this.lessonsInfo.push(studentService.getEmptyClass());
            const index = this.lessonsInfo.length - 1;
            this.$nextTick(() => {
                ['joinedDatePicker', 'lessonDatePicker'].forEach(ref => {
                    var currRef = this.$refs[ref + index];
                    if (currRef) this.addFlatPickr(currRef)
                })
            })
        },
        addFlatPickr(ref) {
            if (ref) { flatpickr(ref, { dateFormat: 'j.n.Y' }) }
        },
        async addClass(student) {
            this.lessonsInfo.forEach((lesson, idx) => {
                lesson.date = lesson.day
                delete lesson.day
                delete lesson.start
                lesson.status = 'pending'
                this.studentClone.classes.push(lesson)
            })
            try {
                await this.$store.dispatch({ type: "updateStudent", student: this.studentClone })
                showSuccessMsg("You added single class to " + this.studentClone.name)
                this.$emit('toggleAddSingle');
            } catch (err) {
                console.log(err)
                showErrorMsg(`Cannot change ${student} ${status}`)
            }
        },
    },
};
</script>