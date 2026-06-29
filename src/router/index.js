// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'
import AuthView from '../views/AuthView.vue'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import ChatView from '../views/ChatView.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/auth', name: 'Auth', component: AuthView },
  { path: '/home', name: 'Home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/search', name: 'Search', component: SearchView, meta: { requiresAuth: true } },
  { path: '/notifications', name: 'Notifications', component: NotificationsView, meta: { requiresAuth: true } },
  { path: '/chat', name: 'Chat', component: ChatView, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/auth')
  } else {
    next()
  }
})

export default router