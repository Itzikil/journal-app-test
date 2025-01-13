<template>
    <thead>
        <tr>
            <th></th>
            <th v-if="!isMonthPicked" v-for="month in fourMonths" :key="month.number">
                <button @click="$emit('monthSelected', month)">{{ month.name }}</button>
            </th>
            <th v-else v-for="week in weeks" :key="week">
                <p>{{ week }}</p>
            </th>
        </tr>
    </thead>
</template>

<script>
export default {
    props: {
        isMonthPicked: Number,
        fourMonths: Array,
        weeks: Array,
    },
};
</script>