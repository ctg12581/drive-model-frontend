<!-- src/views/MomentsView.vue -->
<template>
  <div class="feed-container">
    <!-- 顶部发布动态框 -->
    <div class="compose-card">
      <div class="compose-layout">
        <div class="user-avatar">{{ authStore.username[0].toUpperCase() }}</div>
        <div class="compose-main">
          <textarea v-model="newPost" placeholder="有什么新鲜事？" class="x-textarea" rows="3" max-length="280"></textarea>
          <div class="compose-footer">
            <span class="char-count">{{ newPost.length }}/280</span>
            <button @click="publishPost" class="x-btn-primary" :disabled="!newPost.trim()">发布</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 动态时间轴流 -->
    <div class="timeline">
      <div v-for="post in posts" :key="post.id" class="tweet-card">
        <!-- 点击头像打开该联系人的个人主页弹窗 -->
        <div class="tweet-avatar" @click="openUserProfile(post.username)">
          {{ post.avatar || '👤' }}
        </div>
        <div class="tweet-main">
          <div class="tweet-header">
            <span class="tweet-author" @click="openUserProfile(post.username)">{{ post.nickname }}</span>
            <span class="tweet-handle">@{{ post.username }} · {{ formatLocalTime(post.time) }}</span>
          </div>
          <div class="tweet-content">{{ post.content }}</div>
        </div>
      </div>
    </div>

    <!-- 🌟 精美个人主页弹窗 (Profile Modal) -->
    <div v-if="activeProfile" class="modal-backdrop" @click.self="activeProfile = null">
      <div class="modal-card">
        <button class="modal-close" @click="activeProfile = null">✕</button>
        
        <!-- 主页头部基本信息 -->
        <div class="modal-header">
          <div class="modal-avatar-big">{{ activeProfile.user.avatar || '👤' }}</div>
          <h2 class="modal-nickname">{{ activeProfile.user.nickname }}</h2>
          <p class="modal-handle">@{{ activeProfile.user.username }}</p>
        </div>

        <!-- 该用户的个人专属动态流 -->
        <div class="modal-body">
          <h3 class="modal-tab-title">TA 的动态 ({{ activeProfile.posts.length }})</h3>
          <div v-if="activeProfile.posts.length === 0" class="no-posts-hint">TA 还没有发过任何动态。</div>
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import { formatLocalTime } from '../utils/date'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000'
const authStore = useAuthStore()
const newPost = ref('')
const posts = ref([])

// 弹窗状态存储：包含被查看用户的基本资料及TA的历史帖子
const activeProfile = ref(null)

onMounted(() => {
  fetchGlobalMoments()
})

// 1. API: 获取全局动态
const fetchGlobalMoments = async () => {
  try {
    const res = await fetch(`${API_BASE}/moments`)
    const data = await res.json()
    if (res.ok) {
      posts.value = data.moments
    }
  } catch {
    console.error('获取动态失败')
  }
}

// 2. API: 发布新动态
const publishPost = async () => {
  if (!newPost.value.trim()) return
  try {
    const res = await fetch(`${API_BASE}/moments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ content: newPost.value })
    })
    if (res.ok) {
      newPost.value = ''
      fetchGlobalMoments() // 重新加载流
    }
  } catch {
    alert('发布失败，请重试')
  }
}

// 3. API: 点击头像，打开并装载目标用户的个人主页弹窗
const openUserProfile = async (targetUsername) => {
  try {
    // 异步双向拉取：基本资料 + 个人帖子
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
    alert('装载用户主页失败')
  }
}
</script>

<style scoped>
.feed-container { width: 100%; position: relative; }

/* 发帖卡片 */
.compose-card { padding: 16px; border-bottom: 1px solid var(--x-border); }
.compose-layout { display: flex; gap: 12px; }
.user-avatar {
  width: 40px; height: 40px; border-radius: 50%; background: #1d9bf0; color: white;
  display: flex; align-items: center; justify-content: center; font-weight: bold;
}
.compose-main { flex: 1; display: flex; flex-direction: column; }
.x-textarea {
  width: 100%; border: none; resize: none; font-size: 1.1rem; outline: none; margin-top: 4px;
}
.compose-footer {
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1px solid var(--x-border); padding-top: 12px; margin-top: 8px;
}
.char-count { font-size: 0.8rem; color: var(--x-text-gray); }
.x-btn-primary {
  background: var(--x-blue); color: white; border: none; padding: 0 16px;
  height: 36px; border-radius: 9999px; font-weight: bold; cursor: pointer;
}
.x-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* 动态列表卡片 */
.tweet-card { display: flex; padding: 16px; border-bottom: 1px solid var(--x-border); gap: 12px; }
.tweet-avatar {
  width: 40px; height: 40px; border-radius: 50%; background: #eff3f4;
  display: flex; align-items: center; justify-content: center; font-size: 1.5rem; cursor: pointer;
}
.tweet-main { flex: 1; }
.tweet-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.tweet-author { font-weight: bold; font-size: 0.95rem; cursor: pointer; }
.tweet-author:hover { text-decoration: underline; }
.tweet-handle { color: var(--x-text-gray); font-size: 0.85rem; }
.tweet-content { font-size: 0.95rem; line-height: 1.5; word-wrap: break-word; }

/* 🌟 全屏弹窗样式 (Profile Modal) */
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
.modal-tweet { padding: 12px 0; border-bottom: 1px solid var(--x-border); }
.modal-tweet-time { font-size: 0.8rem; color: var(--x-text-gray); margin-bottom: 4px; }
.modal-tweet-content { font-size: 0.95rem; line-height: 1.4; word-wrap: break-word;}
</style>