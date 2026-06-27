<!-- src/views/ChatView.vue -->
<template>
  <div class="x-dm-layout">
    
    <!-- 左侧：联系人列表（在手机端，如果选中了人则隐藏） -->
    <div :class="['contacts-sidebar', { 'hide-on-mobile': selectedContact }]">
      <div class="sidebar-header">
        <h3 style="margin: 0;">私信信箱</h3>
        <button @click="showAddModal = !showAddModal" class="btn-icon">
          <svg viewBox="0 0 24 24" class="svg-inline"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        </button>
      </div>

      <!-- 加好友弹窗式控制台 -->
      <div v-if="showAddModal" class="add-friend-panel">
        <input type="text" v-model="newFriendUsername" placeholder="添加好友的用户名..." @keyup.enter="addFriend">
        <button @click="addFriend" class="x-btn-pill">加好友</button>
      </div>

      <!-- 好友列表 -->
      <div class="contacts-list">
        <div v-if="friends.length === 0" class="no-contacts">
          暂无联系人，点击上方 “+” 添加好友开始聊天。
        </div>
        <!-- 💡 兼容性升级：循环体改为使用对象属性 -->
        <div v-for="friend in friends" :key="friend.username" 
             :class="['contact-item', { active: selectedContact === friend.username }]"
             @click="selectContact(friend.username)">
          <div class="contact-avatar">{{ friend.avatar || '👤' }}</div>
          <div class="contact-name">@{{ friend.nickname }}</div>
        </div>
      </div>
    </div>

    <!-- 右侧：活动对话区（在手机端，若无选中则隐藏） -->
    <div :class="['chat-main', { 'hide-on-mobile': !selectedContact }]">
      
      <!-- 未选择联系人提示 -->
      <div v-if="!selectedContact" class="welcome-box">
        <div style="font-size: 3rem; margin-bottom: 12px;">✉️</div>
        <h2>选择一个联系人</h2>
        <p style="color: var(--x-text-gray);">从现有的联系人列表中选择，或点击左侧添加新朋友以开启对话。</p>
      </div>

      <!-- 活动聊天窗口 -->
      <div v-else class="chat-window">
        <!-- 窗口头部（带返回按钮） -->
        <div class="chat-header">
          <button @click="selectedContact = null" class="btn-back">
            <svg viewBox="0 0 24 24" class="svg-inline"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </button>
          <div class="header-info">
            <span class="header-name">@{{ selectedContact }}</span>
            <span class="header-status">{{ connected ? '实时在线' : '离线接收' }}</span>
          </div>
        </div>

        <!-- 对话消息池 -->
        <div class="chat-body" id="chatFlow">
          <div v-for="(msg, idx) in messages" :key="idx" 
               :class="['message-row', msg.system ? 'sys-row' : (msg.self ? 'self-row' : 'peer-row')]">
            <div v-if="!msg.system" class="msg-bubble">
              <img v-if="isImage(msg.text)" :src="msg.text" class="chat-img" @load="scrollToBottom" />
              <span v-else>{{ msg.text }}</span>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
            <div v-else class="sys-notice">{{ msg.text }}</div>
          </div>
        </div>

        <!-- 底部消息发送栏 -->
        <div class="chat-footer">
          <div class="input-pill">
            <!-- 隐藏的文件选择框 -->
            <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="handleImageUpload">
            
            <!-- 发送照片的按钮 -->
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

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '../store/auth'
import { formatLocalTime } from '../utils/date'  // 💡 引入我们之前设计的全局时间格式化工具！

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000'
const WS_BASE  = import.meta.env.VITE_WS_BASE || 'ws://127.0.0.1:3000'

const authStore = useAuthStore()
const connected = ref(false)
const showAddModal = ref(false)
const newFriendUsername = ref('')

const friends = ref([])
const selectedContact = ref(null)
const messageInput = ref('')
const messages = reactive([])
let ws = null

const fileInput = ref(null)

onMounted(() => {
  fetchFriends()
  connectChat() // 启动时自动调用连接函数
})

onUnmounted(() => {
  if (ws) ws.close()
})

// 1. API: 获取联系人列表
const fetchFriends = async () => {
  try {
    const res = await fetch(`${API_BASE}/chat/friends`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    const data = await res.json()
    if (res.ok) {
      friends.value = data.friends
    }
  } catch (err) {
    console.error('获取联系人列表失败:', err)
  }
}

// 2. API: 添加好友
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

// 3. 选中联系人：加载历史双向消息记录并自动转换时区
const selectContact = async (friendUsername) => {
  selectedContact.value = friendUsername
  messages.length = 0
  
  try {
    const res = await fetch(`${API_BASE}/chat/history/${friendUsername}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    const data = await res.json()
    if (res.ok) {
      // 💡 核心升级：遍历历史记录，使用 formatLocalTime 进行本地时区自动换算
      const localizedHistory = data.history.map(msg => ({
        ...msg,
        time: formatLocalTime(msg.time)
      }))
      messages.push(...localizedHistory)
      scrollToBottom()
    }
  } catch (err) {
    messages.push({ system: true, text: '❌ 无法载入历史聊天记录' })
  }
}

// 4. 建立 / 重连 WebSocket 通道
const connectChat = () => {
  if (!authStore.username) return
  if (ws) ws.close() // 防止重复连接
  
  messages.push({ system: true, text: '🔌 正在与实时会话网关联络...' })
  
  ws = new WebSocket(`${WS_BASE}/chat/ws/${authStore.username}`)
  
  ws.onopen = () => {
    connected.value = true
    messages.push({ system: true, text: '🟢 私信通道已安全建立。' })
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (selectedContact.value === data.from) {
      messages.push({
        from: data.from,
        text: data.message,
        time: getCurrentTimeLabel(),
        self: false,
        system: false
      })
      scrollToBottom()
    }
  }

  ws.onclose = () => {
    connected.value = false
    messages.push({ system: true, text: '🔴 连接断开，可点击右上角重新连接。' })
  }
}

// 5. 发送私信
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
    system: false 
  })
  messageInput.value = ''
  scrollToBottom()
}

// 6. 发送照片逻辑
const triggerImageSelect = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
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
      system: false
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

const scrollToBottom = () => {
  nextTick(() => {
    const flow = document.getElementById('chatFlow')
    if (flow) flow.scrollTop = flow.scrollHeight
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
.contact-avatar {
  width: 38px; height: 38px; background: #ccd6dd; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem; color: white;
}
.contact-name { font-weight: bold; font-size: 0.95rem; }

/* 右侧聊天主窗口 */
.chat-main { width: 100%; display: flex; flex-direction: column; }
.welcome-box { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 24px; }

.chat-window { display: flex; flex-direction: column; height: 100%; }
.chat-header {
  display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--x-border);
}
.btn-back { background: transparent; border: none; cursor: pointer; color: var(--x-text-main); display: flex; align-items: center; }
.header-info { display: flex; flex-direction: column; }
.header-name { font-weight: bold; font-size: 0.95rem; }
.header-status { font-size: 0.8rem; color: var(--x-text-gray); }

.chat-body { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: white; }
.message-row { display: flex; width: 100%; }
.self-row { justify-content: flex-end; }
.peer-row { justify-content: flex-start; }
.sys-row { justify-content: center; }

.msg-bubble {
  max-width: 70%; padding: 10px 14px; font-size: 0.95rem; line-height: 1.4; word-wrap: break-word; position: relative;
}
.self-row .msg-bubble { background: var(--x-blue); color: white; border-radius: 18px 18px 2px 18px; }
.peer-row .msg-bubble { background: #eff3f4; color: var(--x-text-main); border-radius: 18px 18px 18px 2px; }
.msg-time { display: block; font-size: 0.7rem; opacity: 0.7; margin-top: 4px; text-align: right; }
.sys-notice { font-size: 0.8rem; color: var(--x-text-gray); background: #f7f9fa; padding: 4px 12px; border-radius: 9999px; }

.chat-img {
  max-width: 100%;
  max-height: 220px;
  border-radius: 12px;
  display: block;
  margin-top: 4px;
  cursor: pointer;
}

.chat-footer { padding: 12px 16px; border-top: 1px solid var(--x-border); }
.input-pill { display: flex; align-items: center; background: #f7f9fa; border-radius: 9999px; padding: 4px 14px; gap: 8px; }
.input-pill input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.95rem; height: 32px; }
.btn-send { background: transparent; border: none; cursor: pointer; display: flex; align-items: center; color: var(--x-blue); }
.btn-send:disabled { color: var(--x-text-gray); cursor: not-allowed; }

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