<!-- src/App.vue (除 <style> 之外的完整最新代码) -->
<template>
  <div class="app-layout">
    <!-- 1. 移动端顶部固定栏 (💡 头像现在是可点击链接，直通个人主页！) -->
    <header class="mobile-top-bar">
      <router-link to="/auth" class="avatar-placeholder-link">
        <div class="avatar-placeholder">
          <img v-if="isUrl(authStore.avatar)" :src="authStore.avatar" class="avatar-img-el" />
          <span v-else>{{ authStore.avatar }}</span>
        </div>
      </router-link>
      <div class="app-logo">𝕏 DRIVE Space</div>
      <div class="top-action-placeholder" style="width: 32px;"></div>
    </header>

    <!-- 2. 核心响应式布局容器 -->
    <div class="main-container">
      <!-- 左侧边栏导航 (PC 端显示，移动端自动隐藏) -->
      <aside class="sidebar">
        <div class="sidebar-logo">𝕏</div>
        <nav class="sidebar-nav">
          <!-- 动态广场 -->
          <router-link to="/moments" class="sidebar-link" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M22 10.51l-4.57-1.12L16.31 4.8c-.28-.68-.81-.68-1.09 0l-1.12 4.59L9.53 10.51c-.68.28-.68.81 0 1.09l4.57 1.12 1.12 4.59c.28.68.81.68 1.09 0l1.12-4.59 4.57-1.12c.68-.28.68-.81 0-1.09zM8.36 17.51l-1.91-.47-.47-1.91c-.12-.48-.48-.48-.6 0l-.47 1.91-1.91.47c-.48.12-.48.48 0 .6l1.91.47.47 1.91c.12.48.48.48.6 0l.47-1.91 1.91-.47c.48-.12.48-.48 0-.6zm3-11.51l-.95-.23-.23-.95c-.06-.24-.24-.24-.3 0l-.23.95-.95.23c-.24.06-.24.24 0 .3l.95.23.23.95c.06.24.24.24.3 0l.23-.95.95-.23c.24-.06.24-.24 0-.3z"/></svg>
            </span>
            <span class="text">动态广场</span>
          </router-link>

          <!-- 实时聊吧 -->
          <router-link to="/chat" class="sidebar-link" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
            </span>
            <span class="nav-text-container">
              <span class="text">实时聊吧</span>
              <span v-if="chatStore.totalUnreadCount > 0" class="global-unread-badge">
                {{ chatStore.totalUnreadCount }}
              </span>
            </span>
          </router-link>

          <!-- 个人资料 -->
          <router-link to="/auth" class="sidebar-link" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </span>
            <span class="text">个人资料</span>
          </router-link>

          <!-- PC 大发帖按钮 -->
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

      <!-- 中间主内容区 (路由挂载点) -->
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

    <!-- 移动端右下角悬浮发帖按钮 -->
    <button v-if="authStore.isLoggedIn && route.path === '/home'" @click="showComposeModal = true" class="mobile-fab-btn">
      <svg viewBox="0 0 24 24" class="svg-inline" style="width: 24px; height: 24px; fill: white;"><path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79.137 23 0 23 0zm-7 11.054c-2.45 0-4.44-1.59-4.44-4.041 0-2.451 1.99-4.441 4.44-4.441 2.451 0 4.441 1.99 4.441 4.441 0 2.451-1.99 4.041-4.441 4.041zM2.5 15h3V13h-3v-3h-2v3h-3v2h3v3h2v-3z"/></svg>
    </button>

    <!-- 移动端底部导航栏 -->
    <nav class="mobile-bottom-bar">
      <router-link to="/moments" class="bottom-link" active-class="active">
        <svg viewBox="0 0 24 24" class="svg-icon"><path d="M22 10.51l-4.57-1.12L16.31 4.8c-.28-.68-.81-.68-1.09 0l-1.12 4.59L9.53 10.51c-.68.28-.68.81 0 1.09l4.57 1.12 1.12 4.59c.28.68.81.68 1.09 0l1.12-4.59 4.57-1.12c.68-.28.68-.81 0-1.09zM8.36 17.51l-1.91-.47-.47-1.91c-.12-.48-.48-.48-.6 0l-.47 1.91-1.91.47c-.48.12-.48.48 0 .6l1.91.47.47 1.91c.12.48.48.48.6 0l.47-1.91 1.91-.47c.48-.12.48-.48 0-.6zm3-11.51l-.95-.23-.23-.95c-.06-.24-.24-.24-.3 0l-.23.95-.95.23c-.24.06-.24.24 0 .3l.95.23.23.95c.06.24.24.24.3 0l.23-.95.95-.23c.24-.06.24-.24 0-.3z"/></svg>
      </router-link>
      <router-link to="/chat" class="bottom-link" active-class="active">
        <div class="bottom-icon-container">
          <svg viewBox="0 0 24 24" class="svg-icon"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
          <span v-if="chatStore.totalUnreadCount > 0" class="global-unread-badge-mobile">
            {{ chatStore.totalUnreadCount }}
          </span>
        </div>
      </router-link>
      <router-link to="/auth" class="bottom-link" active-class="active">
        <svg viewBox="0 0 24 24" class="svg-icon"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
      </router-link>
    </nav>

    <!-- 全局发帖大模态弹窗 -->
    <div v-if="showComposeModal" class="modal-backdrop" @click.self="closeComposeModal">
      <div class="modal-card compose-modal-card">
        <div class="compose-modal-header">
          <button class="modal-close-btn" @click="closeComposeModal">
            <svg viewBox="0 0 24 24" class="svg-inline"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/></svg>
          </button>
        </div>
        <div class="global-compose-body">
          <div class="profile-avatar compose-avatar">
            <img v-if="isUrl(authStore.avatar)" :src="authStore.avatar" class="avatar-img-el" />
            <span v-else>{{ authStore.avatar }}</span>
          </div>
          <div class="compose-content-area">
            <textarea v-model="globalPostContent" placeholder="有什么新鲜事吗？" class="global-textarea" rows="4" maxlength="280"></textarea>
            <div class="compose-divider"></div>
            <div class="compose-footer-row">
              <span class="char-counter" :class="{ 'warning-count': globalPostContent.length >= 260 }">
                {{ globalPostContent.length }}/280
              </span>
              <button @click="handleGlobalPublish" class="pill-btn" :disabled="!globalPostContent.trim()">发布</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAuthStore } from './store/auth'
import { useChatStore } from './store/chat'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const chatStore = useChatStore()
const router = useRouter()
const route = useRoute()

const showComposeModal = ref(false)
const globalPostContent = ref('')

const handleLogout = () => {
  chatStore.disconnectWebSocket()
  authStore.logout()
  router.push('/auth')
}

const closeComposeModal = () => {
  showComposeModal.value = false
  globalPostContent.value = ''
}

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

/* 🌟 全新重塑：𝕏 经典发帖弹窗的高级极简样式 */
.modal-backdrop {
  position: fixed; top: 0; bottom: 0; left: 0; right: 0;
  background: rgba(0, 0, 0, 0.4); display: flex; align-items: flex-start; justify-content: center;
  z-index: 1000;
  padding-top: 50px;
}
@media (min-width: 768px) {
  .modal-backdrop { padding-top: 100px; }
}

.compose-modal-card {
  width: 100%; max-width: 520px; background: white; border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.15); border: 1px solid var(--x-border);
  overflow: hidden; display: flex; flex-direction: column;
}

.compose-modal-header {
  display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--x-border);
}
.modal-close-btn {
  background: transparent; border: none; cursor: pointer; color: var(--x-text-main); display: flex; align-items: center; padding: 4px; border-radius: 50%; transition: background 0.2s;
}
.modal-close-btn:hover { background: var(--x-bg-hover); }
.modal-close-btn .svg-inline { width: 20px; height: 20px; fill: currentColor; }

.global-compose-body { display: flex; gap: 14px; padding: 16px; }
.compose-avatar { width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--x-border); overflow: hidden; display: flex; align-items: center; justify-content: center; background: white; font-weight: bold; }
.compose-content-area { flex: 1; display: flex; flex-direction: column; }

.global-textarea { width: 100%; border: none; resize: none; font-size: 1.1rem; line-height: 1.5; color: var(--x-text-main); outline: none; background: transparent; padding: 4px 0; font-family: inherit; }
.global-textarea::placeholder { color: var(--x-text-gray); }
.compose-divider { height: 1px; background: var(--x-border); margin: 12px 0; }

.compose-footer-row { display: flex; justify-content: space-between; align-items: center; }
.char-counter { font-size: 0.8rem; color: var(--x-text-gray); font-weight: 500; }
.char-counter.warning-count { color: #ef4444; }

.pill-btn { background: var(--x-blue); color: white; border: none; padding: 0 20px; height: 36px; border-radius: 9999px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.pill-btn:hover { background: #1a8cd8; }
.pill-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.avatar-placeholder-link { text-decoration: none; color: inherit; display: flex; align-items: center; }
</style>