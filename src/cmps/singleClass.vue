<template>
    <section class="add-student-container">
        <form @submit.prevent="addClass()">
            <div v-for="(lesson, idx) in lessonsInfo" class="lessons-info-container">
                <div>
                    <p class="text-center fs12" v-if="idx === 0">Add single lesson</p>
                    <label>Lesson day <input type="text" :ref="'lessonDatePicker' + idx" class="custom-date-input"
                            v-model="lessonsInfo[idx].day" required></label>
                </div>
                <label>Time <input modern-time-input type="time" name="time" min="08:00" max="20:00"
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
        };
    },
    created() {
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
            var currLesson = this.lessonsInfo[0]
            currLesson._id = this.editStudent._id
            currLesson.date = currLesson.day;
            currLesson.status = 'pending'
            delete currLesson.start;
            delete currLesson.day;
            this.editStudent.classes.push(currLesson)
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