<template>
    <h2>Profile</h2>
    <h4>Name:</h4>
    <p>number of student</p>
    <p>made this month</p>
    <p>need to pay</p>
</template>

<script>
import { studentService } from '../services/student.service.local'

export default {
    data() {
        return {
            student: null,
            editable: false,
            classes: [],
            classesToShow: 2
        }
    },
    // async created() {
    //     const id = this.$route.params.id
    //     this.student = await studentService.getById(id)
    //     this.classes = this.student.classes.sort((a, b) => {
    //         const [dayA, monthA, yearA] = a.date.split('.').map(Number);
    //         const [dayB, monthB, yearB] = b.date.split('.').map(Number);

    //         if (yearA !== yearB) {
    //             return yearA - yearB;
    //         }
    //         if (monthA !== monthB) {
    //             return monthA - monthB;
    //         }
    //         return dayA - dayB;
    //     })
    // },
    computed: {
        displayClasses() {
            return this.classes.slice(-this.classesToShow)
        },
        classesSum() {
            this.displayClasses
        },
        calculateClassSum() {
            return (status) => {
                return this.displayClasses.reduce((total, lesson) => {
                    if (lesson.status === status) {
                        return total + this.student.price;
                    } else {
                        return total;
                    }
                }, 0);
            };
        },
        arrivedClassesSum() {
            return this.calculateClassSum("arrived");
        },
        paidClassesSum() {
            return this.calculateClassSum("paid");
        },
    },
    methods: {
        openEdit() {
            this.editable = !this.editable
        },
        loadMore() {
            this.classesToShow += 2;
        },
    },
}
</script>