export const utilService = {
    makeId,
    makeLorem,
    getRandomIntInclusive,
    debounce,
    randomPastTime,
    saveToStorage,
    loadFromStorage,
    sortByDate,
    sortByName,
    deepClone,
    checkForConflict,
    isRunningAsPWA,
    isRunningAsPWAOnDesktop,
    biggerDate,
    returnMonthFromDate,
    returnYearFromDate,
    extractDatePart,
    getFormattedDate,
    getWeekdayCountInMonth
}

function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}

function makeLorem(size = 100) {
    var words = ['The sky', 'above', 'the port', 'was', 'the color of television', 'tuned', 'to', 'a dead channel', '.', 'All', 'this happened', 'more or less', '.', 'I', 'had', 'the story', 'bit by bit', 'from various people', 'and', 'as generally', 'happens', 'in such cases', 'each time', 'it', 'was', 'a different story', '.', 'It', 'was', 'a pleasure', 'to', 'burn']
    var txt = ''
    while (size > 0) {
        size--
        txt += words[Math.floor(Math.random() * words.length)] + ' '
    }
    return txt
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive 
}

function randomPastTime() {
    const HOUR = 1000 * 60 * 60
    const DAY = 1000 * 60 * 60 * 24
    const WEEK = 1000 * 60 * 60 * 24 * 7

    const pastTime = getRandomIntInclusive(HOUR, WEEK)
    return Date.now() - pastTime
}

function debounce(func, timeout = 300) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => { func.apply(this, args) }, timeout)
    }
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}

function loadFromStorage(key) {
    const data = localStorage.getItem(key)
    return (data) ? JSON.parse(data) : undefined
}

function sortByDate(lessons, backwards) {
    return lessons.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        if (!backwards) return dateA - dateB;
        else return dateB - dateA
    });
}

function biggerDate(a, b) {
    
    if (a.split('.').length === 2) {
        a = `1.${a}`

    }
    if (b.split('.').length === 2) {
        b = `1.${b}`
    }

    const dateA = parseDate(a);
    const dateB = parseDate(b);
    return dateA <= dateB;
}

function returnMonthFromDate(dateString) {
    const [day, month, year] = dateString.split('.').map(Number);
    return `${month}`
};
function returnYearFromDate(dateString) {
    const [day, month, year] = dateString.split('.').map(Number);
    return `${year}`
};

function parseDate(dateString) {
    const [day, month, year] = dateString.split('.').map(Number);
    return new Date(year, month - 1, day);
};

function getFormattedDate() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // Months are zero-based in JavaScript
    const year = today.getFullYear();

    return `${day}.${month}.${year}`;
}

function extractDatePart(dateString, part) {
    // return console.log(dateString);
    
    const [day, month, year] = dateString.split('.').map(Number);
    switch (part) {
        case 'day':
            return day;
        case 'month':
            return month;
        case 'year':
            return year;
        case 'month.year':
            return `${month}.${year}`;
        case 'day.month':
            return `${day}.${month}`;
        case 'full':
            return `${day}.${month}.${year}`;
        default:
            return null;
    }
}

function getWeekdayCountInMonth(year, month, weekday) {
    let count = 0;
    const date = new Date(year, month, 1); // Start from the 1st day of the month
    const lastDay = new Date(year, month + 1, 0).getDate(); // Get the last day of the month
    for (let day = 1; day <= lastDay; day++) {
        date.setDate(day);
        if (date.getDay() === weekdayToNumber(weekday)) {
            count++;
        }
    }
    return count;
}

function weekdayToNumber(weekday) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days.indexOf(weekday);
}

function sortByName(items) {
    return items.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });
}

function deepClone(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    const clone = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clone[key] = this.deepClone(obj[key]);
        }
    }
    return clone;
}

function isConflict(existingStudent, newStudent) {
    // Convert time strings to minutes for easier comparison
    const existingTime = convertTimeToMinutes(existingStudent.time);
    const newTime = convertTimeToMinutes(newStudent.time);

    // Calculate end time for existing and new students
    const existingEndTime = existingTime + existingStudent.duration;
    const newEndTime = newTime + newStudent.duration;

    // Check if there's an overlap in time range
    return ((existingTime >= newTime && existingTime < newEndTime) ||
        (newTime >= existingTime && newTime < existingEndTime));
}

function convertTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

function checkForConflict(newStudent, existingStudents) {
    for (let i = 0; i < existingStudents.length; i++) {
        if (existingStudents[i]._id === newStudent._id) {
            continue;
        }
        if (existingStudents[i].day === newStudent.day &&
            isConflict(existingStudents[i], newStudent)) {
            return true;
        }
    }
    return false;
}

function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
}

function isRunningAsPWAOnDesktop() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const isDesktop = !(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    return isStandalone && isDesktop;
}