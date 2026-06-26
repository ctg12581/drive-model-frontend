<template>
  <div class="card auth-box">
    <div v-if="!authStore.isLoggedIn">
      <h2 class="text-center">{{ authMode === 'login' ? '用户登录' : '用户注册' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>用户名</label>
          <input type="text" v-model="form.username" required placeholder="3-20位英文字母或数字">
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" v-model="form.password" required placeholder="不低于6位">
        </div>
        <button type="submit" class="btn w-full">{{ authMode === 'login' ? '登录' : '注册' }}</button>
      </form>
      <p class="text-center toggle-link">
        <span v-if="authMode === 'login'">还没有账号？ <a @click.prevent="authMode = 'register'">立即注册</a></span>
        <span v-else>已有账号？ <a @click.prevent="authMode = 'login'">前往登录</a></span>
      </p>
    </div>
    <div v-else class="text-center">
      <div class="success-icon">🎉</div>
      <h3>您已成功登录</h3>
      <p>用户名: <b>{{ authStore.username }}</b></p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

// 环境变量配置读取，便于开发与生产切换
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000'

const authStore = useAuthStore()
const router = useRouter()
const authMode = ref('login')
const form = reactive({ username: '', password: '' })

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
        // 通过 Pinia 保存登录凭证
        authStore.setLogin(data.access_token, form.username)
        router.push('/drive') // 登录成功直接切去评测页
      }
    } else {
      alert(data.detail || '验证失败')
    }
  } catch {
    alert('网络出现异常')
  }
}
</script>

<style scoped>
.auth-box { max-width: 400px; margin: 40px auto; }
.text-center { text-align: center; margin-top: 0; }
.form-group { margin-bottom: 16px; }
label { display: block; font-size: 0.875rem; font-weight: bold; margin-bottom: 6px; }
input { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; }
.w-full { width: 100%; }
.toggle-link { font-size: 0.9rem; margin-top: 15px; color: #6b7280; }
.toggle-link a { color: #2563eb; cursor: pointer; font-weight: bold; }
.success-icon { font-size: 3rem; margin-bottom: 10px; }
</style>