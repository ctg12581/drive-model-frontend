<template>
  <div class="app-layout">
    <!-- 移动端顶部固定栏 -->
    <header class="mobile-top-bar">
      <div class="avatar-placeholder">
        {{ authStore.isLoggedIn ? authStore.username[0].toUpperCase() : '?' }}
      </div>
      <div class="app-logo">𝕏 DRIVE</div>
      <div class="top-action-btn">
        <button v-if="authStore.isLoggedIn" @click="handleLogout" class="btn-logout-icon">
          登出
        </button>
      </div>
    </header>

    <!-- 核心响应式布局：左边栏 + 中间流 + 右边栏 -->
    <div class="main-container">
      <!-- 左侧边栏导航 (PC端可见，移动端隐藏) -->
      <aside class="sidebar">
        <div class="sidebar-logo">𝕏 DRIVE</div>
        <nav class="sidebar-nav">
          <router-link to="/drive" class="sidebar-link" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H7v-7h3v7zm4 0h-3V7h3v10zm4 0h-3v-4h3v4z"/></svg>
            </span>
            <span class="text">DRIVE 评测</span>
          </router-link>
          <router-link to="/chat" class="sidebar-link" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
            </span>
            <span class="text">实时聊吧</span>
          </router-link>
          <router-link to="/auth" class="sidebar-link" active-class="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" class="svg-icon"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </span>
            <span class="text">账号设置</span>
          </router-link>
        </nav>
        <!-- 左下方个人账户面板 -->
        <div v-if="authStore.isLoggedIn" class="sidebar-profile">
          <div class="profile-avatar">{{ authStore.username[0].toUpperCase() }}</div>
          <div class="profile-info">
            <div class="profile-name">@{{ authStore.username }}</div>
            <div class="profile-logout" @click="handleLogout">安全登出</div>
          </div>
        </div>
      </aside>

      <!-- 中间主内容区 (无限流设计) -->
      <main class="content-area">
        <router-view />
      </main>

      <!-- 右侧推荐/热门区 (PC端可见，移动端隐藏) -->
      <aside class="right-panel">
        <div class="trends-box">
          <h3>𝕏 推荐话题</h3>
          <div class="trend-item">
            <span class="trend-category">科技 · 热门评测</span>
            <span class="trend-tag">#DRIVE模型架构</span>
            <span class="trend-meta">52.8k 评测</span>
          </div>
          <div class="trend-item">
            <span class="trend-category">社交 · 实时讨论</span>
            <span class="trend-tag">#FastAPI双向WebSocket</span>
            <span class="trend-meta">18.2k 正在热聊</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- 移动端底部固底导航栏 -->
    <nav class="mobile-bottom-bar">
      <router-link to="/drive" class="bottom-link" active-class="active">
        <svg viewBox="0 0 24 24" class="svg-icon"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H7v-7h3v7zm4 0h-3V7h3v10zm4 0h-3v-4h3v4z"/></svg>
      </router-link>
      <router-link to="/chat" class="bottom-link" active-class="active">
        <svg viewBox="0 0 24 24" class="svg-icon"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
      </router-link>
      <router-link to="/auth" class="bottom-link" active-class="active">
        <svg viewBox="0 0 24 24" class="svg-icon"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useAuthStore } from './store/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/auth')
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
  top: 0; left: 0; right: 0;
  height: 53px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--x-border);
  padding: 0 16px;
  z-index: 100;
}
.avatar-placeholder {
  width: 32px; height: 32px;
  background: #2563eb; color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold;
}
.app-logo { font-weight: 900; font-size: 1.25rem; }
.btn-logout-icon {
  background: transparent; border: none; color: red; font-size: 0.85rem; font-weight: bold; cursor: pointer;
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
  font-size: 1.75rem; font-weight: 900; margin-bottom: 24px; padding-left: 12px;
}
.sidebar-nav { display: flex; flex-direction: column; gap: 8px; }
.sidebar-link {
  display: flex; align-items: center; gap: 16px;
  padding: 12px; text-decoration: none; color: var(--x-text-main);
  font-size: 1.25rem; font-weight: 500; border-radius: 9999px;
  transition: background 0.2s;
}
.sidebar-link:hover { background: var(--x-bg-hover); }
.sidebar-link.active { font-weight: bold; }
.sidebar-link .svg-icon { width: 26px; height: 26px; }

.sidebar-profile {
  position: absolute; bottom: 20px; left: 20px; right: 20px;
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border-radius: 9999px; cursor: pointer;
}
.sidebar-profile:hover { background: var(--x-bg-hover); }
.profile-avatar {
  width: 40px; height: 40px; background: #1d9bf0; color: white;
  border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;
}
.profile-info { display: flex; flex-direction: column; }
.profile-name { font-weight: bold; font-size: 0.95rem; }
.profile-logout { font-size: 0.8rem; color: #ef4444; margin-top: 2px; }

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
  background: #f7f9fa; border-radius: 16px; padding: 16px; margin-top: 12px;
}
.trends-box h3 { margin: 0 0 16px 0; font-size: 1.25rem; font-weight: 800; }
.trend-item { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; cursor: pointer; }
.trend-category { font-size: 0.8rem; color: var(--x-text-gray); }
.trend-tag { font-weight: bold; font-size: 0.95rem; }
.trend-meta { font-size: 0.8rem; color: var(--x-text-gray); }

/* 移动端底部固底导航栏 (>=768px 时隐藏) */
.mobile-bottom-bar {
  display: flex;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 53px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--x-border);
  z-index: 100;
}
.bottom-link {
  flex: 1; display: flex; align-items: center; justify-content: center;
  color: var(--x-text-main); text-decoration: none;
}
.bottom-link.active { color: var(--x-blue); }
.bottom-link .svg-icon, .mobile-top-bar .svg-icon { width: 26px; height: 26px; fill: currentColor; }

/* 响应式媒体查询：从手机过渡到 PC */
@media (min-width: 768px) {
  .mobile-top-bar, .mobile-bottom-bar { display: none !important; }
  .sidebar { display: block; }
  .content-area {
    margin-left: 275px; /* 给侧边栏留出空间 */
    max-width: 600px;
    border-right: 1px solid var(--x-border);
    padding-top: 12px;
    padding-bottom: 12px;
  }
}
@media (min-width: 1095px) {
  .right-panel { display: block; }
}
</style>