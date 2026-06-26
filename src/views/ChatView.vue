<!-- src/views/ChatView.vue -->
<template>
  <div class="chat-card">
    <h2>互聊大厅</h2>
    <div class="chat-flow">
      <!-- 聊天消息列表渲染 -->
    </div>
    <div class="input-area">
      <input v-model="targetUser" placeholder="接收人" />
      <input v-model="message" placeholder="消息" @keyup.enter="sendMessage" />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../store/auth'; // 引入全局登录状态

const authStore = useAuthStore();
const targetUser = ref('');
const message = ref('');
let ws = null;

// 该模块专属的 WebSocket 连接逻辑
onMounted(() => {
  ws = new WebSocket(`ws://localhost:3000/chat/ws/${authStore.username}`);
  // ... 连接成功和接收消息的逻辑 ...
});

onUnmounted(() => {
  if (ws) ws.close(); // 离开该页面时自动断开连接，释放资源
});

const sendMessage = () => {
  // ... 发送逻辑 ...
};
</script>

<style scoped>
/* scoped 属性表示这些样式只在当前组件内生效，绝对不会污染其他页面 */
.chat-card {
  padding: 20px;
  background: #f9fafb;
}
</style>