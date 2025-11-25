<template>
    <section class="add-to-group-container">
        <div class="cmp-header">
            <h3>Add student to group</h3>
            <!-- <button @click="closeCmp">-</button> -->
        </div>
        <input type="text" name="" id="" placeholder="Group name" class="input" v-model="groupName">
        <p>{{ selectedStudents.length }}</p>
        <ul>
            <li v-for="student in selectedStudents">
                <button @click="removeStudent(student)">{{ student.name }}</button>
            </li>
        </ul>
        <p>{{ students.length }}</p>
        <ul>
            <li v-for="student in students">
                <button @click="selectStudent(student)">{{ student.name }}</button>
            </li>
        </ul>
        <button @click="makeGroup">Add group</button>
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
            groupName: '',
        };
    },
    created() {
    },
    methods: {
        selectStudent(student) {
            if (!this.selectedStudents.some(currStudent => currStudent._id === student._id)) {
                this.selectedStudents.push(student);
                var idx = this.students.findIndex(currStudent => student._id === currStudent._id)
                this.students.splice(idx, 1)
            }
        },
        removeStudent(student) {
            const index = this.selectedStudents.findIndex(currStudent => currStudent._id === student._id)
            this.selectedStudents.splice(index, 1)
            this.students.push(student);
        },
        // closeCmp() {
        //     this.$emit('closeCmp')
        // },
        makeGroup() {
            var studentsId = this.selectedStudents.map(student => ({ _id: student._id, name: student.name }))
            var group = { groupName: this.groupName, student: studentsId }
            this.$emit('makeGroup', group);
        }
    },
};
</script>