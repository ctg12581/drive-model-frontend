// src/store/chat.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // 💡 核心：初始化时，先尝试从本地物理缓存里提取上一次加载成功的联系人。
  // 这保证了切换页面甚至是刷新浏览器，也能实现 0ms 瞬间显示联系人！
  const cachedFriends = ref(JSON.parse(localStorage.getItem('cached_friends') || '[]'))

  function setFriends(friends) {
    cachedFriends.value = friends
    // 写入物理缓存
    localStorage.setItem('cached_friends', JSON.stringify(friends))
  }

  return { cachedFriends, setFriends }
})