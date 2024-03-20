import Vuex from 'vuex'

import { userStore } from './user.store.js'
import { studentStore } from './student.store.js'
import { reviewStore } from './review.store.js'

export const store = Vuex.createStore({
  strict: true,
  modules: {
    userStore,
    studentStore,
    reviewStore
  },
  state: {
  },
  mutations: {
  },
  actions: {
  }
})
