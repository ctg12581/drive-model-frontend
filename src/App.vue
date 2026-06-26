<template>
  <div class="container">
    <header class="header">
      <h1>DRIVE 互动空间</h1>
      <p class="subtitle">
        <span v-if="authStore.isLoggedIn">
          欢迎您，<strong>{{ authStore.username }}</strong>
          <button @click="handleLogout" class="btn btn-danger btn-sm">注销</button>
        </span>
        <span v-else>请在登录页面完成账号验证</span>
      </p>
    </header>

    <!-- 导航选项卡：现在由 vue-router 接管 -->
    <nav class="tabs">
      <router-link to="/auth" class="tab-btn" active-class="active">🔐 身份验证</router-link>
      <router-link to="/drive" class="tab-btn" active-class="active">📊 DRIVE 评测</router-link>
      <router-link to="/chat" class="tab-btn" active-class="active">💬 实时聊吧</router-link>
    </nav>

    <!-- 渲染子页面的容器 -->
    <main>
      <router-view />
    </main>
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
/* 全局样式（去除了 Tailwind 的不稳定性） */
body {
  background-color: #f3f4f6;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #1f2937;
  margin: 0;
}
.container { max-width: 900px; margin: 0 auto; padding: 30px 15px; }
.header { text-align: center; margin-bottom: 25px; }
h1 { color: #2563eb; font-size: 2.2rem; margin: 0 0 6px 0; }
.subtitle { color: #6b7280; font-size: 0.95rem; margin: 0; }
.tabs { display: flex; background: #e5e7eb; padding: 4px; border-radius: 12px; margin-bottom: 24px; }
.tab-btn {
  flex: 1; padding: 10px; text-decoration: none; text-align: center;
  font-weight: 600; cursor: pointer; border-radius: 8px; color: #6b7280; transition: all 0.2s;
}
.tab-btn.active { background: #ffffff; color: #2563eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.btn { background: #2563eb; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn:hover { background: #1d4ed8; }
.btn-danger { background: #ef4444; }
.btn-danger:hover { background: #dc2626; }
.btn-sm { padding: 4px 10px; font-size: 0.8rem; margin-left: 10px; }
.card { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
</style>