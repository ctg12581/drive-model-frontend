<template>
  <div class="dm-layout">
    <!-- 顶部目标接收人声明栏 -->
    <div class="dm-header">
      <div class="dm-header-title">
        <span class="user-avatar">💬</span>
        <div class="header-text">
          <span class="header-name">
            {{ targetUser ? `正在和 @${targetUser} 对话` : '私信收件箱' }}
          </span>
          <span class="header-status">
            {{ connected ? '实时连接激活' : '连接断开' }}
          </span>
        </div>
      </div>
      <button v-if="!connected" @click="connectChat" class="btn-reconnect">重连</button>
    </div>

    <!-- 消息对话池 -->
    <div class="dm-body" id="chatFlow">
      <div v-for="(msg, idx) in messages" :key="idx" 
           :class="['dm-wrapper', msg.system ? 'sys-wrapper' : (msg.self ? 'self-wrapper' : 'peer-wrapper')]">
        
        <!-- 正常聊天气泡 -->
        <div v-if="!msg.system" class="dm-bubble">
          {{ msg.text }}
        </div>
        
        <!-- 系统通知提示 -->
        <div v-else class="system-notification">
          {{ msg.text }}
        </div>
      </div>
    </div>

    <!-- 底部药丸输入区 -->
    <div class="dm-footer">
      <div class="input-pill">
        <input type="text" v-model="targetUser" class="recipient-input" placeholder="收件人 @..." :disabled="!connected">
        <input type="text" v-model="messageInput" class="msg-input" placeholder="输入新私信..." :disabled="!connected" @keyup.enter="sendMessage">
        <button @click="sendMessage" class="send-circle" :disabled="!connected || !messageInput">
          <svg viewBox="0 0 24 24" class="svg-send"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '../store/auth'

const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://127.0.0.1:3000'
const authStore = useAuthStore()
const connected = ref(false)
const targetUser = ref('')
const messageInput = ref('')
const messages = reactive([])
let ws = null

onMounted(() => {
  connectChat()
})

onUnmounted(() => {
  if (ws) ws.close()
})

const connectChat = () => {
  if (!authStore.username) return
  messages.push({ system: true, text: '🔌 正在与实时会话网关握手...' })
  
  ws = new WebSocket(`${WS_BASE}/chat/ws/${authStore.username}`)
  
  ws.onopen = () => {
    connected.value = true
    messages.push({ system: true, text: '🟢 私信通道已安全建立。' })
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

  ws.onclose = () => {
    connected.value = false
    messages.push({ system: true, text: '🔴 连接断开，可点击右上角重新连接。' })
  }
}

const sendMessage = () => {
  if (!connected.value || !ws) return
  if (!targetUser.value.trim()) { alert('请输入接收方的 𝕏 账号'); return; }
  if (!messageInput.value.trim()) return

  ws.send(JSON.stringify({ to: targetUser.value.trim(), message: messageInput.value.trim() }))
  messages.push({ from: '我', text: messageInput.value, self: true, system: false })
  messageInput.value = ''
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    const flow = document.getElementById('chatFlow')
    if (flow) flow.scrollTop = flow.scrollHeight
  })
}
</script>

<style scoped>
.dm-layout { display: flex; flex-direction: column; height: calc(100vh - 106px); } /* 减去顶部和底部导航栏的高度 */
@media (min-width: 768px) {
  .dm-layout { height: calc(100vh - 24px); } /* PC 端充满屏幕 */
}

/* 会话头部 */
.dm-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid var(--x-border);
}
.dm-header-title { display: flex; align-items: center; gap: 12px; }
.user-avatar { font-size: 1.5rem; }
.header-text { display: flex; flex-direction: column; }
.header-name { font-weight: bold; font-size: 0.95rem; }
.header-status { font-size: 0.8rem; color: var(--x-text-gray); }
.btn-reconnect {
  background: var(--x-blue); color: white; border: none; font-size: 0.8rem;
  font-weight: bold; padding: 4px 12px; border-radius: 9999px; cursor: pointer;
}

/* 消息流体 */
.dm-body { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #ffffff; }
.dm-wrapper { display: flex; width: 100%; }
.self-wrapper { justify-content: flex-end; }
.peer-wrapper { justify-content: flex-start; }
.sys-wrapper { justify-content: center; }

/* 聊天气泡 */
.dm-bubble { max-width: 70%; padding: 10px 16px; font-size: 0.95rem; line-height: 1.4; word-wrap: break-word; }
.self-wrapper .dm-bubble {
  background: var(--x-blue); color: white;
  border-radius: 20px 20px 4px 20px;
}
.peer-wrapper .dm-bubble {
  background: #eff3f4; color: var(--x-text-main);
  border-radius: 20px 20px 20px 4px;
}
.system-notification {
  font-size: 0.8rem; color: var(--x-text-gray); background: #f7f9fa;
  padding: 6px 16px; border-radius: 9999px; text-align: center;
}

/* 底部药丸输入区 */
.dm-footer { padding: 12px 16px; border-top: 1px solid var(--x-border); background: #ffffff; }
.input-pill {
  display: flex; align-items: center; background: #f7f9fa;
  border-radius: 9999px; padding: 4px 12px; gap: 8px; border: 1px solid transparent;
}
.input-pill:focus-within { background: #ffffff; border-color: var(--x-blue); }
.recipient-input {
  width: 100px; border: none; background: transparent; outline: none;
  font-weight: bold; color: var(--x-blue); font-size: 0.9rem;
}
.msg-input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.95rem; }
.send-circle {
  background: transparent; border: none; outline: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; padding: 0;
}
.send-circle:disabled { color: var(--x-text-gray); cursor: not-allowed; }
.send-circle:not(:disabled) { color: var(--x-blue); }
.svg-send { width: 22px; height: 22px; fill: currentColor; }
</style>