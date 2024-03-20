
// import { storageService } from './async-storage.service.js'
import { httpService } from './http.service.js'
import { utilService } from './util.service.js'
import { userService } from './user.service.js'


const STORAGE_KEY = 'student'

export const studentService = {
    query,
    getById,
    save,
    remove,
    getEmptyStudent,
    addStudentMsg
}
window.cs = studentService


async function query(filterBy = { txt: '', price: 0 }) {
    return httpService.get(STORAGE_KEY, filterBy)

    // var students = await storageService.query(STORAGE_KEY)
    // if (filterBy.txt) {
    //     const regex = new RegExp(filterBy.txt, 'i')
    //     students = students.filter(student => regex.test(student.name) || regex.test(student.description))
    // }
    // if (filterBy.price) {
    //     students = students.filter(student => student.price <= filterBy.price)
    // }
    // return students

}
function getById(studentId) {
    // return storageService.get(STORAGE_KEY, studentId)
    return httpService.get(`student/${studentId}`)
}

async function remove(studentId) {
    // await storageService.remove(STORAGE_KEY, studentId)
    return httpService.delete(`student/${studentId}`)
}
async function save(student) {
    var savedStudent
    if (student._id) {
        // savedStudent = await storageService.put(STORAGE_KEY, student)
        savedStudent = await httpService.put(`student/${student._id}`, student)

    } else {
        // Later, owner is set by the backend
        student.owner = userService.getLoggedinUser()
        // savedStudent = await storageService.post(STORAGE_KEY, student)
        savedStudent = await httpService.post('student', student)
    }
    return savedStudent
}

async function addStudentMsg(studentId, txt) {
    const savedMsg = await httpService.post(`student/${studentId}/msg`, {txt})
    return savedMsg
}


function getEmptyStudent() {
    return {
        name: '',
        price: 0,
    }
}





