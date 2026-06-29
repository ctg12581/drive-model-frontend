<!-- src/views/AuthView.vue -->
<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <!-- 极简渐变 D 字母 Logo -->
      <div class="brand-logo-large">
        <svg viewBox="0 0 100 100" class="drive-logo-svg">
          <defs>
            <linearGradient id="drive-grad-simple" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stop-color="#1d9bf0"/>
              <stop offset="1" stop-color="#4f46e5"/>
            </linearGradient>
          </defs>
          <path d="M 25,15 H 50 C 70,15 85,30 85,50 C 85,70 70,85 50,85 H 25 Z" 
                stroke="url(#drive-grad-simple)" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
          <path d="M 42,34 L 66,50 L 42,66 Z" fill="url(#drive-grad-simple)" />
        </svg>
      </div>

      <!-- 未登录状态：登录与注册表单 -->
      <div v-if="!authStore.isLoggedIn" class="form-container">
        <h2 class="auth-title">{{ authMode === 'login' ? '登录您的 DRIVE Space' : '立即注册 DRIVE Space' }}</h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="x-input-group">
            <input type="text" v-model="form.username" required placeholder="用户名 (@username)">
          </div>
          <div class="x-input-group">
            <input type="password" v-model="form.password" required placeholder="输入密码">
          </div>
          
          <button type="submit" class="x-btn-dark">
            {{ authMode === 'login' ? '登录' : '创建账户' }}
          </button>
        </form>

        <p class="toggle-text">
          <span v-if="authMode === 'login'">还没有账号？ <a @click.prevent="authMode = 'register'">立即创建账户</a></span>
          <span v-else>已有账号？ <a @click.prevent="authMode = 'login'">前往登录</a></span>
        </p>
      </div>

      <!-- 已登录状态：编辑个人资料 -->
  <div v-else class="success-box">
        <div class="avatar-big">{{ profileForm.avatar_url || '👤' }}</div>
        <h2>@{{ authStore.username }}</h2>
        
        <div class="profile-edit-card">
          <h3>编辑 𝕏 社交名片</h3>
          <form @submit.prevent="updateProfile">
            <div class="x-input-group">
              <label class="edit-label">我的昵称</label>
              <input type="text" v-model="profileForm.nickname" placeholder="设置个性昵称" required>
            </div>
            <div class="x-input-group">
              <label class="edit-label">我的头像 (可直接贴入图片地址)</label>
              <input type="text" v-model="profileForm.avatar_url" placeholder="自定义头像(Emoji或图片链接)" required>
            </div>
            <!-- 快捷推荐 Emoji -->
            <div class="emoji-picker">
              <span v-for="emoji in ['🚀','🐱','🦊','🎮','🦄','🐧','🌸','🐼']" :key="emoji" 
                    @click="profileForm.avatar_url = emoji" class="emoji-item">
                {{ emoji }}
              </span>
            </div>
            <button type="submit" class="x-btn-dark" style="background: var(--x-blue); color: white;">更新个人名片</button>
          </form>

          <!-- 💡 新增：宽幅危险按钮风格的退出当前账号控制 -->
          <div style="margin-top: 30px; border-top: 1px solid var(--x-border); padding-top: 20px;">
            <button @click="handleLogout" class="x-btn-danger">退出当前账号</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000'
const authStore = useAuthStore()
const router = useRouter()
const authMode = ref('login')

// 登录注册表单
const form = reactive({ username: '', password: '' })

// 💡 核心修改：不再使用空值初始化，而是【直接读取 Pinia 和本地物理缓存】
// 这确保了用户每次切回个人设置主页时，名片信息都是 0 毫秒瞬间秒开展示，绝无白屏闪烁！
const profileForm = reactive({
  nickname: authStore.nickname || authStore.username, // 缓存优先，无昵称则默认显示账号
  avatar_url: authStore.avatar || '👤'                // 缓存优先
})

// 页面加载时：默默在后台向服务器请求最新数据进行校验（静默更新）
onMounted(() => {
  if (authStore.isLoggedIn) {
    fetchProfile()
  }
})

// 获取个人信息（静默更新全局与本地表单）
const fetchProfile = async () => {
  try {
    const res = await fetch(`${API_BASE}/auth/profile/${authStore.username}`)
    const data = await res.json()
    if (res.ok) {
      profileForm.nickname = data.nickname || authStore.username
      profileForm.avatar_url = data.avatar || '👤'
      
      authStore.updateProfileState(profileForm.nickname, profileForm.avatar_url)
    }
  } catch (err) {
    console.error('获取个人资料失败', err)
  }
}

// 处理登录/注册
const handleSubmit = async () => {
  const endpoint = authMode.value === 'login' ? '/auth/login' : '/auth/register'
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (res.ok) {
      if (authMode.value === 'register') {
        alert(data.message || '注册成功！')
        authMode.value = 'login'
      } else {
        // 💡 登录时：先用基础的用户名初始化名片缓存，防止侧边栏出现空状态
        authStore.setLogin(data.access_token, form.username, form.username, '👤')
        
        // 登录成功后，立刻在后台拉取真实名片资料，拉取完后全站自动静默重绘
        await fetchProfile() 
        router.push('/drive')
      }
    } else {
      alert(data.detail || '验证失败，请重新确认')
    }
  } catch {
    alert('网络出现严重故障，请检查后端状态')
  }
}

// 提交个人名片更新
import { apiFetch } from '../utils/api'

const updateProfile = async () => {
  try {
    // 💡 无需手写 Headers，无需手写 Token，无需担心过期跳转
    const res = await apiFetch('/auth/profile', {
      method: 'POST',
      body: JSON.stringify({
        nickname: profileForm.nickname.trim(),
        avatar_url: profileForm.avatar_url.trim()
      })
    })
    const data = await res.json()
    if (res.ok) {
      alert(data.message)
    }
  } catch (err) {
    // 401 自动在拦截器里被处理并跳转，这里只需捕获日志即可
    console.error(err)
  }
}

const handleLogout = () => {
  // 💡 安全登出：切断 WebSocket 常驻连接 + 抹除 Pinia 状态与本地 LocalStorage 缓存
  chatStore.disconnectWebSocket()
  authStore.logout()
  router.push('/auth')
}
</script>


<style scoped>
.auth-wrapper {
  display: flex; align-items: center; justify-content: center;
  padding: 40px 16px; box-sizing: border-box;
}
.auth-card { width: 100%; max-width: 360px; text-align: center; }

/* 渐变 D 字母 Logo */
.brand-logo-large {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px auto;
}
.brand-logo-large .drive-logo-svg {
  width: 100%;
  height: 100%;
}
.auth-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #1d9bf0, #4f46e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.x-input-group { margin-bottom: 16px; text-align: left;}
.x-input-group input {
  width: 100%; height: 46px; padding: 0 16px;
  border: 1px solid var(--x-border); border-radius: 8px;
  background: transparent; color: var(--x-text-main);
  box-sizing: border-box; font-size: 0.95rem; outline: none;
}
.x-input-group input:focus { border-color: var(--x-blue); }

.edit-label {
  display: block;
  font-size: 0.8rem;
  color: var(--x-text-gray);
  font-weight: bold;
  margin-bottom: 6px;
  padding-left: 2px;
}

/* 黑色丸子按钮 */
.x-btn-dark {
  width: 100%; height: 44px; background: #0f1419; color: #ffffff;
  border: none; border-radius: 9999px; font-weight: bold; font-size: 1rem;
  cursor: pointer; transition: background 0.2s; margin-top: 10px;
}
.x-btn-dark:hover { background: #272c30; }

.toggle-text { font-size: 0.9rem; color: var(--x-text-gray); margin-top: 20px; }
.toggle-text a { color: var(--x-blue); text-decoration: none; font-weight: bold; cursor: pointer; }

/* 成功登录的面板 */
.success-box { padding: 12px 0; text-align: center; }
.avatar-big {
  width: 80px; height: 80px; background: #eff3f4; border-radius: 50%; font-size: 2.5rem;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px auto;
}

/* 资料编辑区域 */
.profile-edit-card {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--x-border);
}
.profile-edit-card h3 {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0 0 16px 0;
  text-align: center;
}
.emoji-picker {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}
.emoji-item {
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.1s;
}
.emoji-item:hover {
  transform: scale(1.2);
}

.x-btn-danger {
  width: 100%;
  height: 44px;
  background: transparent;
  color: #ef4444;
  border: 1px solid #fca5a5;
  border-radius: 9999px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}
.x-btn-danger:hover {
  background: #fee2e2;
  border-color: #ef4444;
}
</style>