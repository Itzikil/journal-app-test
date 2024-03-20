
<template>
    <section class="day-container container">
        <p class="day-header">{{ day.dayName }} {{ day.date }}.{{ day.month + 1 }}.{{ day.year }}</p>
        <div class="hour" v-for="hour in hours" :key="hour">
            <div class="hour-label">{{ hour }}:00</div>
            <div class="student-slot student" v-for="student in studentsByHour[hour]" :key="student.id"
                :style="calculateStudentStyle(student)">
                <p>{{ student.name }}</p> 
                <div class="btns-container">
                    <button @click="addClass(student, 'hevriz')"><img src="../assets/imgs/x.svg" alt="didnt come"></button>
                    <button @click="addClass(student, 'arrived')"><img src="../assets/imgs/v.svg" alt="arrived"></button>
                    <button @click="addClass(student, 'paid')"><img src="../assets/imgs/paid.svg" alt="paid"></button>
                </div>
            </div>
        </div>
    </section>
</template>
<script>
export default {
    props: {
        day: {
            type: Object,
            required: true
        }
    },
    computed: {
        hours() {
            const startHour = 8;
            const endHour = 20;
            return Array.from({ length: endHour - startHour + 1 }, (_, i) => `${startHour + i}`);
        },
        studentsByHour() {
            const studentsByHour = {};
            if (this.day.students) {
                for (const student of this.day.students) {
                    const startTime = parseInt(student.time.split(':')[0]);
                    if (!studentsByHour[startTime]) {
                        studentsByHour[startTime] = [];
                    }
                    studentsByHour[startTime].push(student);
                }
            }
            return studentsByHour;
        }
    },
    methods: {
        calculateStudentStyle(student) {
            const startMinute = parseInt(student.time.split(':')[1]);

            const lessonDuration = student.duration; // Duration of lesson in minutes
            const slotHeight = (100 / 12) * (startMinute / 5); // Height of each 5-minute slot

            const marginTop = slotHeight; // Calculate top margin for start time
            const height = lessonDuration * 1.6666666666; // Calculate height for lesson duration
            console.log(this.day);
            return {
                top: `${marginTop}%`,
                height: `${height}%`
            };
        },
        async addClass(student, status) {

            const { date, month, year } = this.day
            var todayClass = { date: `${date}.${month + 1}.${year}`, status }
            var studentClone = this.deepClone(student)

            const existingIndex = studentClone.classes.findIndex((c) => c.date === todayClass.date);

            if (existingIndex !== -1 && studentClone.classes[existingIndex].status === todayClass.status) {
                return console.log('same');
            }
            else if (existingIndex !== -1) {
                studentClone.classes.splice(existingIndex, 1, todayClass);
            } else {
                studentClone.classes.push(todayClass)
            }

            try {
                await this.$store.dispatch({ type: "updateStudent", student: studentClone });
                // showSuccessMsg("Student added");
            } catch (err) {
                console.log(err);
                // showErrorMsg("Cannot add student");
            }
        },
        deepClone(obj) {
            if (typeof obj !== 'object' || obj === null) {
                return obj; // Return primitive types and null as is
            }

            // Create an empty object/array of the same type as the original
            const clone = Array.isArray(obj) ? [] : {};

            // Recursively clone each property of the object/array
            for (let key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    clone[key] = this.deepClone(obj[key]);
                }
            }

            return clone;
        }
    }
}
</script>
  