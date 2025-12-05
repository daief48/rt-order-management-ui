<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card p-4">
          <h3 class="mb-3">Login</h3>
          <form @submit.prevent="onLogin">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input v-model="form.password" type="password" class="form-control" required />
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <button class="btn btn-primary" :disabled="loading">Login</button>
              <router-link to="/register">Register</router-link>
            </div>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../store'
import router from '../router'

export default {
  name: 'LoginPage',
  setup() {
    const form = ref({ email: '', password: '' })
    const loading = ref(false)
    const error = ref(null)
    const auth = useAuthStore()

    async function onLogin() {
      loading.value = true
      error.value = null
      try {
        await auth.login(form.value)
        router.push('/dashboard')
      } catch (e) {
        error.value = e.response?.data?.error || 'Login failed'
      } finally {
        loading.value = false
      }
    }

    return { form, onLogin, loading, error }
  }
}
</script>
