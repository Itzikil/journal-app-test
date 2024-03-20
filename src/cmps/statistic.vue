<template>
    <section class="stats-page-container">
        <h3>Statistic</h3>
        <div class="stats-container">
            <div v-for="month in months" class="month-stats">
                <div class="candle" :style="candleHeight(month)"></div>
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
            // months: [
            //     {
            //         name: 'jan',
            //         earning: 1200
            //     },
            //     {
            //         name: 'feb',
            //         earning: 1000
            //     },
            //     {
            //         name: 'mar',
            //         earning: 500
            //     },
            //     {
            //         name: 'apr',
            //         earning: 2000
            //     },
            // ]
        }
    },
    created() {
        console.log(
            this.months

        );
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