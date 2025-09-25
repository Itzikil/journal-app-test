<template>
    <section class="charts-container">
        <div class="chart-header">
            <button @click="changeMonth(-1)"><img src="../assets/imgs/left-arrow.svg" alt="left arrow"></button>
            <h3>{{ chartData.currentYear }}</h3>
            <h3 v-if="monthPicked"> {{ chartData.monthNames[monthPicked - 1] }}</h3>
            <button @click="changeMonth(1)"><img src="../assets/imgs/right-arrow.svg" alt="right arrow"></button>
        </div>
        <div class="table-container">
            <table>
                <!-- <thead>
                    <tr>
                        <th></th>
                        <th v-if="!monthPicked" v-for="month in fourMonths" :key="month">
                            <button @click="pickMonth(month)">{{ month.name }}</button>
                        </th>
                        <th v-else v-for="week in [1, 2, 3, 4, 5]" :key="week">
                            <p>{{ week }}</p>
                        </th>
                    </tr>
                </thead> -->
                <tableHeader :isMonthPicked="monthPicked" :fourMonths="fourMonths" :weeks="[1, 2, 3, 4, 5]"
                    @monthSelected="pickMonth" />
                <tbody>
                    <!-- <tr v-for="student in studentsByMonth" :key="student._id">
                        <td class="student-name" :class="{ expanded: expandStudent === student._id }"
                            @click="onExpandStudent(student._id)">
                            <p>{{ student.name }}</p>
                        </td>
                        <td v-if="!monthPicked" v-for="month in fourMonths" :key="month">
                            <p class="fs14">{{ chartData.sumPaidThisMonth(student, monthOrYear(month.number))
                                + chartData.sumArrivedThisMonth(student, monthOrYear(month.number)) }}
                            </p>
                        </td>
                        <td v-else v-for="(lessons, idx) in weeklyPrice(student)">
                            <p v-for="lesson in lessons" class="fs14">{{ lesson.price }}</p>
                        </td>
                    </tr> -->
                    <tableRow v-for="student in studentsByMonth" :key="student._id" :student="student"
                        :isMonthPicked="monthPicked" :fourMonths="fourMonths" :weeklyData="weeklyPrice(student)"
                        :expandStudent="expandStudent" :chartData="chartData" :monthOrYear="monthOrYear"
                        @toggleExpand="onExpandStudent" />
                    <tr class="total-line">
                        <td>
                            <p>Total</p>
                        </td>
                        <template v-if="!monthPicked">
                            <td v-for="month in fourMonths" :key="month">
                                <p class="fs16">{{ month.earning }}</p>
                            </td>
                            <td> <!-- NEW -->
                                <p class="fs16">
                                    {{fourMonths.reduce((acc, m) => acc + m.earning, 0)}}
                                </p>
                            </td>
                        </template>
                        <td v-else v-for="(week, idx) in weeks" :key="idx">
                            <p class="fs16">{{ week }}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <button v-if="monthPicked" @click="monthPicked = 0">Back to 4 months</button>
    </section>
</template>

<script>
import { utilService } from '../services/util.service';
import tableHeader from './tableHeader.vue';
import tableRow from './tableRow.vue';

export default {
    props: {
        fourMonths: Array,
        chartData: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            monthPicked: 0,
            weeks: [0, 0, 0, 0, 0],
            expandStudent: '',
        }
    },
    created() {
        if (this.monthPicked !== '') {
            this.updateWeeklyPrices();
        }
    },
    computed: {
        students() {
            return this.$store.getters.students;
        },
        studentsByMonth() {
            const lastDayOfMonth = `${new Date(this.chartData.currentYear, this.chartData.currentMonth + 1, 0).getDate()}.${this.chartData.currentMonth + 1}.${this.chartData.currentYear}`;

            // Helper function to check if a lesson is within the desired month range (up to 3 months before)
            const isWithinMonthRange = (lesson) => {
                const lessonMonth = utilService.extractDatePart(lesson.date, 'month');
                const lessonYear = utilService.extractDatePart(lesson.date, 'year');
                if (this.monthPicked > 0) {
                    return lessonMonth === this.chartData.currentMonth + 1 && lessonYear === this.chartData.currentYear
                } else {
                    const monthDifference = (lessonYear - this.chartData.currentYear) * 12 + (lessonMonth - (this.chartData.currentMonth + 1));
                    return monthDifference <= 0 && monthDifference >= -3;
                }
            };

            return this.students.filter(student => {
                const firstLesson = student.lessonsInfo[0];

                // Check if student's first lesson exists and falls within the valid date range
                if (firstLesson && utilService.biggerDate(firstLesson.start, lastDayOfMonth)) {
                    return true;
                }

                // Check if any class of the student is within the desired month range
                return student.classes.some(isWithinMonthRange);
            });
        }
    },
    methods: {
        monthOrYear(month) {
            if (this.chartData.currentMonth >= 0 && this.chartData.currentMonth <= 2 && month > 3) {
                return `${month}.${this.chartData.currentYear - 1}`
            }
            else return month
        },
        pickMonth(month) {
            this.chartData.changeMonth(month)
            this.monthPicked = month.number
            this.updateWeeklyPrices();
        },
        changeMonth(num) {
            if (num === 1) {
                this.chartData.nextMonth();
            } else {
                this.chartData.prevMonth();
            }
            if (this.monthPicked !== 0) {
                if (num === 1 && this.monthPicked === 12) {
                    this.monthPicked = 0
                } else if (num === -1 && this.monthPicked === 1) {
                    this.monthPicked = 13
                }
                this.monthPicked += num;
                this.updateWeeklyPrices();
            }
        },
        updateWeeklyPrices() {
            this.weeks = [0, 0, 0, 0, 0];
            this.students.forEach(student => {
                const weeklyLessons = this.groupLessonsByWeek(this.chartData.classesInMonth(student, this.monthPicked));
                this.weeks = this.weeks.map((num, idx) => {
                    const lesson = weeklyLessons[idx][0];
                    return lesson?.price ? lesson.price + num : num;
                });
            });
        },
        groupLessonsByWeek(monthlyLessons) {
            var testWeeks = [[], [], [], [], []];
            monthlyLessons.forEach((lesson) => {
                if (lesson.status === 'paid' || lesson.status === 'arrived') {
                    const day = parseInt(lesson.date.split(".")[0], 10);
                    const weekIndex = Math.floor((day - 1) / 7);
                    testWeeks[weekIndex].push(lesson);
                }
            });
            return testWeeks;
        },
        weeklyPrice(student) {
            return this.groupLessonsByWeek(this.chartData.classesInMonth(student, this.monthPicked));
        },
        onExpandStudent(studentId) {
            this.expandStudent = studentId === this.expandStudent ? '' : studentId
        }
    },
    components: {
        tableHeader,
        tableRow
    }
}
</script>
