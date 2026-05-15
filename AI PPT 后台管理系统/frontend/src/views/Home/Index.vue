<template>
  <div class="modern-dashboard">
    <!-- 欢迎栏 -->
    <div class="welcome-banner mb-20px">
      <el-row :gutter="24" justify="space-between" align="middle">
        <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
          <div class="flex items-center">
            <el-avatar :src="avatar" :size="64" class="avatar-shadow mr-20px">
              <img src="@/assets/imgs/avatar.gif" alt="" />
            </el-avatar>
            <div>
              <div class="text-24px font-bold text-slate-900 tracking-tight">{{ greeting }}，{{ username }}</div>
              <div class="mt-8px text-14px text-slate-500 font-medium">欢迎回到 AI PPT 后台管理系统。今天也是充满活力的一天！</div>
            </div>
          </div>
        </el-col>
        <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
          <div class="h-64px flex items-center justify-end lt-sm:mt-16px">
            <div class="time-widget">
              <div class="time-label text-slate-500">今日时间</div>
              <div class="time-value text-18px text-slate-800 font-bold tracking-tight">{{ currentDate }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 6个核心数据卡片 -->
    <el-row :gutter="24" class="mb-20px">
      <el-col :xl="4" :lg="8" :md="8" :sm="12" :xs="12" v-for="(card, index) in summaryCards" :key="index" class="mb-20px">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon-wrap" :style="{ background: card.color + '15', color: card.color }">
              <Icon :icon="card.icon" :size="24" />
            </div>
            <div class="stat-trend" :class="card.trend >= 0 ? 'trend-up' : 'trend-down'">
              <span class="trend-icon">{{ card.trend >= 0 ? '↑' : '↓' }}</span>
              <span>{{ Math.abs(card.trend) }}%</span>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-num">
              <CountTo :start-val="0" :end-val="card.value" :duration="2000" />
            </div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="24" class="mb-20px">
      <!-- 收款趋势 -->
      <el-col :xl="16" :lg="16" :md="24" :sm="24" :xs="24" class="mb-20px lg:mb-0">
        <div class="chart-card h-full">
          <div class="chart-header">
            <span class="chart-title">收款流水趋势</span>
            <el-radio-group v-model="trendDays" size="small" class="modern-radio" @change="loadTrendChart">
              <el-radio-button :value="7">近7天</el-radio-button>
              <el-radio-button :value="30">近30天</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="revenueChartRef" style="height: 340px; width: 100%;"></div>
        </div>
      </el-col>

      <!-- PPT 生成统计 -->
      <el-col :xl="8" :lg="8" :md="24" :sm="24" :xs="24">
        <div class="chart-card h-full">
          <div class="chart-header">
            <span class="chart-title">PPT 风格分布</span>
          </div>
          <div ref="styleChartRef" style="height: 340px; width: 100%;"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 底部区域：最近订单 + 快捷入口 -->
    <el-row :gutter="24" class="bottom-row">
      <!-- 最近收款记录 -->
      <el-col :xl="16" :lg="16" :md="24" :sm="24" :xs="24" class="mb-20px xl:mb-0">
        <div class="table-card h-full">
          <div class="card-header-flex">
            <span class="card-title">最近收款记录</span>
            <el-button type="primary" link class="view-more-btn" @click="$router.push('/ppt/redeem')">
              查看全部 <Icon icon="ep:arrow-right" class="ml-4px"/>
            </el-button>
          </div>
          <el-table :data="recentOrders" style="width: 100%" class="modern-table">
            <el-table-column label="时间" prop="time" min-width="140" class-name="text-slate-500" />
            <el-table-column label="用户" prop="user" min-width="80" />
            <el-table-column label="类型" prop="type" min-width="100">
              <template #default="{ row }">
                <span class="modern-tag" :class="'tag-' + row.typeColor">{{ row.type }}</span>
              </template>
            </el-table-column>
            <el-table-column label="金额/积分" prop="amount" min-width="100">
              <template #default="{ row }">
                <span class="font-bold font-mono" :style="{ color: row.amountColor }">{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="status" min-width="80">
              <template #default="{ row }">
                <span class="status-dot" :class="'status-' + row.statusType"></span>
                <span class="text-13px text-slate-700 ml-6px">{{ row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" min-width="100" class-name="text-slate-500" />
          </el-table>
        </div>
      </el-col>

      <!-- 快捷入口 & 系统状态 -->
      <el-col :xl="8" :lg="8" :md="24" :sm="24" :xs="24">
        <div class="flex flex-col h-full gap-20px">
          <div class="grid-card">
            <div class="card-header-flex mb-16px">
              <span class="card-title">快捷操作</span>
            </div>
            <div class="shortcuts-grid">
              <div v-for="item in shortcuts" :key="item.name" class="shortcut-item" @click="$router.push(item.url)">
                <div class="shortcut-icon" :style="{ background: item.color + '15', color: item.color }">
                  <Icon :icon="item.icon" :size="24" />
                </div>
                <span class="shortcut-name">{{ item.name }}</span>
              </div>
            </div>
          </div>

          <div class="grid-card flex-1">
            <div class="card-header-flex mb-16px">
              <span class="card-title">系统状态</span>
            </div>
            <div class="system-status-list">
              <div class="status-item">
                <div class="flex items-center">
                  <div class="status-icon bg-blue-50 text-blue-500"><Icon icon="ep:monitor" :size="18"/></div>
                  <span class="ml-12px font-medium text-slate-700">后端服务</span>
                </div>
                <div class="pulse-status healthy"><span>运行中</span></div>
              </div>
              <div class="status-item">
                <div class="flex items-center">
                  <div class="status-icon bg-purple-50 text-purple-500"><Icon icon="ep:chat-dot-round" :size="18"/></div>
                  <span class="ml-12px font-medium text-slate-700">AI 文本接口</span>
                </div>
                <div class="pulse-status" :class="aiStatus.text ? 'healthy' : 'error'">
                  <span>{{ aiStatus.text ? '正常' : '离线' }}</span>
                </div>
              </div>
              <div class="status-item">
                <div class="flex items-center">
                  <div class="status-icon bg-orange-50 text-orange-500"><Icon icon="ep:picture" :size="18"/></div>
                  <span class="ml-12px font-medium text-slate-700">AI 图片接口</span>
                </div>
                <div class="pulse-status" :class="aiStatus.image ? 'healthy' : 'error'">
                  <span>{{ aiStatus.image ? '正常' : '离线' }}</span>
                </div>
              </div>
              <div class="status-item">
                <div class="flex items-center">
                  <div class="status-icon bg-green-50 text-green-500"><Icon icon="ep:coin" :size="18"/></div>
                  <span class="ml-12px font-medium text-slate-700">数据库</span>
                </div>
                <div class="pulse-status healthy"><span>正常</span></div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'Index' })

const userStore = useUserStore()
const avatar = userStore.getUser.avatar
const username = userStore.getUser.nickname

// 问候语
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const currentDate = computed(() => {
  const d = new Date()
  const weekDay = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 周${weekDay[d.getDay()]}`
})

// 核心数据卡片 (Modern colors)
const summaryCards = ref([
  { label: '今日收款(元)', value: 2680, icon: 'ep:money', color: '#3b82f6', trend: 12.5 },
  { label: '今日活跃用户', value: 47, icon: 'ep:user', color: '#10b981', trend: 8.3 },
  { label: '今日生成PPT', value: 156, icon: 'ep:document', color: '#8b5cf6', trend: -3.2 },
  { label: '今日兑换码使用', value: 23, icon: 'ep:ticket', color: '#f59e0b', trend: 15.0 },
  { label: '积分消耗总量', value: 4680, icon: 'ep:coin', color: '#ec4899', trend: 6.7 },
  { label: '总注册用户', value: 1253, icon: 'ep:avatar', color: '#06b6d4', trend: 2.1 }
])

// 收款趋势图
const trendDays = ref(7)
const revenueChartRef = ref()
const styleChartRef = ref()
let revenueChart: echarts.ECharts | null = null
let styleChart: echarts.ECharts | null = null

const loadTrendChart = () => {
  const days = trendDays.value
  const dates: string[] = []
  const revenue: number[] = []
  const pptCount: number[] = []
  const users: number[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
    revenue.push(Math.floor(Math.random() * 3000) + 500)
    pptCount.push(Math.floor(Math.random() * 200) + 50)
    users.push(Math.floor(Math.random() * 60) + 20)
  }

  revenueChart?.setOption({
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#1e293b' },
      extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px;'
    },
    legend: { data: ['收款金额', '生成PPT', '活跃用户'], bottom: 0, icon: 'circle', itemGap: 24, textStyle: { color: '#64748b' } },
    grid: { left: '2%', right: '2%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: dates, 
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b', margin: 12 }
    },
    yAxis: [
      { 
        type: 'value', 
        name: '金额', 
        position: 'left',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#64748b' },
        nameTextStyle: { color: '#94a3b8', padding: [0, 0, 0, -20] }
      },
      { 
        type: 'value', 
        name: '数量', 
        position: 'right',
        splitLine: { show: false },
        axisLabel: { color: '#64748b' },
        nameTextStyle: { color: '#94a3b8', padding: [0, -20, 0, 0] }
      }
    ],
    series: [
      {
        name: '收款金额', type: 'line', data: revenue,
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        lineStyle: { width: 3, color: '#3b82f6' },
        itemStyle: { color: '#3b82f6', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.2)' }, 
            { offset: 1, color: 'rgba(59, 130, 246, 0)' }
          ])
        }
      },
      {
        name: '生成PPT', type: 'line', yAxisIndex: 1, data: pptCount,
        smooth: 0.4,
        showSymbol: false,
        lineStyle: { width: 3, color: '#8b5cf6' },
        itemStyle: { color: '#8b5cf6' }
      },
      {
        name: '活跃用户', type: 'line', yAxisIndex: 1, data: users,
        smooth: 0.4,
        showSymbol: false,
        lineStyle: { width: 2, color: '#10b981', type: 'dashed' },
        itemStyle: { color: '#10b981' }
      }
    ]
  })
}

const loadStyleChart = () => {
  styleChart?.setOption({
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {c}份 ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      textStyle: { color: '#1e293b' },
      extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 8px;'
    },
    legend: { 
      bottom: 0, 
      icon: 'circle',
      textStyle: { color: '#64748b' },
      itemGap: 16
    },
    series: [{
      type: 'pie', 
      radius: ['50%', '75%'], 
      center: ['50%', '42%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 4
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: '18', fontWeight: 'bold', color: '#1e293b' }
      },
      labelLine: { show: false },
      data: [
        { value: 420, name: '科技感', itemStyle: { color: '#3b82f6' } },
        { value: 380, name: '商务', itemStyle: { color: '#8b5cf6' } },
        { value: 290, name: '极简', itemStyle: { color: '#0ea5e9' } },
        { value: 180, name: '创意', itemStyle: { color: '#10b981' } },
        { value: 120, name: '学术', itemStyle: { color: '#f59e0b' } }
      ]
    }]
  })
}

// 最近收款记录
const recentOrders = ref([
  { time: '2026-04-30 22:45', user: '用户A', type: '兑换码购买', typeColor: 'blue', amount: '¥29.90', amountColor: '#10b981', status: '已完成', statusType: 'success', remark: '30积分套餐' },
  { time: '2026-04-30 22:30', user: '用户B', type: 'PPT生成', typeColor: 'purple', amount: '-30积分', amountColor: '#ef4444', status: '已完成', statusType: 'success', remark: '科技风10页' },
  { time: '2026-04-30 22:15', user: '用户C', type: '兑换码购买', typeColor: 'blue', amount: '¥49.90', amountColor: '#10b981', status: '已完成', statusType: 'success', remark: '50积分套餐' },
  { time: '2026-04-30 21:50', user: '用户D', type: 'PPT生成', typeColor: 'purple', amount: '-50积分', amountColor: '#ef4444', status: '生成中', statusType: 'warning', remark: '商务风15页' },
  { time: '2026-04-30 21:30', user: '用户E', type: '注册赠送', typeColor: 'green', amount: '+30积分', amountColor: '#3b82f6', status: '已发放', statusType: 'success', remark: '新用户奖励' },
  { time: '2026-04-30 21:10', user: '用户F', type: '兑换码购买', typeColor: 'blue', amount: '¥99.00', amountColor: '#10b981', status: '已完成', statusType: 'success', remark: '100积分套餐' }
])

// 快捷入口
const shortcuts = ref([
  { name: '兑换码', icon: 'ep:ticket', url: '/ppt/redeem', color: '#3b82f6' },
  { name: '生成记录', icon: 'ep:files', url: '/ppt/task', color: '#8b5cf6' },
  { name: '积分流水', icon: 'ep:coin', url: '/ppt/points', color: '#10b981' },
  { name: 'AI配置', icon: 'ep:setting', url: '/ppt/ai-config', color: '#f59e0b' },
  { name: '用户管理', icon: 'ep:user', url: '/system/user', color: '#06b6d4' },
  { name: 'API接口', icon: 'ep:connection', url: '/infra/swagger', color: '#64748b' }
])

// AI 服务状态
const aiStatus = ref({ text: true, image: false })

onMounted(() => {
  if (revenueChartRef.value) revenueChart = echarts.init(revenueChartRef.value)
  if (styleChartRef.value) styleChart = echarts.init(styleChartRef.value)
  loadTrendChart()
  loadStyleChart()

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    revenueChart?.resize()
    styleChart?.resize()
  })
})

onBeforeUnmount(() => {
  revenueChart?.dispose()
  styleChart?.dispose()
})
</script>

<style lang="scss" scoped>
.modern-dashboard {
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
}

/* 欢迎栏 */
.welcome-banner {
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
  border-radius: 20px;
  padding: 24px 32px;
  box-shadow: 0 4px 20px -4px rgba(148, 163, 184, 0.15);
  border: 1px solid #e2e8f0;
}

.avatar-shadow {
  box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.2);
  border: 2px solid #ffffff;
}

.time-widget {
  text-align: right;
}

/* 数据卡片 */
.stat-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(148, 163, 184, 0.15);
    border-color: #e2e8f0;
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .stat-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-trend {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &.trend-up {
      background: #d1fae5;
      color: #059669;
    }
    &.trend-down {
      background: #fee2e2;
      color: #dc2626;
    }
  }

  .stat-num {
    font-size: 32px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .stat-label {
    font-size: 14px;
    color: #64748b;
    margin-top: 8px;
    font-weight: 500;
  }
}

/* 图表与通用卡片 */
.chart-card, .table-card, .grid-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
}

.bottom-row {
  display: flex !important;
  flex-wrap: wrap;
}
.bottom-row > .el-col {
  display: flex;
  flex-direction: column;
}

.chart-header, .card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title, .card-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

/* 表格定制 */
:deep(.modern-table) {
  --el-table-border-color: #f1f5f9;
  --el-table-header-bg-color: #f8fafc;
  --el-table-header-text-color: #475569;
  
  th.el-table__cell {
    font-weight: 600;
    padding: 12px 0;
  }
  
  td.el-table__cell {
    padding: 16px 0;
  }
  
  .el-table__row {
    transition: background-color 0.2s;
    &:hover > td.el-table__cell {
      background-color: #f8fafc;
    }
  }
  
  /* 去除底部外边框 */
  &::before {
    display: none;
  }
}

.modern-tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  
  &.tag-blue { background: #eff6ff; color: #2563eb; }
  &.tag-purple { background: #faf5ff; color: #9333ea; }
  &.tag-green { background: #f0fdf4; color: #16a34a; }
  &.tag-orange { background: #fffbeb; color: #d97706; }
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  &.status-success { background: #10b981; }
  &.status-warning { background: #f59e0b; }
  &.status-error { background: #ef4444; }
  &.status-info { background: #3b82f6; }
}

/* 快捷入口网格 */
.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 16px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  
  &:hover {
    background: #ffffff;
    border-color: #e2e8f0;
    box-shadow: 0 4px 12px -4px rgba(148, 163, 184, 0.1);
    transform: translateY(-2px);
  }

  .shortcut-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .shortcut-name {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    white-space: nowrap;
  }
}

/* 系统状态 */
.system-status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid transparent;
  transition: border-color 0.2s;
  
  &:hover {
    border-color: #e2e8f0;
  }
  
  .status-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.pulse-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  
  &::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &.healthy {
    color: #059669;
    &::before {
      background: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
    }
  }
  
  &.error {
    color: #dc2626;
    &::before {
      background: #ef4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

:deep(.modern-radio .el-radio-button__inner) {
  border-radius: 8px !important;
  border: none !important;
  background: #f1f5f9;
  color: #64748b;
  margin-left: 4px;
  padding: 6px 16px;
  font-weight: 600;
  box-shadow: none !important;
}

:deep(.modern-radio .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #3b82f6;
  color: #ffffff;
  box-shadow: 0 4px 10px -2px rgba(59, 130, 246, 0.4) !important;
}
</style>
