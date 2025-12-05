import { defineStore } from 'pinia'
import axios from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    setToken(t) {
      this.token = t
      if (t) localStorage.setItem('token', t)
      else localStorage.removeItem('token')
    },
    async login(payload) {
      const res = await axios.post('/login', payload)
      this.setToken(res.data.token)
    },
    async register(payload) {
      const res = await axios.post('/register', payload)
      this.setToken(res.data.token)
    },
    logout() {
      this.setToken(null)
      this.user = null
    }
  }
})
