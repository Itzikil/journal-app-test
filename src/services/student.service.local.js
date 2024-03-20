
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
    getStudentByTeacher
}
window.cs = studentService


async function query(filterBy = { txt: '', price: 0 }) {
    var students = await storageService.query(STORAGE_KEY)
    if (filterBy.txt) {
        const regex = new RegExp(filterBy.txt, 'i')
        students = students.filter(student => regex.test(student.name) || regex.test(student.description))
    }
    if (filterBy.price) {
        students = students.filter(student => student.price <= filterBy.price)
    }
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
    console.log(student);
    var savedStudent
    if (student._id) {
        savedStudent = await storageService.put(STORAGE_KEY, student)
    } else {
        // Later, owner is set by the backend
        student.owner = userService.getLoggedinUser()
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

function getEmptyStudent() {
    return {
        name: '',
        price: 0,
        day: '',
        time:'',
        duration: 0,
        teacher:'',
        classes:[]
    }
}


// TEST DATA
// storageService.post(STORAGE_KEY, {name: 'Subali Rahok 2', price: 980}).then(x => console.log(x))




