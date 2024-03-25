<template>
    <section class="stats-page-container">
        <h3>Statistic</h3>
        <div class="stats-container">
            <div v-for="month in months" class="month-stats">
                <div class="candle" :style="candleHeight(month)">
                    <p class="earning">₪{{ month.earning }}</p>
                </div>
                <p>{{ month.name }}</p>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    props: {
        months: Array,
    },
    data() {
        return {
        }
    },
    created() {
        console.log(this.month);
    },
    methods: {
        highestEarn() {
            var highest = 0
            this.months.forEach(month => month.earning > highest ? highest = month.earning : '')
            return highest
        },
        candleHeight(month) {
            let max = this.highestEarn()
            return { height: `${month.earning / max * 75}%` }
        }
    }
}
</script>