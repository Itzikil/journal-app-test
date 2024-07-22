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
                <thead>
                    <tr>
                        <th></th>
                        <th v-if="!monthPicked" v-for="month in fourMonths" :key="month">
                            <button @click="pickMonth(month)">{{ month.name }}</button>
                        </th>
                        <th v-else v-for="week in [1, 2, 3, 4, 5]" :key="week">
                            <p>{{ week }}</p>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="student in students" :key="student.id">
                        <td>
                            <p>{{ student.name }}</p>
                        </td>
                        <td v-if="!monthPicked" v-for="month in fourMonths" :key="month" class="fs14">
                            <p>{{ chartData.sumPaidThisMonth(student, month.number)
                                + chartData.sumArrivedThisMonth(student, month.number) }}
                            </p>
                        </td>
                        <td v-else v-for="(lessons, idx) in weeklyPrice(student)">
                            <p v-for="lesson in lessons">{{ lesson.price }}</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p>Total</p>
                        </td>
                        <td v-if="!monthPicked" v-for="month in fourMonths" :key="month" class="fs14">
                            <p>{{ chartData.monthlySum(month.number) }}</p>
                        </td>
                        <td v-else v-for="(week, idx) in weeks" :key="idx" class="fs14">
                            <p>{{ week }}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <button v-if="monthPicked" @click="monthPicked = ''">Back to 4 months</button>
    </section>
</template>

<script>
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
            monthPicked: '',
            weeks: [0, 0, 0, 0, 0]
        }
    },
    computed: {
        students() {
            return this.$store.getters.students;
        },
    },
    methods: {
        pickMonth(month) {
            this.chartData.changeMonth(month.number - 1)
            this.monthPicked = month.number
            this.updateWeeklyPrices();
        },
        changeMonth(num) {
            if (num === 1) {
                this.chartData.nextMonth();
            } else {
                this.chartData.prevMonth();
            }
            if (this.monthPicked !== '') {
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
        }
    },
    created() {
        if (this.monthPicked !== '') {
            this.updateWeeklyPrices();
        }
    }
}
</script>
