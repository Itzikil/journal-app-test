<template>
    <section class="add-to-group-container">
        <div class="cmp-header">
            <h3>Add student to group</h3>
            <button @click="closeCmp">-</button>
        </div>
        <input type="text" name="" id="" placeholder="Group name" class="input">
        <ul>
            <li v-for="student in selectedStudents">
                <button @click="removeStudent(student._id)">{{ student.name }}</button>
            </li>
        </ul>
        <ul>
            <li v-for="student in students">
                <button @click="selectStudent(student)">{{ student.name }}</button>
            </li>
        </ul>
        <button>Add group</button>
    </section>
</template>

<script>
export default {
    props: {
        activeStudents: {
            type: Array,
        }
    },
    data() {
        return {
            dropdownOpen: false,
            searchQuery: "",
            students: this.activeStudents,
            selectedStudents: [],
        };
    },
    created() {
    },
    methods: {
        selectStudent(student) {
            if (!this.selectedStudents.some(currStudent => currStudent._id === student._id)) {
                this.selectedStudents.push(student);
            }
        },
        removeStudent(studentId) {
            const index = this.selectedStudents.findIndex(currStudent => currStudent._id === studentId)
            this.selectedStudents.splice(index, 1)
        },
        closeCmp() {
            this.$emit('closeCmp')
        }
    },
};
</script>