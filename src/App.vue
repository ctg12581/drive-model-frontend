<!-- src/App.vue (除了 <style> 的完整代码) -->
<template>
  <div class="app-layout">
    <!-- 移动端顶部固定栏 -->
    <header class="mobile-top-bar">
      <div class="avatar-placeholder">
        <img v-if="isUrl(authStore.avatar)" :src="authStore.avatar" class="avatar-img-el" />
        <span v-else>{{ authStore.avatar }}</span>
      </div>
      <div class="app-logo">𝕏 DRIVE Space</div>
      <div class="top-action-placeholder" style="width: 32px;"></div>
    </header>

    <!-- 核心响应式布局 -->
    <div class="main-container">
      <!-- 左侧边栏导航 (𝕏 经典版：6 维联动) -->
      <aside class="sidebar">
        <div class="sidebar-logo">𝕏</div>
        <nav class="sidebar-nav">
          <!-- 1. 主页 -->
          <router-link to="/home" class="sidebar-link" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M12 2.69l5.66 5.58a1 1 0 0 1 .3.71V19a2 2 0 0 1-2 2H13v-6h-2v6H8a2 2 0 0 1-2-2V8.98a1 1 0 0 1 .3-.71z"/></svg>
            </span>
            <span class="text">主页</span>
          </router-link>

          <!-- 2. 搜索 (新) -->
          <router-link to="/search" class="sidebar-link" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"/></svg>
            </span>
            <span class="text">搜索</span>
          </router-link>

          <!-- 3. 通知 (新：带待审批未读红点) -->
          <router-link to="/notifications" class="sidebar-link" active-class="active">
            <span class="icon" style="position: relative;">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M21.163 11.636L19 9.473V6c0-3.309-2.691-6-6-6S7 2.691 7 6v3.473L4.837 11.64c-.21.21-.337.5-.337.803v3.53c0 .553.448 1 1 1h5.182a3.003 3.003 0 0 0 5.636 0h5.182c.552 0 1-.447 1-1v-3.53c0-.303-.127-.593-.337-.807zM13 19a1.002 1.002 0 0 1-1-1h2c0 .552-.448 1-1 1zm7-3H6v-3.111l1.837-1.836A1 1 0 0 0 8.163 11V6c0-2.206 1.794-4 4-4s4 1.794 4 4v5a1 1 0 0 0 .326.713L20 12.889V16z"/></svg>
            </span>
            <span class="nav-text-container">
              <span class="text">通知</span>
              <span v-if="chatStore.pendingRequestsCount > 0" class="global-unread-badge">
                {{ chatStore.pendingRequestsCount }}
              </span>
            </span>
          </router-link>

          <!-- 4. 聊天 -->
          <router-link to="/chat" class="sidebar-link" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
            </span>
            <span class="nav-text-container">
              <span class="text">聊天</span>
              <span v-if="chatStore.totalUnreadCount > 0" class="global-unread-badge">
                {{ chatStore.totalUnreadCount }}
              </span>
            </span>
          </router-link>

          <!-- 5. 个人资料 -->
          <router-link to="/auth" class="sidebar-link" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </span>
            <span class="text">个人资料</span>
          </router-link>

          <!-- 💡 6. 经典大发帖丸子按钮 (PC端可见) -->
          <button v-if="authStore.isLoggedIn" @click="showComposeModal = true" class="sidebar-post-btn">
            发 帖
          </button>
        </nav>

        <!-- 侧边栏底部个人名片 -->
        <div v-if="authStore.isLoggedIn" class="sidebar-profile">
          <div class="profile-avatar">
            <img v-if="isUrl(authStore.avatar)" :src="authStore.avatar" class="avatar-img-el" />
            <span v-else>{{ authStore.avatar }}</span>
          </div>
          <div class="profile-info">
            <div class="profile-name">{{ authStore.nickname || authStore.username }}</div>
            <div class="profile-handle" style="font-size: 0.8rem; color: var(--x-text-gray);">@{{ authStore.username }}</div>
          </div>
        </div>
      </aside>

      <!-- 中间主内容流区 -->
      <main class="content-area">
        <router-view />
      </main>

      <!-- 右侧推荐面板 -->
      <aside class="right-panel">
        <div class="trends-box">
          <h3>𝕏 推荐话题</h3>
          <div class="trend-item">
            <span class="trend-category">科技 · 推荐</span>
            <span class="trend-tag">#DRIVE模型架构</span>
            <span class="trend-meta">52.8k 评测</span>
          </div>
          <div class="trend-item">
            <span class="trend-category">社交 · 热议</span>
            <span class="trend-tag">#X.com经典架构</span>
            <span class="trend-meta">18.2k 正在讨论</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- 💡 移动端右下角漂浮发帖按钮 (FAB) (仅移动端显示，在底部上方) -->
    <button v-if="authStore.isLoggedIn" @click="showComposeModal = true" class="mobile-fab-btn">
      <svg viewBox="0 0 24 24" class="svg-inline" style="width: 24px; height: 24px; fill: white;"><path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79.137 23 0 23 0zm-7 11.054c-2.45 0-4.44-1.59-4.44-4.041 0-2.451 1.99-4.441 4.44-4.441 2.451 0 4.441 1.99 4.441 4.441 0 2.451-1.99 4.041-4.441 4.041zM2.5 15h3V13h-3v-3h-2v3h-3v2h3v3h2v-3z"/></svg>
    </button>

    <!-- 移动端底部导航栏 -->
    <nav class="mobile-bottom-bar">
      <!-- 1. 主页 -->
      <router-link to="/home" class="bottom-link" active-class="active">
        <svg viewBox="0 0 24 24" class="svg-icon"><path d="M12 2.69l5.66 5.58a1 1 0 0 1 .3.71V19a2 2 0 0 1-2 2H13v-6h-2v6H8a2 2 0 0 1-2-2V8.98a1 1 0 0 1 .3-.71z"/></svg>
      </router-link>
      <!-- 2. 搜索 -->
      <router-link to="/search" class="bottom-link" active-class="active">
        <svg viewBox="0 0 24 24" class="svg-icon"><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"/></svg>
      </router-link>
      <!-- 3. 通知 -->
      <router-link to="/notifications" class="bottom-link" active-class="active">
        <div class="bottom-icon-container">
          <svg viewBox="0 0 24 24" class="svg-icon"><path d="M21.163 11.636L19 9.473V6c0-3.309-2.691-6-6-6S7 2.691 7 6v3.473L4.837 11.64c-.21.21-.337.5-.337.803v3.53c0 .553.448 1 1 1h5.182a3.003 3.003 0 0 0 5.636 0h5.182c.552 0 1-.447 1-1v-3.53c0-.303-.127-.593-.337-.807zM13 19a1.002 1.002 0 0 1-1-1h2c0 .552-.448 1-1 1zm7-3H6v-3.111l1.837-1.836A1 1 0 0 0 8.163 11V6c0-2.206 1.794-4 4-4s4 1.794 4 4v5a1 1 0 0 0 .326.713L20 12.889V16z"/></svg>
          <span v-if="chatStore.pendingRequestsCount > 0" class="global-unread-badge-mobile">
            {{ chatStore.pendingRequestsCount }}
          </span>
        </div>
      </router-link>
      <!-- 4. 聊天 -->
      <router-link to="/chat" class="bottom-link" active-class="active">
        <div class="bottom-icon-container">
          <svg viewBox="0 0 24 24" class="svg-icon"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
          <span v-if="chatStore.totalUnreadCount > 0" class="global-unread-badge-mobile">
            {{ chatStore.totalUnreadCount }}
          </span>
        </div>
      </router-link>
    </nav>

    <!-- 💡 新增：全局发帖大模态弹窗 (Global Compose Modal) -->
    <div v-if="showComposeModal" class="modal-backdrop" @click.self="showComposeModal = false">
      <div class="modal-card" style="max-width: 480px; padding: 20px; text-align: left;">
        <button class="modal-close" @click="showComposeModal = false">✕</button>
        <h3 style="margin-top: 0; font-size: 1.2rem; font-weight: 800;">撰写新动态</h3>
        <div class="global-compose-body" style="display: flex; gap: 12px; margin-top: 16px;">
          <div class="profile-avatar" style="width: 40px; height: 40px;">
            <img v-if="isUrl(authStore.avatar)" :src="authStore.avatar" class="avatar-img-el" />
            <span v-else>{{ authStore.avatar }}</span>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column;">
            <textarea v-model="globalPostContent" placeholder="有什么新鲜事？" class="x-textarea" rows="4" style="width: 100%; border: none; resize: none; font-size: 1.1rem; outline: none;"></textarea>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; border-top: 1px solid var(--x-border); padding-top: 12px;">
              <span style="font-size: 0.8rem; color: var(--x-text-gray);">{{ globalPostContent.length }}/280</span>
              <button @click="handleGlobalPublish" class="x-btn-primary" :disabled="!globalPostContent.trim()">发布</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from './store/auth'
import { useChatStore } from './store/chat'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const chatStore = useChatStore()
const router = useRouter()

// 全局发帖控制
const showComposeModal = ref(false)
const globalPostContent = ref('')

const handleLogout = () => {
  chatStore.disconnectWebSocket()
  authStore.logout()
  router.push('/auth')
}

// 全局发帖提交
const handleGlobalPublish = async () => {
  if (!globalPostContent.value.trim()) return
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000'}/moments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ content: globalPostContent.value })
    })
    if (res.ok) {
      globalPostContent.value = ''
      showComposeModal.value = false
      // 发帖成功后，强制路由跳转至主页并触发广播刷新（可用原生 reload 或自定义事件，此处极简处理）
      router.push('/home').then(() => {
        window.location.reload()
      })
    }
  } catch {
    alert('发布失败')
  }
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    chatStore.connectWebSocket()
  }
})

watch(() => authStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    chatStore.connectWebSocket()
  } else {
    chatStore.disconnectWebSocket()
  }
})

const isUrl = (text) => {
  if (!text) return false
  return text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/')
}
</script>



<style>
/* 𝕏 全局重置样式（移动端自适应） */
:root {
  --x-blue: #1d9bf0;
  --x-bg-hover: rgba(15, 20, 25, 0.1);
  --x-border: #eff3f4;
  --x-text-main: #0f1419;
  --x-text-gray: #536471;
}
body {
  background-color: #ffffff;
  color: var(--x-text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow-y: scroll;
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 响应式核心布局 */
.main-container {
  display: flex;
  width: 100%;
  max-width: 1250px;
  margin: 0 auto;
  justify-content: center;
}

/* 移动端顶部状态栏 (>=768px 时隐藏) */
.mobile-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 53px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--x-border);
  padding: 0 16px;
  z-index: 100;
}
.avatar-placeholder {
  width: 32px;
  height: 32px;
  background: #2563eb;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.app-logo {
  font-weight: 900;
  font-size: 1.25rem;
}
.btn-logout-icon {
  background: transparent;
  border: none;
  color: red;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
}

/* 左侧边栏 (PC 端可见) */
.sidebar {
  display: none;
  width: 275px;
  height: 100vh;
  position: fixed;
  left: calc((100% - 1250px) / 2);
  top: 0;
  border-right: 1px solid var(--x-border);
  padding: 12px 20px;
  box-sizing: border-box;
}
.sidebar-logo {
  font-size: 1.75rem;
  font-weight: 900;
  margin-bottom: 24px;
  padding-left: 12px;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  text-decoration: none;
  color: var(--x-text-main);
  font-size: 1.25rem;
  font-weight: 500;
  border-radius: 9999px;
  transition: background 0.2s;
}
.sidebar-link:hover {
  background: var(--x-bg-hover);
}
.sidebar-link.active {
  font-weight: bold;
}
.sidebar-link .svg-icon {
  width: 26px;
  height: 26px;
}

.sidebar-profile {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 9999px;
  cursor: pointer;
}
.sidebar-profile:hover {
  background: var(--x-bg-hover);
}
.profile-avatar {
  width: 40px;
  height: 40px;
  background: #1d9bf0;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.profile-info {
  display: flex;
  flex-direction: column;
}
.profile-name {
  font-weight: bold;
  font-size: 0.95rem;
}
.profile-logout {
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 2px;
}

/* 中间内容流 (核心，保证手机满屏，PC固定 600px) */
.content-area {
  flex: 1;
  max-width: 100%;
  box-sizing: border-box;
  padding-top: 53px; /* 避开移动端顶部固定栏 */
  padding-bottom: 53px; /* 避开移动端底部固定栏 */
}

/* 右侧面板 (PC 端可见) */
.right-panel {
  display: none;
  width: 350px;
  padding: 12px 20px;
  box-sizing: border-box;
}
.trends-box {
  background: #f7f9fa;
  border-radius: 16px;
  padding: 16px;
  margin-top: 12px;
}
.trends-box h3 {
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  font-weight: 800;
}
.trend-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
  cursor: pointer;
}
.trend-category {
  font-size: 0.8rem;
  color: var(--x-text-gray);
}
.trend-tag {
  font-weight: bold;
  font-size: 0.95rem;
}
.trend-meta {
  font-size: 0.8rem;
  color: var(--x-text-gray);
}

/* 移动端底部固底导航栏 (>=768px 时隐藏) */
.mobile-bottom-bar {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 53px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--x-border);
  z-index: 100;
}
.bottom-link {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--x-text-main);
  text-decoration: none;
}
.bottom-link.active {
  color: var(--x-blue);
}
.bottom-link .svg-icon,
.mobile-top-bar .svg-icon {
  width: 26px;
  height: 26px;
  fill: currentColor;
}

/* 响应式媒体查询：从手机过渡到 PC */
@media (min-width: 768px) {
  .mobile-top-bar,
  .mobile-bottom-bar {
    display: none !important;
  }
  .sidebar {
    display: block;
  }
  .content-area {
    margin-left: 275px; /* 给侧边栏留出空间 */
    max-width: 600px;
    border-right: 1px solid var(--x-border);
    padding-top: 12px;
    padding-bottom: 12px;
  }
}
@media (min-width: 1095px) {
  .right-panel {
    display: block;
  }
}

/* 新 Logo 的样式规范 */
.logo-icon-inline {
  display: inline-block;
  width: 28px;
  height: 28px;
  vertical-align: middle;
  margin-right: 8px;
}
.logo-icon-inline .drive-logo-svg {
  width: 100%;
  height: 100%;
}
.app-logo,
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  background: linear-gradient(to right, #1d9bf0, #4f46e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; /* 让文字呈现高档的渐变色 */
}
.sidebar-logo {
  justify-content: flex-start; /* 侧边栏文字靠左对齐 */
  padding-left: 12px;
}
.avatar-img-el {
  width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
}
.sidebar-profile {
  position: absolute; bottom: 20px; left: 20px; right: 20px;
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border-radius: 9999px; cursor: pointer;
}
.sidebar-profile:hover { background: var(--x-bg-hover); }
.profile-avatar {
  width: 40px; height: 40px; background: #ffffff; border: 1px solid var(--x-border);
  border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; overflow: hidden;
}
.profile-info { display: flex; flex-direction: column; text-align: left; }
.profile-name { font-weight: bold; font-size: 0.95rem; }
.profile-logout { font-size: 0.8rem; color: #ef4444; margin-top: 2px; }

/* 💡 全站未读数小红点样式规范 */
.nav-text-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.global-unread-badge {
  background: #ef4444; /* 𝕏 亮红色 */
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
}

/* 移动端底栏专配红点 */
.bottom-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.global-unread-badge-mobile {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  min-width: 16px;
  height: 16px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  box-sizing: border-box;
}

.sidebar-post-btn {
  background: var(--x-blue);
  color: white;
  border: none;
  font-size: 1.15rem;
  font-weight: bold;
  width: 90%;
  height: 48px;
  border-radius: 9999px;
  cursor: pointer;
  margin-top: 16px;
  transition: background 0.2s;
  display: block;
}
.sidebar-post-btn:hover {
  background: #1a8cd8;
}

/* 移动端漂浮发帖按钮 (FAB) */
.mobile-fab-btn {
  position: fixed;
  bottom: 70px;
  right: 16px;
  width: 50px;
  height: 50px;
  background: var(--x-blue);
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 101;
  display: flex;
}
@media (min-width: 768px) {
  .mobile-fab-btn { display: none !important; }
}

/* 导航栏全局通知小红点 */
.sidebar-unread-badge {
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
  margin-left: auto; /* 在PC端强制推至右侧 */
}
</style>