<template>
    <section class="charts-container container">
        <div class="table-container">
            <div class="chart-header">
                <button @click="changeMonth(-1)"><img src="../assets/imgs/left-arrow.svg" alt="left arrow"></button>
                <h3>{{ chartData.currentYear }}</h3>
                <h3 v-if="monthPicked"> {{ chartData.monthNames[monthPicked] }}</h3>
                <button @click="changeMonth(1)"><img src="../assets/imgs/right-arrow.svg" alt="right arrow"></button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th v-if="!monthPicked" v-for="month in fourMonths" :key="month">
                            <button @click="pickMonth(month)">{{ month.name }}</button>
                        </th>
                        <th v-else v-for="week in [1, 2, 3, 4, 5]" :key="week">
                            {{ week }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="student in students" :key="student">
                        <td>{{ student.name }}</td>
                        <td v-if="!monthPicked" v-for="month in fourMonths" :key="month" class="fs14">{{
                            chartData.sumPaidThisMonth(student, month.number) + chartData.sumArrivedThisMonth(student,
                                month.number)
                            }}</td>
                        <td v-else v-for="lesson in chartData.classesInMonth(student, monthPicked.number)">
                            <p>{{ lesson.price }}</p>
                            <!-- <pre>{{ classesInMonth(student , monthPicked.number) }}</pre> -->
                        </td>
                    </tr>
                    <tr>
                        <td>Total</td>
                        <td v-if="!monthPicked" v-for="month in fourMonths" :key="month" class="fs14">{{
                            chartData.monthlySum(month.number) }}
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
            // monthPicked: this.chartData.currentMonth,
        }
    },
    created() {
    },
    computed: {
        students() {
            return this.$store.getters.students;
        },
    },
    methods: {
        pickMonth(month) {
            this.chartData.changeMonth(month.number - 1)
            this.monthPicked = month.number - 1
        },
        changeMonth(num) {
            num === 1 ? this.chartData.nextMonth() : this.chartData.prevMonth()
            if (this.monthPicked) this.monthPicked = this.monthPicked + num

        }
    }
}
</script>