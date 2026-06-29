<!-- src/views/ChatView.vue -->
<template>
  <div class="x-dm-layout">
    
    <!-- 左侧：联系人列表 -->
    <div :class="['contacts-sidebar', { 'hide-on-mobile': selectedContact }]">
      <div class="sidebar-header">
        <h3 style="margin: 0;">私信信箱</h3>
        <button @click="showAddModal = !showAddModal" class="btn-icon">
          <svg viewBox="0 0 24 24" class="svg-inline"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        </button>
      </div>

      <!-- 加好友面板 -->
      <div v-if="showAddModal" class="add-friend-panel">
        <input type="text" v-model="newFriendUsername" placeholder="添加好友的用户名..." @keyup.enter="addFriend">
        <button @click="addFriend" class="x-btn-pill">加好友</button>
      </div>

      <!-- 好友列表 -->
      <div class="contacts-list">
        <div v-if="friends.length === 0" class="no-contacts">
          暂无联系人，点击上方 “+” 添加好友开始聊天。
        </div>
        <div v-for="friend in friends" :key="friend.username" 
             :class="['contact-item', { active: selectedContact === friend.username }]"
             @click="selectContact(friend.username)">
          
          <div class="contact-avatar" @click.stop="openUserProfile(friend.username)">
            <img v-if="isUrl(friend.avatar)" :src="friend.avatar" class="avatar-img" />
            <span v-else-if="friend.avatar && friend.avatar !== '👤'">{{ friend.avatar }}</span>
            <span v-else>{{ friend.username[0].toUpperCase() }}</span>
          </div>
          
          <div class="contact-details-row">
            <div class="contact-details">
              <div class="contact-name">{{ friend.nickname }}</div>
              <div class="contact-handle">@{{ friend.username }}</div>
            </div>
            <div v-if="friend.unread > 0" class="unread-badge">
              {{ friend.unread }}
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 右侧：活动对话区 -->
    <div :class="['chat-main', { 'hide-on-mobile': !selectedContact }]">
      
      <!-- 未选择联系人提示 -->
      <div v-if="!selectedContact" class="welcome-box">
        <div style="font-size: 3rem; margin-bottom: 12px;">✉️</div>
        <h2>选择一个联系人</h2>
        <p style="color: var(--x-text-gray);">从现有的联系人列表中选择，或点击左侧添加新朋友以开启对话。</p>
      </div>

      <!-- 活动聊天窗口 -->
      <div v-else class="chat-window">
        <!-- 窗口头部 -->
        <div class="chat-header">
          <div class="chat-header-left">
            <button @click="selectedContact = null" class="btn-back">
              <svg viewBox="0 0 24 24" class="svg-inline"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            </button>
            <div class="header-info" @click="openUserProfile(selectedContact)" style="cursor: pointer;">
              <span class="header-name">{{ selectedContactProfile?.nickname || selectedContact }}</span>
              <span class="header-status">@{{ selectedContact }} · {{ connected ? '实时在线' : '离线' }}</span>
            </div>
          </div>
          <button v-if="!connected" @click="connectChat" class="btn-reconnect">重连</button>
        </div>

        <!-- 对话消息池 -->
        <div class="chat-body" id="chatFlow">
          <div v-for="(msg, idx) in messages" :key="idx" 
               :class="['message-row', msg.system ? 'sys-row' : (msg.self ? 'self-row' : 'peer-row')]">
            
            <!-- 💡 核心升级：消息气泡阻止冒泡，点击弹出 Telegram 风格气泡菜单 -->
            <div v-if="!msg.system" class="msg-bubble" @click.stop="toggleMessageMenu(idx)">
              <img v-if="isImage(msg.text)" :src="msg.text" class="chat-img" @load="scrollToBottom" />
              <span v-else>{{ msg.text }}</span>
              <div class="msg-meta">
                <span v-if="msg.self" :class="['read-status', { 'status-read': msg.is_read }]">
                  {{ msg.is_read ? '已读' : '未读' }}
                </span>
                <span class="msg-time">{{ msg.time }}</span>
              </div>

              <!-- 💡 Telegram 风格气泡悬浮操作菜单 (绝对定位) -->
              <div v-if="activeMenuIndex === idx" class="telegram-menu" @click.stop>
                <button class="menu-item" @click="handleCopy(msg.text)">复制文本</button>
                <!-- 仅在我自己发的、且有数据库ID、未撤回时，才显示撤回 -->
                <button v-if="msg.self && msg.id" class="menu-item delete-btn" @click="handleRecall(msg.id, idx)">
                  撤回消息
                </button>
              </div>
            </div>
            
            <!-- 撤回/系统提示气泡 -->
            <div v-else class="sys-notice">{{ msg.text }}</div>
          </div>
        </div>

        <!-- 底部消息发送栏 -->
        <div class="chat-footer">
          <div class="input-pill">
            <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="handleImageUpload">
            
            <button @click="triggerImageSelect" class="btn-icon" :disabled="!connected" style="padding-top: 3px;">
              <svg viewBox="0 0 24 24" class="svg-inline" style="color: var(--x-text-gray);"><path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.41 0 .75.34.75.75v10.12l-3.21-3.21c-.29-.29-.77-.29-1.06 0l-3.87 3.87-2.31-2.31a.75.75 0 00-1.06 0L3.5 16.5V4.25c0-.41.34-.75.75-.75zM3.5 18.62l5.03-5.03 2.84 2.84c.29.29.77.29 1.06 0l3.34-3.34 3.77 3.77V19.75c0 .41-.34.75-.75.75H4.25c-.41 0-.75-.34-.75-.75v-1.13zM8.5 11c1.38 0 2.5-1.12 2.5-2.5S9.88 6 8.5 6 6 7.12 6 8.5 7.12 11 8.5 11zm0-3.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>
            </button>

            <input type="text" v-model="messageInput" placeholder="开始撰写私信..." @keyup.enter="sendMessage" :disabled="!connected">
            <button @click="sendMessage" class="btn-send" :disabled="!messageInput.trim() && !connected">
              <svg viewBox="0 0 24 24" class="svg-inline"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- 个人主页弹窗 (Profile) -->
    <div v-if="activeProfile" class="modal-backdrop" @click.self="activeProfile = null">
      <div class="modal-card">
        <button class="modal-close" @click="activeProfile = null">✕</button>
        <div class="modal-header">
          <div class="modal-avatar-big">
            <img v-if="isUrl(activeProfile.user.avatar)" :src="activeProfile.user.avatar" class="avatar-img-el" />
            <span v-else-if="activeProfile.user.avatar && activeProfile.user.avatar !== '👤'">{{ activeProfile.user.avatar }}</span>
            <span v-else>{{ activeProfile.user.username[0].toUpperCase() }}</span>
          </div>
          <h2 class="modal-nickname">{{ activeProfile.user.nickname }}</h2>
          <p class="modal-handle">@{{ activeProfile.user.username }}</p>
        </div>
        <div class="modal-body">
          <h3 class="modal-tab-title">TA 的动态 ({{ activeProfile.posts.length }})</h3>
          <div v-if="activeProfile.posts.length === 0" class="no-posts-hint">TA 还没有发布过任何动态。</div>
          <div v-for="p in activeProfile.posts" :key="p.id" class="modal-tweet">
            <div class="modal-tweet-time">{{ formatLocalTime(p.time) }}</div>
            <div class="modal-tweet-content">{{ p.content }}</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useAuthStore } from '../store/auth'
import { useChatStore } from '../store/chat'
import { formatLocalTime } from '../utils/date'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000'
const WS_BASE  = import.meta.env.VITE_WS_BASE || 'ws://127.0.0.1:3000'

const authStore = useAuthStore()
const chatStore = useChatStore()
const connected = ref(false)
const showAddModal = ref(false)
const newFriendUsername = ref('')

const friends = ref(chatStore.cachedFriends)
const selectedContact = ref(chatStore.activeContact)
const messageInput = ref('')
const messages = reactive([])
let ws = null

const fileInput = ref(null)
const activeProfile = ref(null)

// 💡 新增：激活菜单的对应数组索引，管理 Telegram 菜单的展开
const activeMenuIndex = ref(null)

let titleInterval = null
const originalTitle = document.title || "DRIVE Space"

const selectedContactProfile = computed(() => {
  return friends.value.find(f => f.username === selectedContact.value)
})

watch(selectedContact, (newVal) => {
  chatStore.setActiveContact(newVal)
})

onMounted(() => {
  fetchFriends()
  connectChat()
  if (selectedContact.value) {
    selectContact(selectedContact.value)
  }
  // 💡 核心机制：监听全局点击，以便在点击外部任何空白处时，自动闭合打开的 Telegram 菜单
  window.addEventListener('click', closeAllMenus)
})

onUnmounted(() => {
  if (ws) ws.close()
  stopTitleFlash()
  window.removeEventListener('click', closeAllMenus) // 安全卸载监听器
})

// 统一关闭所有展开的气泡操作菜单
const closeAllMenus = () => {
  activeMenuIndex.value = null
}

// 切换某个气泡菜单的开启与闭合
const toggleMessageMenu = (index) => {
  if (activeMenuIndex.value === index) {
    activeMenuIndex.value = null
  } else {
    activeMenuIndex.value = index
  }
}

// 💡 菜单功能：复制文本
const handleCopy = (text) => {
  try {
    navigator.clipboard.writeText(text)
    alert("已复制到剪贴板")
  } catch (err) {
    console.error('复制失败', err)
  }
  activeMenuIndex.value = null // 自动合上菜单
}

// 💡 菜单功能：撤回，集成 window.confirm 确认逻辑
const handleRecall = (messageId, index) => {
  activeMenuIndex.value = null // 自动合上菜单
  
  if (!connected.value || !ws || !selectedContact.value) return

  // 💡 二次安全确认
  if (!window.confirm("确定要撤回这条消息吗？")) {
    return
  }

  ws.send(JSON.stringify({
    type: "recall",
    to: selectedContact.value,
    message_id: messageId
  }))

  messages.splice(index, 1, {
    system: true,
    text: '你撤回了一条消息'
  })

  chatStore.setHistory(selectedContact.value, [...messages])
}

const fetchFriends = async () => {
  try {
    const res = await fetch(`${API_BASE}/chat/friends`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    const data = await res.json()
    if (res.ok) {
      const friendsWithUnread = data.friends.map(f => {
        const existing = friends.value.find(cf => cf.username === f.username)
        return {
          ...f,
          unread: existing ? existing.unread : 0
        }
      })
      chatStore.setFriends(friendsWithUnread)
      friends.value = friendsWithUnread
    }
  } catch (err) {
    console.error('获取联系人列表失败:', err)
  }
}

const addFriend = async () => {
  const friend = newFriendUsername.value.trim()
  if (!friend) return
  try {
    const res = await fetch(`${API_BASE}/chat/add-friend`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}` 
      },
      body: JSON.stringify({ friend_username: friend })
    })
    const data = await res.json()
    if (res.ok) {
      alert(data.message)
      newFriendUsername.value = ''
      showAddModal.value = false
      fetchFriends()
    } else {
      alert(data.detail || '加好友失败')
    }
  } catch {
    alert('网络故障')
  }
}

import { apiFetch } from '../utils/api'

const selectContact = async (friendUsername) => {
  selectedContact.value = friendUsername
  messages.length = 0
  
  const cachedHistory = chatStore.cachedHistory[friendUsername] || []
  messages.push(...cachedHistory)
  scrollToBottom()

  const friend = friends.value.find(f => f.username === friendUsername)
  if (friend) {
    friend.unread = 0
    chatStore.setFriends(friends.value)
  }
  
  const hasUnread = friends.value.some(f => f.unread > 0)
  if (!hasUnread) {
    stopTitleFlash()
  }

  if (connected.value && ws) {
    ws.send(JSON.stringify({ type: "read", to: friendUsername }))
  }

try {
    // 💡 干净清爽地请求，后台自动处理 Token 与过期重定向
    const res = await apiFetch(`/chat/history/${friendUsername}`)
    const data = await res.json()
    if (res.ok) {
      const localizedHistory = data.history.map(msg => ({
        ...msg,
        time: formatLocalTime(msg.time)
      }))
      chatStore.setHistory(friendUsername, localizedHistory)
      messages.length = 0
      messages.push(...localizedHistory)
      scrollToBottom()
    }
  } catch (err) {
    console.error('加载历史记录失败:', err)
  }
}

const connectChat = () => {
  if (!authStore.username) return
  if (ws) ws.close()
  
  ws = new WebSocket(`${WS_BASE}/chat/ws/${authStore.username}`)
  
  ws.onopen = () => {
    connected.value = true
    if (selectedContact.value) {
      ws.send(JSON.stringify({ type: "read", to: selectedContact.value }))
    }
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    playNotificationSound()

    if (data.type === 'read') {
      if (selectedContact.value === data.from) {
        messages.forEach(msg => {
          if (msg.self) {
            msg.is_read = true
          }
        })
        chatStore.setHistory(selectedContact.value, [...messages])
      }
      return
    }

    if (data.type === 'recall') {
      const recalledId = data.message_id
      const msgIndex = messages.findIndex(m => m.id === recalledId)
      if (msgIndex !== -1) {
        messages.splice(msgIndex, 1, {
          system: true,
          text: '对方撤回了一条消息'
        })
        chatStore.setHistory(selectedContact.value, [...messages])
      }
      return
    }

    const isMsg = !data.type || data.type === 'msg'
    if (isMsg) {
      if (selectedContact.value === data.from) {
        messages.push({
          id: data.id,
          from: data.from,
          text: data.message,
          time: getCurrentTimeLabel(),
          self: false,
          system: false,
          is_read: true 
        })
        scrollToBottom()
        chatStore.setHistory(selectedContact.value, [...messages])

        ws.send(JSON.stringify({ type: "read", to: data.from }))
      } else {
        const friend = friends.value.find(f => f.username === data.from)
        if (friend) {
          friend.unread++
          chatStore.setFriends(friends.value)
        }
        triggerTitleFlash()
      }
    }
  }

  ws.onclose = () => {
    connected.value = false
  }
}

const triggerTitleFlash = () => {
  if (titleInterval) return
  let isAlt = false
  titleInterval = setInterval(() => {
    document.title = isAlt ? "【新消息】DRIVE Space" : "【　　　】DRIVE Space"
    isAlt = !isAlt
  }, 800)
}

const stopTitleFlash = () => {
  if (titleInterval) {
    clearInterval(titleInterval)
    titleInterval = null
  }
  document.title = originalTitle
}

const playNotificationSound = () => {
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
    console.warn('音效阻碍:', err)
  }
}

const playSynthPing = (audioCtx) => {
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

const sendMessage = () => {
  if (!connected.value || !ws || !selectedContact.value) return
  const text = messageInput.value.trim()
  if (!text) return

  ws.send(JSON.stringify({ to: selectedContact.value, message: text }))
  
  messages.push({ 
    from: authStore.username, 
    text: text, 
    time: getCurrentTimeLabel(), 
    self: true, 
    system: false,
    is_read: false 
  })
  
  nextTick(async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/history/${selectedContact.value}`, {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })
      const data = await res.json()
      if (res.ok) {
        const localizedHistory = data.history.map(msg => ({
          ...msg,
          time: formatLocalTime(msg.time)
        }))
        chatStore.setHistory(selectedContact.value, localizedHistory)
        messages.length = 0
        messages.push(...localizedHistory)
        scrollToBottom()
      }
    } catch (e) {
      console.error(e)
    }
  })

  messageInput.value = ''
  scrollToBottom()
}

const openUserProfile = async (targetUsername) => {
  try {
    const [profileRes, postsRes] = await Promise.all([
      fetch(`${API_BASE}/auth/profile/${targetUsername}`),
      fetch(`${API_BASE}/moments/user/${targetUsername}`)
    ])
    if (profileRes.ok && postsRes.ok) {
      const user = await profileRes.json()
      const userPosts = await postsRes.json()
      activeProfile.value = {
        user: user,
        posts: userPosts.moments
      }
    }
  } catch {
    alert('无法加载该用户的主页')
  }
}

const triggerImageSelect = () => {
  if (fileInput.value) { fileInput.value.click() }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 1024 * 1024) {
    alert("图片过大，测试版限制上传小于 1MB 的图片。")
    event.target.value = ""
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const base64Data = reader.result
    ws.send(JSON.stringify({ to: selectedContact.value, message: base64Data }))
    messages.push({
      from: authStore.username,
      text: base64Data,
      time: getCurrentTimeLabel(),
      self: true,
      system: false,
      is_read: false
    })
    
    nextTick(async () => {
      try {
        const res = await fetch(`${API_BASE}/chat/history/${selectedContact.value}`, {
          headers: { 'Authorization': `Bearer ${authStore.token}` }
        })
        const data = await res.json()
        if (res.ok) {
          const localizedHistory = data.history.map(msg => ({ ...msg, time: formatLocalTime(msg.time) }))
          chatStore.setHistory(selectedContact.value, localizedHistory)
          messages.length = 0
          messages.push(...localizedHistory)
          scrollToBottom()
        }
      } catch (e) { console.error(e) }
    })

    scrollToBottom()
  }
  reader.readAsDataURL(file)
  event.target.value = ""
}

const isImage = (text) => {
  if (!text) return false
  return text.startsWith('data:image/') || text.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null
}

const isUrl = (text) => {
  if (!text) return false
  return text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/')
}

const scrollToBottom = () => {
  nextTick(() => {
    const flow = document.getElementById('chatFlow')
    if (flow) {
      flow.scrollTop = flow.scrollHeight
    }
  })
}

const getCurrentTimeLabel = () => {
  const now = new Date()
  return `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
/* 𝕏 经典分栏排版 */
.x-dm-layout {
  display: flex;
  height: calc(100vh - 106px);
  width: 100%;
}
@media (min-width: 768px) {
  .x-dm-layout { height: calc(100vh - 24px); }
}

/* 左侧联系人列表 */
.contacts-sidebar {
  width: 100%;
  border-right: 1px solid var(--x-border);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.sidebar-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px; border-bottom: 1px solid var(--x-border);
}
.btn-icon { background: transparent; border: none; cursor: pointer; color: var(--x-blue); display: flex; align-items: center; }
.svg-inline { width: 22px; height: 22px; fill: currentColor; }

.add-friend-panel {
  display: flex; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--x-border); background: #f7f9fa;
}
.add-friend-panel input {
  flex: 1; padding: 6px 12px; border: 1px solid var(--x-border); border-radius: 9999px; outline: none; font-size: 0.9rem;
}
.x-btn-pill {
  background: #0f1419; color: white; border: none; padding: 0 16px; border-radius: 9999px; font-weight: bold; cursor: pointer;
}

.contacts-list { flex: 1; overflow-y: auto; }
.no-contacts { padding: 30px; text-align: center; color: var(--x-text-gray); font-size: 0.9rem; line-height: 1.5; }
.contact-item {
  display: flex; align-items: center; gap: 12px; padding: 12px 16px;
  border-bottom: 1px solid var(--x-border); cursor: pointer; transition: background 0.2s;
}
.contact-item:hover { background: var(--x-bg-hover); }
.contact-item.active { background: #f0f3f4; }

/* 响应式名片行布局 */
.contact-details-row {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.contact-details { display: flex; flex-direction: column; text-align: left; }
.contact-name { font-weight: bold; font-size: 0.95rem; color: var(--x-text-main); }
.contact-handle { font-size: 0.8rem; color: var(--x-text-gray); }

/* 亮红色未读数徽章 */
.unread-badge {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-sizing: border-box;
  animation: pop-scale 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes pop-scale {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

/* 极简头像 */
.contact-avatar {
  width: 38px; height: 38px;
  background: #ffffff;
  border: 1px solid var(--x-border);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold; font-size: 1.1rem; color: var(--x-text-gray);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}
.contact-avatar:hover { border-color: var(--x-blue); }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }

/* 右侧聊天主窗口 */
.chat-main { width: 100%; display: flex; flex-direction: column; }
.welcome-box { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 24px; }

.chat-window { display: flex; flex-direction: column; height: 100%; }
.chat-header {
  display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid var(--x-border);
}
.chat-header-left { display: flex; align-items: center; gap: 12px; }
.btn-back { background: transparent; border: none; cursor: pointer; color: var(--x-text-main); display: flex; align-items: center; }
.header-info { display: flex; flex-direction: column; }
.header-name { font-weight: bold; font-size: 0.95rem; }
.header-status { font-size: 0.8rem; color: var(--x-text-gray); }
.btn-reconnect {
  background: var(--x-blue); color: white; border: none; font-size: 0.8rem;
  font-weight: bold; padding: 4px 12px; border-radius: 9999px; cursor: pointer;
}

.chat-body { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: white; }
.message-row { display: flex; width: 100%; }
.self-row { justify-content: flex-end; }
.peer-row { justify-content: flex-start; }
.sys-row { justify-content: center; }

/* 💡 气泡修剪使其支持绝对定位弹出菜单 */
.msg-bubble {
  max-width: 70%; padding: 10px 14px; font-size: 0.95rem; line-height: 1.4; word-wrap: break-word; 
  position: relative; /* 💡 必须是 relative，以便菜单定位 */
  cursor: pointer;
  user-select: none; /* 防止长按选中文本干扰点击 */
}
.self-row .msg-bubble { background: var(--x-blue); color: white; border-radius: 18px 18px 2px 18px; }
.peer-row .msg-bubble { background: #eff3f4; color: var(--x-text-main); border-radius: 18px 18px 18px 2px; }

/* 消息元数据 */
.msg-meta {
  display: flex; align-items: center; justify-content: flex-end; gap: 6px; margin-top: 4px; font-size: 0.7rem;
}
.read-status { opacity: 0.6; color: #fca5a5; font-weight: bold; } 
.read-status.status-read { color: #a7f3d0; opacity: 0.8; }        
.msg-time { display: block; opacity: 0.7; text-align: right; }

/* 对方发送的消息不展示已读状态 */
.peer-row .read-status { display: none !important; }
.peer-row .msg-meta { justify-content: flex-end; }
.peer-row .msg-time { color: var(--x-text-gray); }

/* 🌟 Telegram 风格气泡操作菜单样式 */
.telegram-menu {
  position: absolute;
  bottom: calc(100% + 4px); /* 💡 悬浮在消息气泡上方 */
  background: #ffffff;
  border: 1px solid var(--x-border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 4px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  min-width: 90px;
  animation: pop-menu 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.15);
}
@keyframes pop-menu {
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
/* 💡 根据发送方还是接收方，让菜单靠右或靠左对齐 */
.self-row .telegram-menu { right: 8px; }
.peer-row .telegram-menu { left: 8px; }

.menu-item {
  background: transparent;
  border: none;
  padding: 8px 12px;
  text-align: left;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  color: var(--x-text-main);
  border-radius: 8px;
  transition: background 0.1s;
}
.menu-item:hover { background: var(--x-bg-hover); }
.menu-item.delete-btn { color: #ef4444; }
.menu-item.delete-btn:hover { background: #fee2e2; }

/* 系统灰色提示丸子（撤回时显示） */
.sys-notice {
  font-size: 0.8rem;
  color: var(--x-text-gray);
  background: #f7f9fa;
  padding: 4px 14px;
  border-radius: 9999px;
  font-style: italic; 
}

.chat-img {
  max-width: 100%; max-height: 220px; border-radius: 12px; display: block; margin-top: 4px; cursor: pointer;
}

.chat-footer { padding: 12px 16px; border-top: 1px solid var(--x-border); }
.input-pill { display: flex; align-items: center; background: #f7f9fa; border-radius: 9999px; padding: 4px 14px; gap: 8px; }
.input-pill input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.95rem; height: 32px; }
.btn-send { background: transparent; border: none; cursor: pointer; display: flex; align-items: center; color: var(--x-blue); }
.btn-send:disabled { color: var(--x-text-gray); cursor: not-allowed; }

/* 个人主页弹窗 */
.modal-backdrop {
  position: fixed; top: 0; bottom: 0; left: 0; right: 0;
  background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-card {
  width: 90%; max-width: 450px; background: white; border-radius: 20px;
  max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; position: relative;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}
.modal-close {
  position: absolute; top: 16px; right: 16px; background: transparent;
  border: none; font-size: 1.25rem; font-weight: bold; cursor: pointer; color: var(--x-text-gray);
}
.modal-header { padding: 30px 24px 16px 24px; text-align: center; border-bottom: 1px solid var(--x-border); }
.modal-avatar-big {
  width: 70px; height: 70px; background: #eff3f4; border-radius: 50%; font-size: 2.5rem;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;
}
.modal-nickname { margin: 0; font-size: 1.25rem; font-weight: 800; }
.modal-handle { margin: 4px 0 0 0; color: var(--x-text-gray); font-size: 0.9rem; }

.modal-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
.modal-tab-title { font-size: 1rem; font-weight: 800; border-bottom: 2px solid var(--x-blue); padding-bottom: 6px; margin: 0 0 12px 0; display: inline-block;}
.no-posts-hint { text-align: center; color: var(--x-text-gray); font-size: 0.9rem; padding: 24px 0; }
.modal-tweet { padding: 12px 0; border-bottom: 1px solid var(--x-border); text-align: left; }
.modal-tweet-time { font-size: 0.8rem; color: var(--x-text-gray); margin-bottom: 4px; }
.modal-tweet-content { font-size: 0.95rem; line-height: 1.4; word-wrap: break-word;}

/* 双端自适应 */
@media (max-width: 767px) {
  .contacts-sidebar.hide-on-mobile { display: none !important; }
  .chat-main.hide-on-mobile { display: none !important; }
  .btn-back { display: block !important; }
}
@media (min-width: 768px) {
  .contacts-sidebar { width: 280px; }
  .chat-main { flex: 1; }
  .btn-back { display: none !important; }
}
</style>