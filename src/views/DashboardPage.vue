<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Dashboard</h2>
      <div>
        <router-link to="/billing" class="btn btn-primary me-2">Billing</router-link>
        <router-link to="/orders" class="btn btn-secondary me-2">Orders</router-link>
        <button @click="logout" class="btn btn-outline-danger">Logout</button>
      </div>
    </div>

    <div class="card p-3">
      <h5>Welcome to the billing system</h5>
      <p>Use the left buttons to create order or manage orders.</p>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../store'
import { useRouter } from 'vue-router'

export default {
  name: 'DashboardPage',
  setup() {
    const auth = useAuthStore()
    const router = useRouter()
    function logout() {
      auth.logout()
      router.push('/login')
    }
    return { logout }
  }
}
</script>
