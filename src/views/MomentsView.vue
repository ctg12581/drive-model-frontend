<!-- src/views/MomentsView.vue -->
<template>
  <div class="feed-container">
    <!-- 顶部发布动态框 (保持不变) -->
    <div class="compose-card">
      <div class="compose-layout">
        <div class="user-avatar">
          <img v-if="isUrl(authStore.avatar)" :src="authStore.avatar" class="avatar-img-el" />
          <span v-else>{{ authStore.avatar }}</span>
        </div>
        <div class="compose-main">
          <textarea v-model="newPost" placeholder="有什么新鲜事？" class="x-textarea" rows="3" max-length="280"></textarea>
          <div class="compose-footer">
            <span class="char-count">{{ newPost.length }}/280</span>
            <button @click="publishPost" class="x-btn-primary" :disabled="!newPost.trim()">发布</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 💡 骨架屏：只有在【完全没有任何本地历史缓存】时，才需要展示 -->
    <div v-if="loading && posts.length === 0" class="skeleton-container">
      <div v-for="i in 3" :key="i" class="skeleton-card">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-info">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line long"></div>
          <div class="skeleton-line mid"></div>
        </div>
      </div>
    </div>

    <!-- 真实动态列表：如果本地有缓存，会瞬间 0ms 秒开呈现，随后在后台静默刷新 -->
    <div v-else class="result-feed">
      <div v-if="posts.length === 0" class="no-posts-hint" style="text-align: center; padding: 40px; color: var(--x-text-gray);">
        暂无动态，快来发布第一条新鲜事吧！
      </div>
      <div v-for="post in posts" :key="post.id" class="tweet-card">
        <div class="tweet-avatar" @click="openUserProfile(post.username)">
          <img v-if="isUrl(post.avatar)" :src="post.avatar" class="avatar-img-el" />
          <span v-else-if="post.avatar && post.avatar !== '👤'">{{ post.avatar }}</span>
          <span v-else>{{ post.username[0].toUpperCase() }}</span>
        </div>
        <div class="tweet-content">
          <div class="tweet-header">
            <div class="tweet-meta">
              <span class="tweet-author">{{ post.nickname }}</span>
              <span class="tweet-handle">@{{ post.username }} · {{ formatLocalTime(post.time) }}</span>
            </div>
          </div>
          <div class="tweet-body">
            <p class="tweet-text">{{ post.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 个人主页弹窗 (Profile Modal) (保持不变) -->
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import { useMomentsStore } from '../store/moments'
import { formatLocalTime } from '../utils/date'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000'
const authStore = useAuthStore()
const momentsStore = useMomentsStore()

const newPost = ref('')

// 💡 2. 核心修改：让本地渲染变量直接绑定 Pinia 里的缓存，一秒完成初始化
const posts = ref(momentsStore.cachedPosts)

// 💡 3. 核心修改：如果缓存里有数据，loading 直接置为 false（完全跳过骨架屏直接呈现数据）
const loading = ref(posts.value.length === 0) 

const activeProfile = ref(null)

onMounted(() => {
  fetchGlobalMoments()
})

const fetchGlobalMoments = async () => {
  // 只有在完全没有历史缓存时，才展示骨架屏
  if (posts.value.length === 0) {
    loading.value = true
  }
  try {
    const res = await fetch(`${API_BASE}/moments`)
    const data = await res.json()
    if (res.ok) {
      // 💡 4. 数据回来后，更新全局缓存仓库，自动触发 LocalStorage 持久化
      momentsStore.setPosts(data.moments)
      // 💡 5. 静默更新当前视图
      posts.value = data.moments
    }
  } catch (err) {
    console.error('获取动态失败', err)
  } finally {
    loading.value = false
  }
}

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
      fetchGlobalMoments()
    }
  } catch {
    alert('发布失败')
  }
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
    alert('装载用户主页失败')
  }
}

const isUrl = (text) => {
  if (!text) return false
  return text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/')
}
</script>

<style scoped>
.feed-container { width: 100%; position: relative; }

/* 🌟 骨架屏核心样式（渐变呼吸灯动画） */
@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
.skeleton-container { display: flex; flex-direction: column; }
.skeleton-card {
  display: flex; gap: 12px; padding: 16px; border-bottom: 1px solid var(--x-border);
  animation: pulse 1.5s infinite ease-in-out;
}
.skeleton-avatar { width: 40px; height: 40px; border-radius: 50%; background: #eff3f4; }
.skeleton-info { flex: 1; display: flex; flex-direction: column; gap: 8px; justify-content: center; }
.skeleton-line { height: 11px; background: #eff3f4; border-radius: 4px; }
.skeleton-line.short { width: 25%; }
.skeleton-line.mid { width: 45%; }
.skeleton-line.long { width: 85%; }

/* 以下保持原有的 Moments 样式 */
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

.tweet-card { display: flex; padding: 16px; border-bottom: 1px solid var(--x-border); gap: 12px; }
.tweet-avatar {
  width: 40px; height: 40px; border-radius: 50%; background: #ffffff; border: 1px solid var(--x-border);
  display: flex; align-items: center; justify-content: center; font-size: 1.5rem; cursor: pointer; overflow: hidden;
}
.tweet-main { flex: 1; text-align: left; }
.tweet-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.tweet-author { font-weight: bold; font-size: 0.95rem; cursor: pointer; color: var(--x-text-main); }
.tweet-author:hover { text-decoration: underline; }
.tweet-handle { color: var(--x-text-gray); font-size: 0.85rem; }
.tweet-content { font-size: 0.95rem; line-height: 1.5; word-wrap: break-word; color: var(--x-text-main); }

/* 弹窗 */
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
  width: 70px; height: 70px; background: #ffffff; border: 1px solid var(--x-border); border-radius: 50%; font-size: 2.5rem;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; overflow: hidden;
}
.modal-nickname { margin: 0; font-size: 1.25rem; font-weight: 800; }
.modal-handle { margin: 4px 0 0 0; color: var(--x-text-gray); font-size: 0.9rem; }

.modal-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
.modal-tab-title { font-size: 1rem; font-weight: 800; border-bottom: 2px solid var(--x-blue); padding-bottom: 6px; margin: 0 0 12px 0; display: inline-block;}
.no-posts-hint { text-align: center; color: var(--x-text-gray); font-size: 0.9rem; padding: 24px 0; }
.modal-tweet { padding: 12px 0; border-bottom: 1px solid var(--x-border); text-align: left; }
.modal-tweet-time { font-size: 0.8rem; color: var(--x-text-gray); margin-bottom: 4px; }
.modal-tweet-content { font-size: 0.95rem; line-height: 1.4; word-wrap: break-word;}
</style>