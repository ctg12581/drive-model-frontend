// src/store/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('drive_token') || '')
  const username = ref(localStorage.getItem('drive_username') || '')
  // 新增：全局托管昵称与头像
  const nickname = ref(localStorage.getItem('drive_nickname') || '')
  const avatar = ref(localStorage.getItem('drive_avatar') || '👤')

  const isLoggedIn = computed(() => !!token.value)

  function setLogin(newToken, newUser, newNickname = '', newAvatar = '👤') {
    token.value = newToken
    username.value = newUser
    nickname.value = newNickname || newUser
    avatar.value = newAvatar || '👤'
    
    localStorage.setItem('drive_token', newToken)
    localStorage.setItem('drive_username', newUser)
    localStorage.setItem('drive_nickname', nickname.value)
    localStorage.setItem('drive_avatar', avatar.value)
  }

  // 新增：供个人设置页修改资料后，一键同步全站
  function updateProfileState(newNickname, newAvatar) {
    nickname.value = newNickname
    avatar.value = newAvatar
    localStorage.setItem('drive_nickname', newNickname)
    localStorage.setItem('drive_avatar', newAvatar)
  }

  function logout() {
    token.value = ''
    username.value = ''
    nickname.value = ''
    avatar.value = '👤'
    localStorage.removeItem('drive_token')
    localStorage.removeItem('drive_username')
    localStorage.removeItem('drive_nickname')
    localStorage.removeItem('drive_avatar')
  }

  return { token, username, nickname, avatar, isLoggedIn, setLogin, updateProfileState, logout }
})