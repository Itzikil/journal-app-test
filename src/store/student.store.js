import { studentService } from '../services/student.service.local'

export const studentStore = {
    state: {
        students: [],
        currStudent: '',
        filterBy: {
            name: ''
        },
    },
    getters: {
        students({ students }) { return students },
        currStudent({ currStudent }) { return currStudent },
    },
    mutations: {
        setStudents(state, { students }) {
            state.students = students
        },
        setCurrStudent(state, { currStudent }) {
            state.currStudent = currStudent
        },
        setStudent(state, updatedStudent) {
            const index = state.students.findIndex(s => s._id === updatedStudent._id);
            if (index !== -1) {
                state.students.splice(index, 1, updatedStudent);
            }
        },
        addStudent(state, { student }) {
            state.students.push(student)
        },
        updateStudent(state, { student }) {
            const idx = state.students.findIndex(c => c._id === student._id)
            state.students.splice(idx, 1, student)
            state.currStudent = student
        },
        removeStudent(state, { studentId }) {
            state.students = state.students.filter(student => student._id !== studentId)
        },
        addStudentMsg(state, { studentId, msg }) {
            const student = state.students.find(student => student._id === studentId)
            if (!student.msgs) student.msgs = []
            student.msgs.push(msg)
        },
        setFilter(state, { filterBy }) {
            state.filterBy = filterBy
        },
    },
    actions: {
        async loadStudents({ commit, state }) {
            try {
                const students = await studentService.query(state.filterBy)
                commit({ type: 'setStudents', students })
            } catch (err) {
                console.log('studentStore: Error in loadStudents', err)
                throw err
            }
        },
        async getStudentById({ commit }, { id }) {
            try {
                const student = await studentService.getById(id)
                commit({ type: 'setCurrStudent', currStudent: student })
            } catch (err) {
                console.log('studentStore: Error in loadStudents', err)
                throw err
            }
        },
        async addStudent(context, { student }) {
            try {
                student = await studentService.save(student)
                context.commit({ type: 'addStudent', student })
                return student
            } catch (err) {
                console.log('studentStore: Error in addStudent', err)
                throw err
            }
        },
        async updateStudent(context, { student }) {
            try {
                student = await studentService.save(student)
                context.commit({ type: 'updateStudent', student })
                return student
            } catch (err) {
                console.log('studentStore: Error in updateStudent', err)
                throw err
            }
        },
        async updateMultipleStudents({ commit }, { students }) {
            try {
                const updatedStudents = students.map(student => studentService.save(student));
                updatedStudents.forEach(student => {
                    commit("setStudent", student);
                });
            } catch (err) {
                console.error("Failed to update multiple students:", err);
                throw err;
            }
        },
        async getStudentByTeacher(context, { teacherId }) {
            try {
                const students = await studentService.getStudentByTeacher(teacherId)
                context.commit({ type: 'setStudents', students })
            } catch (err) {
                console.log('studentStore: Error in getStudentByTeacher', err)
                throw err
            }
        },
        async removeStudent(context, { studentId }) {
            try {
                await studentService.remove(studentId)
                context.commit({ type: 'removeStudent', studentId })
            } catch (err) {
                console.log('studentStore: Error in removeStudent', err)
                throw err
            }
        },
        async addStudentMsg(context, { studentId, txt }) {
            try {
                const msg = await studentService.addStudentMsg(studentId, txt)
                context.commit({ type: 'addStudentMsg', studentId, msg })
            } catch (err) {
                console.log('studentStore: Error in addStudentMsg', err)
                throw err
            }
        },
        async setFilter({ commit, dispatch }, { filterBy }) {
            try {
                commit({ type: 'setFilter', filterBy })
                dispatch({ type: 'loadStudents' })
            } catch (err) {
                console.log('Cannot load Students', err);
                throw err;
            }
        },
    }
}