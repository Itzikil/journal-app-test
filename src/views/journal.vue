<template>
  <section class="journal-container container">
    <calendar @showDay="showDay"/>
    <day v-if="selectedDay" :day="today" />
  </section>
</template>

<script>
import calendar from '../cmps/calendar.vue'
import day from '../cmps/day.vue'
export default {
  data() {
    return {
      selectedDay: null,
    };
  },
  computed: {
    today(){
      return this.selectedDay
    }
  },
  created() {
  },
  methods: {
    showDay(day) {
      this.selectedDay = day;
    }
  },
  components: {
    calendar,
    day
  }
};
</script>
