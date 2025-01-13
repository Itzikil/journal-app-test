<template>
    <section class="stats-page-container">
        <div class="stats-container">
            <!-- <div>
                <p>1</p>
                <p>1</p>
            </div> -->
            <div v-for="month in fourMonths" class="month-stats">
                <div class="candle" :style="candleHeight(month)">
                    <!-- <div class="candle" :style="candleHeight(month)" @click="showEarn"> -->
                    <p class="earning">₪{{ month.earning }}</p>
                </div>
                <p class="fs14">{{ month.name }}</p>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    props: {
        fourMonths: Array,
    },
    data() {
        return {
            showingEarn: false
        }
    },
    created() {
    },
    methods: {
        // showEarn(){
        //     let max = this.highestEarn()
        //     return { height: `${month.earning / max * 75}%` }
        // },
        highestEarn() {
            var highest = 0
            this.fourMonths.forEach(month => month.earning > highest ? highest = month.earning : '')
            return highest
        },
        candleHeight(month) {
            let max = this.highestEarn()
            return { height: `${month.earning / max * 75}%` }
        }
    }
}
</script>