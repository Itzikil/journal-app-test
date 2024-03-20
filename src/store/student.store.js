import { studentService } from '../services/student.service.local'

export function getActionRemoveStudent(studentId) {
    return {
        type: 'removeStudent',
        studentId
    }
}
export function getActionAddStudent(student) {
    return {
        type: 'addStudent',
        student
    }
}
export function getActionUpdateStudent(student) {
    return {
        type: 'updateStudent',
        student
    }
}

export function getActionAddStudentMsg(studentId) {
    return {
        type: 'addStudentMsg',
        studentId,
        txt: 'Stam txt'
    }
}

export const studentStore = {
    state: {
        students: []
    },
    getters: {
        students({ students }) { return students },
    },
    mutations: {
        setStudents(state, { students }) {
            state.students = students
        },
        addStudent(state, { student }) {
            state.students.push(student)
        },
        updateStudent(state, { student }) {
            console.log(student);
            const idx = state.students.findIndex(c => c.id === student._id)
            state.students.splice(idx, 1, student)
        },
        removeStudent(state, { studentId }) {
            state.students = state.students.filter(student => student._id !== studentId)
        },
        addStudentMsg(state, { studentId, msg }) {
            const student = state.students.find(student => student._id === studentId)
            if (!student.msgs) student.msgs = []
            student.msgs.push(msg)
        },
    },
    actions: {
        async addStudent(context, { student }) {
            try {
                student = await studentService.save(student)
                context.commit(getActionAddStudent(student))
                return student
            } catch (err) {
                console.log('studentStore: Error in addStudent', err)
                throw err
            }
        },
        async updateStudent(context, { student }) {
            try {
                console.log(student);
                student = await studentService.save(student)
                context.commit({ type: 'updateStudent', student })
                // commit({ type: 'setLoggedinUser', user })

                return student
            } catch (err) {
                console.log('studentStore: Error in updateStudent', err)
                throw err
            }
        },
        async loadStudents(context) {
            try {
                const students = await studentService.query()
                context.commit({ type: 'setStudents', students })
            } catch (err) {
                console.log('studentStore: Error in loadStudents', err)
                throw err
            }
        },
        async getStudentByTeacher(context, {teacherId }) {
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
                context.commit(getActionRemoveStudent(studentId))
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

    }
}