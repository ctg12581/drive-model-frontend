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
        <div v-for="friend in friends" :key="friend" 
             :class="['contact-item', { active: selectedContact === friend }]"
             @click="selectContact(friend)">
          <div class="contact-avatar">{{ friend[0].toUpperCase() }}</div>
          <div class="contact-name">@{{ friend }}</div>
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
              {{ msg.text }}
              <span class="msg-time">{{ msg.time }}</span>
            </div>
            <div v-else class="sys-notice">{{ msg.text }}</div>
          </div>
        </div>

        <!-- 底部消息发送栏 -->
        <div class="chat-footer">
          <div class="input-pill">
            <input type="text" v-model="messageInput" placeholder="开始撰写私信..." @keyup.enter="sendMessage">
            <button @click="sendMessage" class="btn-send" :disabled="!messageInput.trim()">
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

// 组件载入时：获取好友列表 + 建立 WebSocket 双向连接
onMounted(() => {
  fetchFriends()
  initWebSocket()
})

onUnmounted(() => {
  if (ws) ws.close()
})

// 1. 带有详细日志的 WebSocket 初始化
const initWebSocket = () => {
  if (!authStore.username) {
    console.warn("⚠️ 警告：Pinia 中未读取到用户名，无法建立 WebSocket 连接！");
    messages.push({ system: true, text: '⚠️ 错误：未读取到登录用户名，请尝试重新登录。' })
    return
  }
  
  const wsUrl = `${BASE_WS_URL}/chat/ws/${authStore.username}`;
  console.log(`📡 正在尝试连接 WebSocket 地址: ${wsUrl}`);
  messages.push({ system: true, text: `🔌 正在尝试连接: ${wsUrl}` })
  
  ws = new WebSocket(wsUrl)
  
  ws.onopen = () => { 
    connected.value = true 
    console.log("✅ WebSocket 连接已成功建立！")
  }
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.system) {
      messages.push({ system: true, text: `⚠️ 提醒: ${data.message}` })
    } else {
      messages.push({ from: data.from, text: data.message, self: false, system: false })
    }
    scrollToBottom()
  }
  
  ws.onclose = (event) => { 
    connected.value = false 
    console.warn("❌ WebSocket 连接已关闭，代码:", event.code, "原因:", event.reason);
  }

  ws.onerror = (err) => {
    console.error("❌ WebSocket 发生错误:", err);
  }
}

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
  } catch {
    console.error('获取联系人列表失败')
  }
}

// 2. API: 添加新好友
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
      fetchFriends() // 实时重刷联系人
    } else {
      alert(data.detail || '加好友失败')
    }
  } catch {
    alert('网络故障')
  }
}

// 3. 选中联系人：加载历史双向消息记录
const selectContact = async (friend) => {
  selectedContact.value = friend
  messages.length = 0 // 清空原先渲染的历史
  
  try {
    const res = await fetch(`${API_BASE}/chat/history/${friend}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    const data = await res.json()
    if (res.ok) {
      // 压入双向的历史消息
      messages.push(...data.history)
      scrollToBottom()
    }
  } catch {
    messages.push({ system: true, text: '❌ 无法载入历史聊天记录' })
  }
}

// 2. 带有拦截弹窗的发送方法（替换原有的 sendMessage）
const sendMessage = () => {
  // 显式拦截并弹窗，告知具体是哪个对象为空
  if (!connected.value) {
    alert("⚠️ 发送失败：实时聊天未连接（右上角为红色状态），请先点击右上角 [重连] 或检查网络。");
    return;
  }
  if (!ws) {
    alert("⚠️ 发送失败：WebSocket 实例未创建成功！");
    return;
  }
  if (!selectedContact.value) {
    alert("⚠️ 发送失败：请先在左侧选择一个联系人！");
    return;
  }
  
  const text = messageInput.value.trim()
  if (!text) {
    alert("⚠️ 不能发送空消息");
    return;
  }

  try {
    // WebSocket 实时发射
    ws.send(JSON.stringify({ to: selectedContact.value, message: text }))
    
    // 本地推入
    messages.push({
      from: authStore.username,
      text: text,
      time: getCurrentTimeLabel(),
      self: true,
      system: false
    })
    
    messageInput.value = ''
    scrollToBottom()
  } catch (error) {
    alert(`❌ 发送消息时发生异常: ${error.message}`);
  }
}

// 辅助方法：滑动至底部与时间标签
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
/* 𝕏 分栏响应式排版 */
.x-dm-layout {
  display: flex;
  height: calc(100vh - 106px); /* 移动端高度适配 */
  width: 100%;
}
@media (min-width: 768px) {
  .x-dm-layout { height: calc(100vh - 24px); } /* PC 铺满 */
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
.btn-icon { background: transparent; border: none; cursor: pointer; color: var(--x-blue); }
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

.chat-footer { padding: 12px 16px; border-top: 1px solid var(--x-border); }
.input-pill { display: flex; align-items: center; background: #f7f9fa; border-radius: 9999px; padding: 4px 14px; gap: 8px; }
.input-pill input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.95rem; height: 32px; }
.btn-send { background: transparent; border: none; cursor: pointer; display: flex; align-items: center; color: var(--x-blue); }
.btn-send:disabled { color: var(--x-text-gray); cursor: not-allowed; }

/* 📱 双端自适应：在小屏幕（手机）下的分栏层级隐藏 */
@media (max-width: 767px) {
  .contacts-sidebar.hide-on-mobile { display: none !important; }
  .chat-main.hide-on-mobile { display: none !important; }
  .btn-back { display: block !important; } /* 手机端显示返回按钮 */
}
@media (min-width: 768px) {
  .contacts-sidebar { width: 280px; } /* PC端侧边栏固定宽度 */
  .chat-main { flex: 1; }
  .btn-back { display: none !important; } /* PC端隐藏返回按钮 */
}
</style>