<template>
  <div class="card">
    <div class="chat-header">
      <h2 style="margin: 0;">互聊大厅</h2>
      <div>
        状态: 
        <span :class="['badge', connected ? 'badge-success' : 'badge-error']">
          {{ connected ? `在线 (${authStore.username})` : '未连接' }}
        </span>
      </div>
    </div>

    <!-- 消息区域 -->
    <div class="chat-messages" id="chatFlow">
      <div v-for="(msg, idx) in messages" :key="idx" 
           :class="['message', msg.system ? 'msg-system' : (msg.self ? 'msg-sent' : 'msg-received')]">
        <span v-if="!msg.system" class="sender-name">{{ msg.from }}</span>
        <span>{{ msg.text }}</span>
      </div>
    </div>

    <!-- 输入操作区 -->
    <div class="chat-input-area">
      <input type="text" v-model="targetUser" placeholder="目标用户名" class="input-target" :disabled="!connected">
      <input type="text" v-model="messageInput" placeholder="发送即时消息..." class="input-msg" :disabled="!connected" @keyup.enter="sendMessage">
      <button @click="sendMessage" class="btn" :disabled="!connected">发送</button>
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

// 组件挂载时，自动触发 WebSocket 异步建立
onMounted(() => {
  if (!authStore.username) return
  messages.push({ system: true, text: '📡 正在和远端 WebSocket 建立双向握手...' })
  
  ws = new WebSocket(`${WS_BASE}/chat/ws/${authStore.username}`)
  
  ws.onopen = () => {
    connected.value = true
    messages.push({ system: true, text: '🟢 连接已激活，输入对方账号即可发起在线聊。' })
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.system) {
      messages.push({ system: true, text: `⚠️ 系统提示: ${data.message}` })
    } else {
      messages.push({ from: data.from, text: data.message, self: false, system: false })
    }
    scrollToBottom()
  }

  ws.onclose = () => {
    connected.value = false
    messages.push({ system: true, text: '🔌 通道被服务器或本地异常关闭。' })
  }
})

// 🔕 组件卸载销毁时，自动关闭 Socket 连接，释放内存资源
onUnmounted(() => {
  if (ws) {
    ws.close()
  }
})

const sendMessage = () => {
  if (!connected.value || !ws) return
  if (!targetUser.value.trim()) { alert('请输入接收方用户名'); return; }
  if (!messageInput.value.trim()) return

  const payload = {
    to: targetUser.value.trim(),
    message: messageInput.value.trim()
  }

  ws.send(JSON.stringify(payload))
  messages.push({ from: '我', text: messageInput.value, self: true, system: false })
  messageInput.value = ''
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    const flow = document.getElementById('chatFlow')
    if (flow) {
      flow.scrollTop = flow.scrollHeight
    }
  })
}
</script>

<style scoped>
.chat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; }
.badge-success { background: #d1fae5; color: #065f46; }
.badge-error { background: #fee2e2; color: #991b1b; }

.chat-messages { display: flex; flex-direction: column; height: 350px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; overflow-y: auto; background: #f9fafb; margin-bottom: 12px; }
.message { margin-bottom: 8px; padding: 8px 12px; border-radius: 8px; max-width: 70%; word-wrap: break-word; }
.msg-received { background: #e5e7eb; align-self: flex-start; margin-right: auto; }
.msg-sent { background: #2563eb; color: white; align-self: flex-end; margin-left: auto; }
.msg-system { background: #fef3c7; border: 1px solid #fde68a; color: #92400e; text-align: center; max-width: 100%; font-size: 0.8rem; }
.sender-name { font-size: 0.75rem; display: block; opacity: 0.8; font-weight: bold; margin-bottom: 2px; }

.chat-input-area { display: flex; gap: 10px; }
.input-target { flex: 1; max-width: 120px; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; }
.input-msg { flex: 3; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; }
</style>