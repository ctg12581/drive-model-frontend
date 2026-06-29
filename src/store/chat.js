// src/store/chat.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // 1. 缓存联系人列表
  const cachedFriends = ref(JSON.parse(localStorage.getItem('cached_friends') || '[]'))
  
  // 2. 💡 缓存历史记录：结构如 { "user_b": [ {from: "我", text: "你好", ...}, ... ] }
  const cachedHistory = ref(JSON.parse(localStorage.getItem('cached_history') || '{}'))

  // 3. 💡 记住当前活跃的对话窗口（解决切Tab后窗口被重置的问题）
  const activeContact = ref(localStorage.getItem('active_contact') || null)

  function setFriends(friends) {
    cachedFriends.value = friends
    localStorage.setItem('cached_friends', JSON.stringify(friends))
  }

  // 💡 限制每个联系人最多只缓存最近 30 条消息，防止 LocalStorage 容量溢出，同时保障极速加载
  function setHistory(friendUsername, history) {
    cachedHistory.value[friendUsername] = history.slice(-30)
    localStorage.setItem('cached_history', JSON.stringify(cachedHistory.value))
  }

  function setActiveContact(contact) {
    activeContact.value = contact
    if (contact) {
      localStorage.setItem('active_contact', contact)
    } else {
      localStorage.removeItem('active_contact')
    }
  }

  return { cachedFriends, cachedHistory, activeContact, setFriends, setHistory, setActiveContact }
})