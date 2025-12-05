import axiosLib from 'axios'

const baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000/api'

const axios = axiosLib.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

export default axios
