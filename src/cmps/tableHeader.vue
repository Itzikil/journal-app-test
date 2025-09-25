<template>
    <thead>
        <tr>
            <th></th>
            <template v-if="!isMonthPicked">
                <th v-for="month in fourMonths" :key="month.number">
                    <button @click="$emit('monthSelected', month)">{{ month.name }}</button>
                </th>
                <th>sum</th>
            </template>
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