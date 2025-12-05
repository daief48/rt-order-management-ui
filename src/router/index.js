import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import { useAuthStore } from '../store'
import BillingPage from '../views/BillingPage.vue'
import Dashboard from '../views/DashboardPage.vue'
import OrdersPage from '../views/OrdersPage.vue'
import OrderEditPage from '../views/OrderEditPage.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage, meta: { guest: true } },
  { path: '/register', component: RegisterPage, meta: { guest: true } },
  { path: '/billing', component: BillingPage, meta: { requiresAuth: true } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/orders', component: OrdersPage, meta: { requiresAuth: true } },
  { path: '/orders/:id/edit', component: OrderEditPage, meta: { requiresAuth: true }, props: true }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }
  if (to.meta.guest && auth.isAuthenticated) {
    return next('/dashboard')
  }
  next()
})

export default router
