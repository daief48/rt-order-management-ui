<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card p-4">
          <h3 class="mb-3">Register</h3>
          <form @submit.prevent="onRegister">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input v-model="form.name" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input v-model="form.password" type="password" class="form-control" required />
            </div>
            <button class="btn btn-success" :disabled="loading">Register</button>
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
  name: 'RegisterPage',
  setup() {
    const form = ref({ name: '', email: '', password: '' })
    const loading = ref(false)
    const error = ref(null)
    const auth = useAuthStore()

    async function onRegister() {
      loading.value = true
      try {
        await auth.register(form.value)
        router.push('/dashboard')
      } catch (e) {
        error.value = e.response?.data?.message || 'Registration failed'
      } finally {
        loading.value = false
      }
    }

    return { form, onRegister, loading, error }
  }
}
</script>
