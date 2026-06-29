// src/store/chat.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { formatLocalTime } from '../utils/date'

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()
  
  const cachedFriends = ref(JSON.parse(localStorage.getItem('cached_friends') || '[]'))
  const cachedHistory = ref(JSON.parse(localStorage.getItem('cached_history') || '{}'))
  const activeContact = ref(localStorage.getItem('active_contact') || null)

  // 💡 1. 声明全局唯一的常驻 WebSocket 实例
  const ws = ref(null)
  const connected = ref(false)
  
  // 💡 2. 全局活跃对话消息流（切换 Tab 不会被清空，保障 0ms 秒开）
  const activeMessages = ref([])

  // 💡 3. 计算属性：实时汇总全站所有好友的未读消息总和
  const totalUnreadCount = computed(() => {
    return cachedFriends.value.reduce((sum, friend) => sum + (friend.unread || 0), 0)
  })

  function setFriends(friends) {
    cachedFriends.value = friends
    localStorage.setItem('cached_friends', JSON.stringify(friends))
  }

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

  // 💡 4. 核心：全局常驻 WebSocket 守护进程启动逻辑
  function connectWebSocket() {
    const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://127.0.0.1:3000'
    
    // 如果未登录，或已经存在连接，则跳过，防止重复建立连接
    if (!authStore.username || ws.value) return

    ws.value = new WebSocket(`${WS_BASE}/chat/ws/${authStore.username}`)

    ws.value.onopen = () => {
      connected.value = true
      // 如果当前正开着某个人的对话框，自动为其向后端补发已读回执
      if (activeContact.value) {
        sendWebSocketPayload({ type: "read", to: activeContact.value })
      }
    }

    ws.value.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      // 💡 无论在哪个页面，收到消息立即播放清脆音效！
      playNotificationSound()

      // 情况 A：收到实时已读回执
      if (data.type === 'read') {
        if (activeContact.value === data.from) {
          activeMessages.value.forEach(msg => {
            if (msg.self) msg.is_read = true
          })
          setHistory(activeContact.value, [...activeMessages.value])
        }
        return
      }

      // 情况 B：收到实时撤回回执
      if (data.type === 'recall') {
        const recalledId = data.message_id
        
        // 如果当前正开着和 TA 的对话框，实时在会话流中撤回该消息
        if (activeContact.value === data.from) {
          const msgIndex = activeMessages.value.findIndex(m => m.id === recalledId)
          if (msgIndex !== -1) {
            activeMessages.value.splice(msgIndex, 1, {
              system: true,
              text: '对方撤回了一条消息'
            })
            setHistory(activeContact.value, [...activeMessages.value])
          }
        } else {
          const hist = cachedHistory.value[data.from] || []
          const msgIndex = hist.findIndex(m => m.id === recalledId)
          if (msgIndex !== -1) {
            hist.splice(msgIndex, 1, { system: true, text: '对方撤回了一条消息' })
            setHistory(data.from, hist)
          }
        }
        updateLastMessageState(data.from, '对方撤回了一条消息', false, '', true)
        return
      }

      // 情况 C：正常的普通消息包
      const isMsg = !data.type || data.type === 'msg'
      if (isMsg) {
        if (activeContact.value === data.from) {
          // 如果用户当前正好在跟发送人热聊中：直接塞入活跃会话流并自动已读
          activeMessages.value.push({
            id: data.id,
            from: data.from,
            text: data.message,
            time: getCurrentTimeLabel(),
            self: false,
            system: false,
            is_read: true 
          })
          setHistory(activeContact.value, [...activeMessages.value])
          sendWebSocketPayload({ type: "read", to: data.from })
        } else {
          // 💡 核心：如果用户没有开当前对话框（无论是在发动态、改名片还是跟别人聊天）：其对应的未读数自动 +1
          const friend = cachedFriends.value.find(f => f.username === data.from)
          if (friend) {
            friend.unread = (friend.unread || 0) + 1
            setFriends([...cachedFriends.value]) // 写入全局状态，触发导航栏数字红点实时改变
          }
        }
        updateLastMessageState(data.from, data.message, false)
      }
    }

    ws.value.onclose = () => {
      connected.value = false
      ws.value = null
    }
  }

  // 断开全局连接 (退出登录时调用)
  function disconnectWebSocket() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
      connected.value = false
    }
  }

  // 统一通过常驻 WebSocket 实例向后端发送数据
  function sendWebSocketPayload(payload) {
    if (ws.value && connected.value) {
      ws.value.send(JSON.stringify(payload))
    }
  }

  function updateLastMessageState(friendUsername, text, isSelf = false, timeStr = '', isSystemNotice = false) {
    const friend = cachedFriends.value.find(f => f.username === friendUsername)
    if (!friend) return

    let displayMsg = text
    if (text.startsWith('data:image/')) {
      displayMsg = '[图片]'
    } else if (!isSystemNotice && text.length > 15) {
      displayMsg = text.substring(0, 15) + '...'
    }

    if (isSystemNotice) {
      friend.last_message = displayMsg
    } else {
      const prefix = isSelf ? '我' : friend.nickname
      friend.last_message = `${prefix}: ${displayMsg}`
    }

    let timeLabel = ""
    if (timeStr) {
      timeLabel = timeStr.split(' ')[1] || ""
    } else {
      const now = new Date()
      timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    }
    friend.last_message_time = timeLabel
    
    setFriends([...cachedFriends.value])
  }

  function playNotificationSound() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      const audioCtx = new AudioContextClass()
      if (audioCtx.state === 'suspended') {
        const resume = () => {
          audioCtx.resume().then(() => {
            playSynthPing(audioCtx)
            window.removeEventListener('click', resume)
          })
        }
        window.addEventListener('click', resume)
        return
      }
      playSynthPing(audioCtx)
    } catch (err) {
      console.warn('播放音效被拦截:', err)
    }
  }

  function playSynthPing(audioCtx) {
    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08)
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25)
    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.25)
  }

  function getCurrentTimeLabel() {
    const now = new Date()
    return `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  }

  return { 
    cachedFriends, cachedHistory, activeContact, ws, connected, activeMessages, totalUnreadCount,
    setFriends, setHistory, setActiveContact, connectWebSocket, disconnectWebSocket, sendWebSocketPayload, updateLastMessageState
  }
})