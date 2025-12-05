import axios from './api'

export default {
  searchProducts(query) {
    return axios.get('/products/search', { params: { query } })
  },
  createOrder(payload) {
    return axios.post('/orders', payload)
  },
  fetchOrders(params) {
    return axios.get('/orders', { params })
  },
  updateOrder(id, payload) {
    return axios.put(`/orders/${id}`, payload)
  },
  deleteOrder(id) {
    return axios.delete(`/orders/${id}`)
  }
}
