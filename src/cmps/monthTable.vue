<template>
    <section class="charts-container container">
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th v-for="month in monthNames" :key="month">{{ month.substring(0, 3) }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="student in students" :key="student">
                        <td>{{ student.name }}</td>
                        <td v-for="(month, idx) in monthNames" :key="student" class="fs14">{{ sumforMonth(student, idx)
                            }}</td>
                    </tr>
                    <tr>
                        <td>Total</td>
                        <td v-for="(month, idx) in monthNames" :key="month" class="fs14">{{ monthlySum(idx) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
</template>

<script>

export default {
    data() {
        return {
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        }
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
    }
}
</script>