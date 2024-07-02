<template>
    <section class="charts-container container">
        <div class="table-container">
            <div class="chart-header">
                <button ><img src="../assets/imgs/left-arrow.svg" alt="left arrow"></button>
                <h3>{{ monthPicked.name }}</h3>
                <button><img src="../assets/imgs/right-arrow.svg" alt="right arrow"></button>
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
                            sumforMonth(student, month.number -1)
                        }}</td>
                        <td v-else v-for="lesson in classesInMonth(student, monthPicked.number)">
                            <p>{{ lesson.price }}</p>
                            <!-- <pre>{{ classesInMonth(student , monthPicked.number) }}</pre> -->
                        </td>
                    </tr>
                    <tr>
                        <td>Total</td>
                        <td v-if="!monthPicked" v-for="month in fourMonths" :key="month" class="fs14">{{
                            monthlySum(month.number -1) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <button @click="monthPicked = ''">Clear</button>
    </section>
</template>

<script>

export default {
    props: {
        fourMonths: Array,
    },
    data() {
        return {
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthPicked: '',
        }
    },
    created() {
        console.log(this.fourMonths);
    },
    computed: {
        students() {
            return this.$store.getters.students;
        },
    },
    methods: {
        sumforMonth(student, month) {
            return this.paidThisMonth(student, month).reduce((acc, lesson) => acc + lesson.price, 0)
        },
        paidThisMonth(student, selectedDate) {
            return this.classesInMonth(student, selectedDate).filter(lesson => lesson.status === 'paid' || lesson.status === 'arrived')
        },
        arrivedThisMonth(student, selectedDate) {
            return this.classesInMonth(student, selectedDate).filter(lesson => lesson.status === 'arrived')
        },
        classesInMonth(student, selectedDate) {
            var date = `${selectedDate + 1}.${2024}`
            return student.classes.filter(lesson => `${lesson.date.split(".")[1]}.${lesson.date.split(".")[2]}` === date)
        },
        monthlySum(selectedDate) {
            var date = `${selectedDate + 1}.${2024}`
            var sum = this.totalMonthEarn(selectedDate)
            return sum.arrived + sum.paid
        },
        totalMonthEarn(selectedDate) {
            return this.students.reduce((acc, student) => {
                acc.arrived += this.arrivedThisMonth(student, selectedDate).reduce((acc, lesson) => acc + lesson?.price, 0)
                acc.paid += this.paidThisMonth(student, selectedDate).reduce((acc, lesson) => acc + lesson?.price, 0)
                return acc;
            }, { arrived: 0, paid: 0 });
        },
        pickMonth(month) {
            this.monthPicked = month
        }
    }
}
</script>