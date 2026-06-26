import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 响应式状态：初始时尝试从本地 localStorage 中提取
  const token = ref(localStorage.getItem('drive_token') || '')
  const username = ref(localStorage.getItem('drive_username') || '')

  const isLoggedIn = computed(() => !!token.value)

  function setLogin(newToken, newUser) {
    token.value = newToken
    username.value = newUser
    localStorage.setItem('drive_token', newToken)
    localStorage.setItem('drive_username', newUser)
  }

  function logout() {
    token.value = ''
    username.value = ''
    localStorage.removeItem('drive_token')
    localStorage.removeItem('drive_username')
  }

  return { token, username, isLoggedIn, setLogin, logout }
})