<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <!-- 𝕏 风格的精简 SVG Logo -->
      <!-- 替换为专属大 Logo 块 -->
      <div class="brand-logo-large">
<svg viewBox="0 0 100 100" class="drive-logo-svg">
  <defs>
    <!-- 蓝紫渐变色 -->
    <linearGradient id="drive-grad-simple" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1d9bf0"/>
      <stop offset="1" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
  <!-- 极简 D 字母外框 -->
  <path d="M 25,15 H 50 C 70,15 85,30 85,50 C 85,70 70,85 50,85 H 25 Z" 
        stroke="url(#drive-grad-simple)" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
  <!-- 极简前行三角箭头 -->
  <path d="M 42,34 L 66,50 L 42,66 Z" fill="url(#drive-grad-simple)" />
</svg>
      </div>

      <div v-if="!authStore.isLoggedIn" class="form-container">
        <h2 class="auth-title">
          {{
            authMode === "login"
              ? "登录您的 DRIVE Space 账号"
              : "立即注册加入 DRIVE Space"
          }}
        </h2>

        <form @submit.prevent="handleSubmit">
          <div class="x-input-group">
            <input
              type="text"
              v-model="form.username"
              required
              placeholder="用户名 (@username)"
            />
          </div>
          <div class="x-input-group">
            <input
              type="password"
              v-model="form.password"
              required
              placeholder="输入密码"
            />
          </div>

          <button type="submit" class="x-btn-dark">
            {{ authMode === "login" ? "登录" : "创建账户" }}
          </button>
        </form>

        <p class="toggle-text">
          <span v-if="authMode === 'login'"
            >还没有账号？
            <a @click.prevent="authMode = 'register'">立即创建账户</a></span
          >
          <span v-else
            >已有账号？
            <a @click.prevent="authMode = 'login'">前往登录</a></span
          >
        </p>
      </div>

      <!-- 登录后展现状态 -->
      <div v-else class="success-box">
        <div class="avatar-big">{{ authStore.username[0].toUpperCase() }}</div>
        <h2>您已通过身份安全验证</h2>
        <p class="profile-handle">@{{ authStore.username }}</p>
        <p style="color: var(--x-text-gray); font-size: 0.9rem">
          现在您可以自由进行 DRIVE
          人格分析评测以及在实时大厅与其他在线用户在线通信。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:3000";
const authStore = useAuthStore();
const router = useRouter();
const authMode = ref("login");
const form = reactive({ username: "", password: "" });

const handleSubmit = async () => {
  const endpoint =
    authMode.value === "login" ? "/auth/login" : "/auth/register";
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      if (authMode.value === "register") {
        alert(data.message || "注册成功！");
        authMode.value = "login";
      } else {
        authStore.setLogin(data.access_token, form.username);
        router.push("/drive");
      }
    } else {
      alert(data.detail || "验证失败，请重新确认");
    }
  } catch {
    alert("网络出现严重故障，请检查后端状态");
  }
};
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  box-sizing: border-box;
}
.auth-card {
  width: 100%;
  max-width: 360px;
  text-align: center;
}

/* 𝕏 经典黑白极简 Logo */
.x-logo-icon {
  margin-bottom: 24px;
}
.svg-logo {
  width: 50px;
  height: 50px;
  fill: var(--x-text-main);
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
}

/* 输入框扁平化 */
.x-input-group {
  margin-bottom: 16px;
}
.x-input-group input {
  width: 100%;
  height: 50px;
  padding: 0 16px;
  border: 1px solid var(--x-border);
  border-radius: 8px;
  background: transparent;
  color: var(--x-text-main);
  box-sizing: border-box;
  font-size: 1rem;
  outline: none;
}
.x-input-group input:focus {
  border-color: var(--x-blue);
}

/* X 黑色丸子主按钮 */
.x-btn-dark {
  width: 100%;
  height: 44px;
  background: #0f1419;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 10px;
}
.x-btn-dark:hover {
  background: #272c30;
}

.toggle-text {
  font-size: 0.9rem;
  color: var(--x-text-gray);
  margin-top: 20px;
}
.toggle-text a {
  color: var(--x-blue);
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
}

/* 成功登录的面板 */
.success-box {
  padding: 24px 0;
}
.avatar-big {
  width: 80px;
  height: 80px;
  background: var(--x-blue);
  color: white;
  border-radius: 50%;
  font-size: 2.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
}
.profile-handle {
  font-weight: bold;
  color: var(--x-text-gray);
  font-size: 1.1rem;
  margin-top: -10px;
}

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
  /* 文字高档渐变 */
  background: linear-gradient(135deg, #1d9bf0, #4f46e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
