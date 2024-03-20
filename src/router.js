import { createRouter, createWebHashHistory } from 'vue-router'

import home from './views/home.vue'
import chat from './views/chat.vue'
import profile from './views/profile.vue'
import journal from './views/journal.vue'
import students from './views/students.vue'
import studentDetails from './views/student-details.vue'
import today from './views/today.vue'
import reviewApp from './views/review-app.vue'
import loginSignup from './views/login-signup.vue'
import userDetails from './views/user-details.vue'
import about from './views/about.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: home
  },
  {
    path: '/profile',
    name: 'profile',
    component: profile
  },
  {
    path: '/journal',
    name: 'journal',
    component: journal
  },
  {
    path: '/students',
    name: 'students',
    component: students
  },
  {
    path: '/today',
    name: 'today',
    component: today
  },
  {
    path: '/review',
    name: 'review',
    component: reviewApp
  },
  {
    path: '/chat',
    name: 'chat',
    component: chat
  },
  {
    path: '/login',
    name: 'loginSignup',
    component: loginSignup
  },
  {
    path: '/about',
    name: 'about',
    component: about
  },
  {
    path: '/user/:id',
    name: 'user-details',
    component: userDetails
  },
  {
    path: '/student/:id',
    name: 'student-details',
    component: studentDetails
  },
]


export const router = createRouter({
  routes,
  history: createWebHashHistory()
  // base: process.env.BASE_URL,
})

