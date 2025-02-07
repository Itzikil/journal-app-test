<template>
    <section v-if="!loading" class="day-container container">
        <div class="day-top-header">
            <!-- <h2>Today</h2> -->
            <p class="day-header"><span class="fs14">{{ day.dayName }}</span> {{ day.fullDate }}</p>
        </div>

        <div class="flex gap20 align-center justify-space">
            <div class="flex gap10">
                <p class="fs16">Revenue</p>
                <div class="flex align-center">
                    <p class="fs10">{{ revenue }}</p>
                    <p class="fs12"> /{{ maxRevenue }}</p>
                </div>
            </div>
            <div class="btns-container">
                <button @click.stop="markAllLessons('hevriz')">
                    <img src="../assets/imgs/hevriz.svg" alt="didnt come" class="">
                </button>
                <button @click.stop="markAllLessons('arrived')">
                    <img src="../assets/imgs/arrived.svg" alt="arrived" class="">
                </button>
                <button @click.stop="markAllLessons('paid')">
                    <img src="../assets/imgs/paid-white.svg" alt="paid" class="">
                </button>
            </div>
        </div>

        <div class="hour" v-for="hour in hours" :key="hour">
            <div class="hour-label">{{ hour }}:00</div>
            <button class="student-slot student" v-for="(lesson, idx) in studentsByHour[hour]" :key="lesson.id"
                :style="calculateStudentStyle(lesson, idx)" @click="showLesson(lesson)">
                <img v-if="lesson.note" :src="greenNoteImage" alt="note" class="note-img">
                <p>{{ lesson.name }}</p>
                <div class="btns-container">
                    <button @click.stop="addClass(lesson, 'hevriz')">
                        <img src="../assets/imgs/hevriz.svg" alt="didnt come" :class="activeStatus(lesson, 'hevriz')">
                    </button>
                    <button @click.stop="addClass(lesson, 'arrived')">
                        <img src="../assets/imgs/arrived.svg" alt="arrived" :class="activeStatus(lesson, 'arrived')">
                    </button>
                    <button @click.stop="addClass(lesson, 'paid')">
                        <img src="../assets/imgs/paid-white.svg" alt="paid" :class="activeStatus(lesson, 'paid')">
                    </button>
                </div>
            </button>
        </div>
        <div v-if="lessonShown" class="lesson-info">
            <button @click="closeLesson()" class="close--lesson-btn">X</button>
            <router-link :to="`/student/${lessonShown._id}`">{{ lessonShown.name }}</router-link>
            <p>{{ lessonShown.time }} - {{ calculateEndTime(lessonShown.time, lessonShown.duration) }}</p>
            <textarea class="note-input" rows="2" v-model="lessonNote" placeholder="note"></textarea>
            <button @click.stop="addClass()">Save Note</button>
        </div>
    </section>
    <section v-else class="main-loader">
        <div style="border-radius: 20px;overflow: hidden;">
            <img src="../assets/imgs/page-‏‏loader.gif" alt="" style="overflow: hidden;">
        </div>
    </section>
</template>

<script>
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { studentService } from '../services/student.service.local';
import { utilService } from '../services/util.service'
import greenNoteImg from '@/assets/imgs/green-note.svg'


export default {
    props: {
        day: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            loading: true,
            user: null,
            lessonShown: '',
            lessonNote: ''
        }
    },
    async created() {
        const userId = this.$store.getters.loggedinUser?._id;
        if (userId) this.user = await this.$store.dispatch({ type: 'loadAndWatchUser', userId })
        this.loading = false
    },
    watch: {
        day(newValue, oldValue) {
            this.lessonShown = ''
        },
    },
    computed: {
        activeStatus() {
            return (lesson, status) => {
                return lesson.status === status ? 'active-status' : '';
            };
        },
        students() {
            return this.$store.getters.students
        },
        hours() {
            const startHour = +this.user?.pref.hours?.from || 8
            const endHour = +this.user?.pref.hours?.to - 1 || 20
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
        maxRevenue() {
            return this.day.students.reduce((acc, student) => student.price + acc, 0)
        },
        revenue() {
            return this.day.students.reduce((acc, student) => (student.status === 'paid' || student.status === 'arrived') ? student.price + acc : acc, 0)
        },
        greenNoteImage() {
            return greenNoteImg
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
            let hereForChangeNote = false;
            let note; // Declare note here

            if (!student) {
                student = this.lessonShown;
                status = !student.status || student.status === 'pending' ? 'pending' : student.status;
                note = this.lessonNote;
                hereForChangeNote = true;
            }

            const currStudent = await studentService.getById(student._id);
            const studentClone = utilService.deepClone(currStudent);
            const existingIndex = studentClone.classes.findIndex(c => c.date === this.day.fullDate && c.time === student.time);

            if (existingIndex !== -1 && studentClone.classes[existingIndex].status === status && !hereForChangeNote) {
                console.log('same');
                return
            }

            const todayClass = {
                date: this.day.fullDate,
                status,
                price: student.price,
                _id: student._id,
                time: student.time,
                duration: student.duration,
                note: note ? note : student.note
            };

            if (existingIndex !== -1) {
                studentClone.classes[existingIndex] = todayClass;
            } else {
                studentClone.classes.push(todayClass);
            }

            try {
                await this.$store.dispatch({ type: "updateStudent", student: studentClone });
                showSuccessMsg(hereForChangeNote ? `Added note to ${student.name}` : `${student.name} ${status}`);
                if (this.lessonShown) this.lessonShown = '';
            } catch (err) {
                console.error(err);
                showErrorMsg(`Cannot change ${student.name} ${status}`);
            }
        },
        // activeStatus(lesson, status) {
        //     if (lesson.status === status) return 'active-status'
        // },
        showLesson(student) {
            if (this.lessonShown._id === student._id && this.lessonShown.time === student.time) {
                this.lessonShown = ''
            } else {
                this.lessonShown = student
                var matchedStudent = this.students.find(s => s._id === student._id)
                let currLesson = matchedStudent.classes.find(cls => cls.date === this.day.fullDate && cls.time === student.time)
                this.lessonNote = currLesson?.note ?? ''
            }
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
        async markAllLessons(status) {
            this.day.students.forEach(student => this.addClass(student, status))
            return
            const todayClassTemplate = {
                date: this.day.fullDate,
                status
            };
            try {
                const updatedStudents = this.day.students.map(async (student) => {
                    let studentData = student.classes ? student : await studentService.getById(student._id);
                    const studentClone = utilService.deepClone(studentData);
                    const todayClass = {
                        ...todayClassTemplate,
                        _id: studentClone._id,
                        price: studentClone.lessonsInfo[0].price,
                        time: studentClone.lessonsInfo[0].time,
                        duration: studentClone.lessonsInfo[0].duration,
                    };

                    const existingIndex = studentClone.classes.findIndex((c) => c.date === todayClass.date);

                    if (existingIndex !== -1) {
                        if (studentClone.classes[existingIndex].status !== todayClass.status) {
                            studentClone.classes.splice(existingIndex, 1, todayClass);
                        }
                    } else {
                        studentClone.classes.push(todayClass);
                    }

                    return studentClone;
                });

                // Dispatch the batch update to the store
                await this.$store.dispatch({ type: "updateMultipleStudents", students: updatedStudents });
                showSuccessMsg("All lessons updated successfully!");
            } catch (err) {
                console.error("Error updating lessons:", err);
                showErrorMsg("Failed to update all lessons.");
            }
        }
    }
}
</script>