<!-- src/views/NotificationsView.vue -->
<template>
  <div class="notify-container">
    <div class="notify-header">
      <h2 style="margin: 0; font-size: 1.25rem; font-weight: 800;">系统通知</h2>
    </div>

    <!-- 待审批列表 -->
    <div class="notify-list">
      <div v-if="requests.length === 0" class="no-notify">
        👋 暂无未读系统通知或好友申请。
      </div>
      <div v-for="req in requests" :key="req.id" class="notify-card">
        <div class="notify-card-left">
          <div class="notify-avatar">{{ req.avatar }}</div>
          <div class="notify-content">
            <span class="user-strong">@{{ req.username }}</span> ({{ req.nickname }}) 向你发送了双向好友/互关申请
          </div>
        </div>
        <div class="notify-card-right">
          <button @click="handleAction(req.id, 'accept')" class="btn-action accept-btn">同意</button>
          <button @click="handleAction(req.id, 'reject')" class="btn-action reject-btn">拒绝</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useChatStore } from '../store/chat'
import { apiFetch } from '../utils/api'

const chatStore = useChatStore()
const requests = ref([])

onMounted(() => {
  fetchPendingRequests()
})

const fetchPendingRequests = async () => {
  try {
    const res = await apiFetch('/chat/friend-requests/pending')
    const data = await res.json()
    if (res.ok) {
      requests.value = data.requests
      // 💡 同步重设 Pinia 的通知计数器，实现已读气泡静默消失
      chatStore.pendingRequestsCount = data.requests.length
    }
  } catch {
    console.error('获取通知列表失败')
  }
}

// 统一执行 同意 / 拒绝 动作
const handleAction = async (requestId, action) => {
  const endpoint = `/chat/friend-requests/${action}`
  try {
    const res = await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId })
    })
    if (res.ok) {
      // 从本地列表中滤掉，并更新全局计数器
      requests.value = requests.value.filter(r => r.id !== requestId)
      chatStore.pendingRequestsCount = requests.value.length
      alert(action === 'accept' ? '已同意好友申请' : '已拒绝好友申请')
    }
  } catch {
    alert('请求处理失败')
  }
}
</script>

<style scoped>
.notify-container { width: 100%; }
.notify-header { padding: 12px 16px; border-bottom: 1px solid var(--x-border); }
.no-notify { text-align: center; padding: 40px; color: var(--x-text-gray); font-size: 0.95rem; }

.notify-card {
  display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid var(--x-border); gap: 12px;
}
.notify-card-left { display: flex; align-items: center; gap: 12px; text-align: left; }
.notify-avatar {
  width: 40px; height: 40px; background: #eff3f4; border-radius: 50%; font-size: 1.5rem;
  display: flex; align-items: center; justify-content: center;
}
.notify-content { font-size: 0.95rem; line-height: 1.4; color: var(--x-text-main); }
.user-strong { font-weight: bold; color: var(--x-blue); }

.notify-card-right { display: flex; gap: 8px; }
.btn-action {
  border: none; font-weight: bold; font-size: 0.8rem; padding: 0 12px; height: 28px; border-radius: 9999px; cursor: pointer;
}
.accept-btn { background: var(--x-blue); color: white; }
.accept-btn:hover { background: #1a8cd8; }
.reject-btn { background: transparent; border: 1px solid #fca5a5; color: #ef4444; }
.reject-btn:hover { background: #fee2e2; }
</style>