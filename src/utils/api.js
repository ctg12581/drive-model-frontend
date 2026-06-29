// src/utils/api.js
import { useAuthStore } from '../store/auth'
import router from '../router'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000'

/**
 * 💡 统一封装的全局 API 请求工具
 * 作用：自动携带全局 Token、自动设置 Content-Type、统一拦截 401 强制登出跳转
 */
export async function apiFetch(endpoint, options = {}) {
  const authStore = useAuthStore()

  // 自动设置与补全 Headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // 如果本地有 Token，自动在 Header 中安全塞入 Bearer Token
  if (authStore.token) {
    headers['Authorization'] = `Bearer ${authStore.token}`
  }

  const mergedOptions = {
    ...options,
    headers,
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, mergedOptions)

    // 💡 动态保险：一旦后端由于 Token 过期返回 401 状态码
    if (response.status === 401) {
      authStore.logout()
      router.push('/auth')
      throw new Error('您的登录凭证已过期，请重新登录')
    }

    return response
  } catch (err) {
    console.error('API 请求异常:', err)
    throw err
  }
}