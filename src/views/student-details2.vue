<template>
    <section v-if="student" class="student-details-container container">
        <div class="student-card">
            <h1>Student Details - {{ student.name }}</h1>
            <div>
                <p>Teacher</p>
                <p>{{ student.teacher.name }}</p>
            </div>
            <div v-for="(lesson, index) in student.lessonsInfo" :key="index" class="flex column">
                <div>
                    <p>Time</p>
                    <p>{{ lesson.time }} {{ lesson.day }}'s</p>
                </div>
                <div>
                    <p>Duration</p>
                    <p>{{ lesson.duration }} min</p>
                </div>
                <div>
                    <p>Price</p>
                    <p>₪{{ lesson.price }}</p>
                </div>
            </div>
            <button @click="openEdit">Edit</button>
        </div>

        <addStudent v-if="editCmp" :editStudent="student" @closeEdit="closeEdit" />

        <div class="last-lessons">
            <div class="btn-container">
                <button @click="changeMonth(1)">&lt;</button>
                <h3>Last months</h3>
                <button @click="changeMonth(-1)">></button>
            </div>

            <div v-if="student.classes" class="lessons-list">
                <ul v-for="(lessons, idx) in slicedClasses" :key="idx" class="lesson-list">
                    <div class="monthly-header">
                        <h4 class="text-center">{{ getMonthName(lessons[0].date) }}</h4>
                        <button @click.stop="updateMonthlyLessons(lessons[0].date)">
                            <img src="../assets/imgs/paid.svg" alt="paid" />
                        </button>
                    </div>
                    <div v-for="lesson in lessons" :key="lesson.date" class="lesson-item">
                        <div class="edit-lesson">
                            <button @click="deleteLesson(lesson)">
                                <img src="../assets/imgs/delete.svg" alt="delete" />
                            </button>
                            <button @click="editLesson(lesson)">
                                <img src="../assets/imgs/edit.svg" alt="edit" />
                            </button>
                            <button @click="toggleLessonNote(lesson)">
                                <img src="../assets/imgs/note.svg" alt="note" />
                            </button>
                        </div>
                        <p>{{ lesson.date }}</p>
                        <div class="btns-container">
                            <button @click.stop="updateLesson(lesson, 'hevriz')">
                                <img src="../assets/imgs/hevriz.svg" alt="didnt come"
                                    :class="activeStatus(lesson.status, 'hevriz')" />
                            </button>
                            <button @click.stop="updateLesson(lesson, 'arrived')">
                                <img src="../assets/imgs/arrived.svg" alt="arrived"
                                    :class="activeStatus(lesson.status, 'arrived')" />
                            </button>
                            <button @click.stop="updateLesson(lesson, 'paid')">
                                <img src="../assets/imgs/paid.svg" alt="paid"
                                    :class="activeStatus(lesson.status, 'paid')" />
                            </button>
                        </div>
                    </div>
                </ul>
            </div>
            <p v-else>No classes yet</p>
        </div>

        <div v-if="lessonNote" class="add-student-container">
            <p>Lesson note</p>
            <form @submit.prevent="updateNoteLesson">
                <textarea v-model="lessonNote.note"></textarea>
                <button>Save</button>
                <button @click="lessonNote = ''" type="button">Close</button>
            </form>
        </div>

        <button @click="toggleAddSingle">{{ addSingleOpen ? 'Close' : 'Add' }} single lesson</button>
        <singleClass v-if="addSingleOpen" :editStudent="student" @closeAddSingle="closeAddSingle" />

        <div v-if="lessonToEdit" class="add-student-container">
            <form @submit.prevent="updateLesson">
                <p class="text-center">Edit lesson</p>
                <label>Day <input type="text" v-model="lessonToEdit.date" /></label>
                <label>Time <input type="text" v-model="lessonToEdit.time" /></label>
                <label>Duration <input type="number" v-model="lessonToEdit.duration" /></label>
                <label>Price <input type="number" v-model="lessonToEdit.price" /></label>
                <button>Save</button>
                <button @click="lessonToEdit = ''" type="button">Close</button>
            </form>
        </div>
    </section>
</template>

<script>
import { utilService } from '../services/util.service'
import { studentService } from '../services/student.service.local'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'
import addStudent from '../cmps/addStudent.vue'
import singleClass from '../cmps/singleClass.vue'

export default {
    data() {
        return {
            addSingleOpen: false,
            student: null,
            editCmp: false,
            classesForDisplay: [],
            monthNumber: 0,
            lessonToEdit: '',
            lessonNote: '',
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        }
    },
    async created() {
        const id = this.$route.params.id
        this.student = await studentService.getById(id)
        this.groupClassesByMonth()
    },
    computed: {
        classes() {
            return utilService.sortByDate(this.student.classes, 'backwards')
        },
        slicedClasses() {
            return this.classesForDisplay.slice(this.monthNumber, this.monthNumber + 2)
        }
    },
    methods: {
        async updateMonthlyLessons(month) {
            const [, monthWanted] = month.split('.')
            const monthlyLessons = this.student.classes.filter(lesson => {
                const [, monthStr] = lesson.date.split('.')
                return monthWanted === monthStr && lesson.status === 'arrived'
            })
            try {
                await Promise.all(monthlyLessons.map(lesson => this.updateLesson(lesson, 'paid')))
                showSuccessMsg(`All arrived ${this.monthNames[monthWanted - 1]} lessons are paid`)
            } catch (err) {
                showErrorMsg("Error updating lessons")
            }
        },
        groupClassesByMonth() {
            const groupedClasses = this.student.classes.reduce((acc, cls) => {
                const [, month, year] = cls.date.split('.')
                const monthKey = `${parseInt(month)}.${year}`
                if (!acc[monthKey]) acc[monthKey] = []
                acc[monthKey].push(cls)
                return acc
            }, {})
            this.classesForDisplay = Object.values(groupedClasses)
        },
        getMonthName(monthKey) {
            const [, month, year] = monthKey.split('.')
            return `${this.monthNames[month - 1]} ${year}`
        },
        changeMonth(idx) {
            const newMonth = this.monthNumber + idx
            if (newMonth >= 0 && newMonth < this.classesForDisplay.length - 1) {
                this.monthNumber = newMonth
            }
        },
        toggleLessonNote(lesson) {
            this.lessonNote = this.lessonNote._id === lesson._id ? '' : lesson
        },
        activeStatus(currentStatus, targetStatus) {
            return currentStatus === targetStatus ? 'active-status' : ''
        },
        async updateLesson(lesson, status) {
            if (status && lesson.status === status) return
            lesson.status = status || lesson.status
            const studentClone = { ...this.student }
            const index = studentClone.classes.findIndex(c => c.date === lesson.date)
            studentClone.classes.splice(index, 1, lesson)
            try {
                await this.$store.dispatch({ type: 'updateStudent', student: studentClone })
                showSuccessMsg(`${studentClone.name} updated successfully`)
                this.lessonToEdit = ''
            } catch (err) {
                showErrorMsg("Error updating lesson")
            }
        },
        async deleteLesson(lesson) {
            const studentClone = { ...this.student }
            const index = studentClone.classes.findIndex(c => c.date === lesson.date)
            studentClone.classes.splice(index, 1)
            try {
                await this.$store.dispatch({ type: 'updateStudent', student: studentClone })
                showSuccessMsg(`${studentClone.name} updated successfully`)
            } catch (err) {
                showErrorMsg("Error updating lesson")
            }
        },
        editLesson(lesson) {
            this.lessonToEdit = lesson
        },
        toggleAddSingle() {
            this.addSingleOpen = !this.addSingleOpen
        },
        openEdit() {
            this.editCmp = true
        },
        closeEdit() {
            this.editCmp = false
        },
        closeAddSingle() {
            this.addSingleOpen = false
        },
        updateNoteLesson() {
            this.updateLesson(this.lessonNote)
            this.lessonNote = ''
        }
    },
    components: {
        addStudent,
        singleClass
    }
}
</script>