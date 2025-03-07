<template>
    <section class="deep-statistics-container">
        <div class="chart-header">
            <button @click="changeMonth(-1)"><img src="../assets/imgs/left-arrow.svg" alt="left arrow"></button>
            <h3>{{ chartData.currentYear }}</h3>
            <h3> {{ chartData.monthNames[chartData.currentMonth] }}</h3>
            <button @click="changeMonth(1)"><img src="../assets/imgs/right-arrow.svg" alt="right arrow"></button>
        </div>

        <div class="main-statistics">
            <p>{{ calculateAverageMoneyPerHour(maxWeeklyRevenue, maxHoursAWeek) }}<span class="fs14">₪ average per
                    hour</span></p>
            <div class="weekly-statistics">
                <h4>Weekly</h4>
                <p> {{ maxWeeklyRevenue }}<span class="fs14">₪ max for a week</span></p>
                <p> {{ convertMinutesToHours(maxHoursAWeek) }}<span class="fs14"> max hours a week</span></p>
            </div>

            <div class="monthly-statistics">
                <h4>Monthly</h4>

                <div class="stat-container">
                    <div class="flex justify-space align-end">
                        <p class="fs14 bold">Lessons</p>
                        <div class="flex align-end">
                            <p>{{ allLessonsInMonth.length }}</p>
                            <p class="fs12">/{{ monthlyMaxLessons }}</p>
                        </div>
                    </div>
                    <div class="stat">
                        <div class="stat-fill"
                            :style="{ width: `${fillColor(allLessonsInMonth.length, monthlyMaxLessons) * 100}%` }">
                        </div>
                    </div>
                    <p class="fs14">{{ precentage(allLessonsInMonth.length, monthlyMaxLessons) }}%</p>
                </div>

                <div class="stat-container">
                    <div class="flex justify-space align-end">
                        <p class="fs14 bold">Revenue </p>
                        <div class="flex align-end">
                            <p><span class="fs12">₪</span>{{ chartData.monthlySum().toLocaleString() }}</p>
                            <p class="fs12">/{{ chartData.monthlyMax.toLocaleString() }}</p>
                        </div>
                    </div>
                    <div class="stat">
                        <div class="stat-fill"
                            :style="{ width: `${fillColor(chartData.monthlySum(), chartData.monthlyMax) * 100}%` }">
                        </div>
                    </div>
                    <p class="fs14">{{ precentage(chartData.monthlySum(), chartData.monthlyMax) }}%</p>
                </div>

                <div class="stat-container">
                    <div class="flex justify-space align-end">
                        <p class="fs14 bold">Hours</p>
                        <div class="flex align-end">
                            <p>{{ convertMinutesToHours(hoursAWeek) }}<span class="fs12">hrs</span></p>
                            <p class="fs12">/{{ convertMinutesToHours(monthlyMaxDuration) }}</p>
                        </div>
                    </div>
                    <div class="stat">
                        <div class="stat-fill"
                            :style="{ width: `${fillColor(hoursAWeek, monthlyMaxDuration) * 100}%` }"></div>
                    </div>
                    <p class="fs14">{{ precentage(hoursAWeek, monthlyMaxDuration) }}%</p>
                </div>

            </div>
        </div>
    </section>
</template>

<script>
import { utilService } from '../services/util.service';
export default {
    props: {
        chartData: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
        }
    },
    created() {
    },
    computed: {
        currMonthStudents() {
            return this.chartData.studentsByMonth
        },
        maxHoursAWeek() {
            return this.currMonthStudents.reduce((acc, student) => student.lessonsInfo.length > 0 ? student.lessonsInfo[0].duration + acc : acc, 0)
        },
        hoursAWeek() {
            return this.allLessonsInMonth.reduce((acc, lesson) => {
                return this.isValidLesson(lesson) ? lesson.duration + acc : acc;
            }, 0);
        },
        maxWeeklyRevenue() {
            return this.currMonthStudents.reduce((acc, student) => student.lessonsInfo.length > 0 ? student.lessonsInfo[0].price + acc : acc, 0)
        },
        allLessonsInMonth() {
            return this.currMonthStudents
                .flatMap(student => this.chartData.classesInMonth(student, '', true))
                .filter(this.isValidLesson);
        },
        // monthlyMaxDuration() {
        //     // count all the weekly active students, not inactive nor singles
        //     return this.chartData.studentsByMonth.reduce((sum, student) => {
        //         const studentRevenue = student.lessonsInfo?.reduce((acc, lesson) => {
        //             const lessonDays = utilService.getWeekdayCountInMonth(this.chartData.currentYear, this.chartData.currentMonth, lesson.day);
        //             return acc + (lessonDays * lesson.duration);
        //         }, 0) ?? 0; // If studentRevenue is undefined, default to 0
        //         return sum + studentRevenue; // Add each student's revenue to the total
        //     }, 0); // Initial value for outer accumulator is 0
        // },
        monthlyMaxDuration() {
            return this.chartData.studentsByMonth.reduce((sum, student) => {
                if (student.lessonsInfo.length) {
                    const studentDuration = student.lessonsInfo.reduce((acc, lesson) => {
                        const lessonDays = utilService.getWeekdayCountInMonth(
                            this.chartData.currentYear,
                            this.chartData.currentMonth,
                            lesson.day
                        );
                        return acc + (lessonDays * lesson.duration);
                    }, 0);
                    return sum + studentDuration;
                } else {
                    const classDuration = student.classes.filter(cls => {
                        const classMonth = utilService.extractDatePart(cls.date, 'month');
                        const classYear = utilService.extractDatePart(cls.date, 'year');
                        return classMonth === this.chartData.currentMonth + 1 && classYear === this.chartData.currentYear;
                    }).reduce((acc, cls) => acc + cls.duration, 0); // Sum up the duration of each class
                    return sum + classDuration;
                }
            }, 0);
        },
        monthlyMaxLessons() {
            return this.chartData.studentsByMonth.reduce((sum, student) => {
                if (student.lessonsInfo.length) {
                    const studentRevenue = student.lessonsInfo.reduce((acc, lesson) => {
                        const lessonDays = utilService.getWeekdayCountInMonth(
                            this.chartData.currentYear,
                            this.chartData.currentMonth,
                            lesson.day
                        );
                        return acc + lessonDays;
                    }, 0);
                    return sum + studentRevenue;
                } else {
                    const classRevenue = student.classes.filter(cls => {
                        const classMonth = utilService.extractDatePart(cls.date, 'month');
                        const classYear = utilService.extractDatePart(cls.date, 'year');
                        return classMonth === this.chartData.currentMonth + 1 && classYear === this.chartData.currentYear;
                    }).length; // Count the number of matching classes
                    return sum + classRevenue;
                }
            }, 0);
        }
    },
    methods: {
        isValidLesson(lesson) {
            return lesson.status === 'arrived' || lesson.status === 'paid';
        },
        convertMinutesToHours(minutes) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}:${remainingMinutes.toString().padStart(2, '0')}`;
        },
        calculateAverageMoneyPerHour(totalMoney, totalMinutesWorked) {
            const totalHoursWorked = totalMinutesWorked / 60;
            if (totalHoursWorked === 0) return 0; // To avoid division by zero
            return Math.floor(totalMoney / totalHoursWorked) // Rounds to 2 decimal places
        },
        changeMonth(num) {
            if (num === 1) {
                this.chartData.nextMonth();
            } else {
                this.chartData.prevMonth();
            }
            if (this.monthPicked !== '') {
                if (num === 1 && this.monthPicked === 12) {
                    this.monthPicked = 0
                } else if (num === -1 && this.monthPicked === 1) {
                    this.monthPicked = 13
                }
                this.monthPicked += num;
            }
        },
        fillColor(curr = 0, max = 0) {
            if (curr === 0 && max === 0) return 0
            return curr / max
        },
        precentage(a, b) {
            return Math.floor((a / b) * 100) || 0
        }
    }
}

</script>