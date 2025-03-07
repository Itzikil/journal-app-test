
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import { userService } from './user.service.js'

const STORAGE_KEY = 'student'

export const studentService = {
    query,
    getById,
    save,
    remove,
    getEmptyStudent,
    addStudentMsg,
    getStudentByTeacher,
    getEmptyClass
}
window.cs = studentService


async function query(filterBy = { name: '' }) {
    var students = await storageService.query(STORAGE_KEY)

    // students = students.filter(student => regex.test(student.name) || regex.test(student.description))
    // if (filterBy.price) {
    //     students = students.filter(student => student.price <= filterBy.price)
    // }
    var teacher = await userService.getLoggedinUser()
    students = students.filter(student => student?.teacher?._id === teacher?._id)
    if (filterBy.name) {
        const regex = new RegExp(filterBy.name, 'i')
        students = students.filter(student => regex.test(student.name))
    }
    students = utilService.sortByName(students)
    return students
}

function getById(studentId) {
    return storageService.get(STORAGE_KEY, studentId)
}

async function getStudentByTeacher(teacherId) {
    var students = await storageService.query(STORAGE_KEY)
    return students.filter(student => student.teacher._id === teacherId)

}

async function remove(studentId) {
    await storageService.remove(STORAGE_KEY, studentId)
}

async function save(student) {
    var savedStudent

    if (student._id) {
        savedStudent = await storageService.put(STORAGE_KEY, student)
    } else {
        // Later, owner is set by the backend
        // student.owner = userService.getLoggedinUser()
        savedStudent = await storageService.post(STORAGE_KEY, student)
    }
    return savedStudent
}

async function addStudentMsg(studentId, txt) {
    // Later, this is all done by the backend
    const student = await getById(studentId)
    if (!student.msgs) student.msgs = []

    const msg = {
        id: utilService.makeId(),
        by: userService.getLoggedinUser(),
        txt
    }
    student.msgs.push(msg)
    await storageService.put(STORAGE_KEY, student)

    return msg
}

// function getEmptyStudent() {
//     return {
//         name: '',
//         price: '',
//         day: '',
//         time: '',
//         duration: '',
//         teacher: '',
//         phone: '',
//         start: '',
//         classes: []
//     }
// }

function getEmptyClass() {
    return {
        day: '',
        time: '',
        duration: '',
        price: '',
        start: '',
    }
}

function getEmptyStudent() {
    return {
        name: '',
        phone: '',
        teacher: '',
        lessonsInfo: [],
        classes: [],
        active: true,
    }
}


// TEST DATA
// storageService.post(STORAGE_KEY, {name: 'Subali Rahok 2', price: 980}).then(x => console.log(x))




