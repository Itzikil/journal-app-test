<template>
    <tr>
        <td class="student-name" :class="{ expanded: expandStudent === student._id }"
            @click="$emit('toggleExpand', student._id)">
            <p>{{ student.name }}</p>
        </td>
        <td v-if="!isMonthPicked" v-for="month in fourMonths" :key="month.number">
            <p class="fs14">
                {{ chartData.sumPaidThisMonth(student, monthOrYear(month.number)) +
                    chartData.sumArrivedThisMonth(student, monthOrYear(month.number)) }}
            </p>
        </td>
        <td v-else v-for="(lessons, idx) in weeklyData" :key="idx">
            <p v-for="lesson in lessons" class="fs14">{{ lesson.price }}</p>
        </td>
    </tr>
</template>

<script>
export default {
    props: {
        student: Object,
        isMonthPicked: Number,
        fourMonths: Array,
        weeklyData: Array,
        expandStudent: String,
        chartData: Object,
        monthOrYear: Function,
    },
};
</script>