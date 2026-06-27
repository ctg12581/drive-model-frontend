import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'
import AuthView from '../views/AuthView.vue'
import DriveView from '../views/DriveView.vue'
import ChatView from '../views/ChatView.vue'
import MomentsView from '../views/MomentsView.vue'

const routes = [
  { path: '/', redirect: '/drive' },
  { path: '/auth', name: 'Auth', component: AuthView },
  // meta.requiresAuth 标记了哪些页面必须登录才能进入
  { path: '/drive', name: 'Drive', component: DriveView, meta: { requiresAuth: true } },
  { path: '/chat', name: 'Chat', component: ChatView, meta: { requiresAuth: true } },
  { path: '/moments', name: 'Moments', component: MomentsView, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHashHistory(), // 使用 Hash 模式，在部署 GitHub Pages 时免去服务端重定向配置的麻烦
  routes
})

// 路由守卫：在页面跳转前执行鉴权拦截
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/auth') // 拦截并重定向
  } else {
    next() // 正常放行
  }
})

export default router