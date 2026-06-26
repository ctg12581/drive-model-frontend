<template>
  <div class="grid">
    <div class="card">
      <h2 style="margin-top: 0;">DRIVE 维度评级</h2>
      <form @submit.prevent="submitEvaluate">
        <div class="form-group" v-for="(label, key) in dimensions" :key="key">
          <label>{{ label }}</label>
          <select v-model="form[key]">
            <option value="S">S 级 (战略/反脆弱/灯塔)</option>
            <option value="A">A 级 (独立/高效/敏捷)</option>
            <option value="B">B 级 (合格/常规/合规)</option>
            <option value="C">C 级 (被动/依赖/僵化)</option>
            <option value="D">D 级 (回避/脆弱/流失)</option>
          </select>
        </div>
        <button type="submit" class="btn w-full">生成加密诊断报告</button>
      </form>
    </div>

    <!-- 结果与雷达图展示 -->
    <div v-show="result" class="card">
      <h2 style="margin-top: 0;">诊断雷达图</h2>
      <div class="chart-box">
        <canvas id="radarChart"></canvas>
      </div>
      <div class="synthesis" v-if="result">
        <p><b>💡 综合成长建议：</b> {{ result.synthesis }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useAuthStore } from '../store/auth'
import Chart from 'chart.js/auto' // 使用工程化自带包自动注册元素

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000'

const authStore = useAuthStore()
const form = reactive({ d: 'B', r: 'B', i: 'B', v: 'B', e: 'B' })
const result = ref(null)
let chartInstance = null

const dimensions = {
  d: 'Decision (决策力)',
  r: 'Resilience (意志力/韧性)',
  i: 'Intelligence (智力)',
  v: 'Values (价值观)',
  e: 'Elasticity (灵活性)'
}

const submitEvaluate = async () => {
  try {
    const res = await fetch(`${API_BASE}/drive/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}` // 携带全局 Pinia 缓存的 Token
      },
      body: JSON.stringify(form)
    })
    const data = await res.json()

    if (res.ok) {
      result.value = data
      // 等待 DOM 节点树更新完毕后渲染 Canvas 图表
      nextTick(() => {
        renderChart(data.scores)
      })
    } else {
      alert(data.detail || '评测提交失败')
    }
  } catch {
    alert('请求出错，请检查后端运行状态。')
  }
}

const renderChart = (scores) => {
  const ctx = document.getElementById('radarChart').getContext('2d')
  if (chartInstance) {
    chartInstance.destroy()
  }
  chartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['决策力 (D)', '韧性 (R)', '智力 (I)', '价值观 (V)', '灵活性 (E)'],
      datasets: [{
        label: '维度评价 (1~5)',
        data: [scores.d, scores.r, scores.i, scores.v, scores.e],
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(37, 99, 235)',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, display: false } } }
    }
  })
}
</script>

<style scoped>
.grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
@media (min-width: 768px) { .grid { grid-template-columns: 1fr 1fr; } }
.form-group { margin-bottom: 16px; }
label { display: block; font-size: 0.875rem; font-weight: bold; margin-bottom: 6px; }
select { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; }
.w-full { width: 100%; }
.chart-box { max-width: 320px; margin: 0 auto; }
.synthesis { margin-top: 20px; border-top: 1px solid #f3f4f6; padding-top: 15px; font-size: 0.95rem; line-height: 1.5; }
</style>