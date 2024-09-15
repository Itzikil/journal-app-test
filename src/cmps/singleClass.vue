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
        };
    },
    async created() {
        console.log(this.editStudent);
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
            // var lessonsLength = this.editStudent.classes.length
            // if (lessonsLength) {
            //     this.lessonsInfo.push(this.editStudent.classes[lessonsLength - 1])
            // } else {
                this.lessonsInfo.push(studentService.getEmptyClass());
            // }
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
            var currLesson = this.lessonsInfo[0]
            currLesson._id = this.editStudent._id
            currLesson.date = currLesson.day;
            currLesson.status = 'pending'
            delete currLesson.start;
            delete currLesson.day;
            this.editStudent.classes.push(currLesson)
            this.$emit('closeAddSingle');
            try {
                await this.$store.dispatch({ type: "updateStudent", student: this.editStudent })
                showSuccessMsg("You added single class to " + this.editStudent.name)
            } catch (err) {
                console.log(err)
                showErrorMsg(`Cannot change ${student} ${status}`)
            }
        },
    },
};
</script>