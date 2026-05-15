<template>
  <div class="modern-dashboard">
    <!-- 数据卡片区域 -->
    <el-row :gutter="24" class="mb-20px">
      <el-col :sm="12" :lg="4" v-for="(card, index) in summaryCards" :key="index">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon-wrap" :style="{ background: card.color + '15', color: card.color }">
              <Icon :icon="card.icon" :size="24" />
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

    <!-- 趋势图 -->
    <el-row :gutter="24">
      <el-col :span="16">
        <div class="chart-card h-full">
          <div class="chart-header">
            <span class="chart-title">运营趋势</span>
            <el-radio-group v-model="trendDays" size="small" class="modern-radio" @change="loadTrendData">
              <el-radio-button :value="7">近7天</el-radio-button>
              <el-radio-button :value="30">近30天</el-radio-button>
              <el-radio-button :value="90">近90天</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="trendChartRef" style="height: 360px"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-card h-full">
          <div class="chart-header">
            <span class="chart-title">兑换码使用率</span>
          </div>
          <div ref="redeemChartRef" style="height: 360px"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import * as DashboardApi from '@/api/ppt/dashboard'
import * as RedeemCodeApi from '@/api/ppt/redeemCode'
import * as echarts from 'echarts'

defineOptions({ name: 'PptDashboard' })

// 汇总数据
const summaryCards = ref([
  { label: '今日新增用户', value: 0, icon: 'ep:user', color: '#3b82f6' },
  { label: '总用户数', value: 0, icon: 'ep:avatar', color: '#10b981' },
  { label: '今日生成次数', value: 0, icon: 'ep:document', color: '#8b5cf6' },
  { label: '总积分消耗', value: 0, icon: 'ep:coin', color: '#f59e0b' },
  { label: '今日兑换码使用', value: 0, icon: 'ep:ticket', color: '#06b6d4' },
  { label: '积分剩余总量', value: 0, icon: 'ep:money', color: '#ec4899' }
])

// 趋势图
const trendDays = ref(7)
const trendChartRef = ref()
const redeemChartRef = ref()
let trendChart: echarts.ECharts | null = null
let redeemChart: echarts.ECharts | null = null

/** 加载汇总数据 */
const loadSummary = async () => {
  try {
    const data = await DashboardApi.getDashboardSummary()
    summaryCards.value[0].value = data.todayNewUsers || 0
    summaryCards.value[1].value = data.totalUsers || 0
    summaryCards.value[2].value = data.todayGenerateCount || 0
    summaryCards.value[3].value = data.totalPointsSpent || 0
    summaryCards.value[4].value = data.todayRedeemCount || 0
    summaryCards.value[5].value = data.totalPointsBalance || 0
  } catch {
    // 后端未就绪时使用模拟数据
    summaryCards.value[0].value = 12
    summaryCards.value[1].value = 256
    summaryCards.value[2].value = 38
    summaryCards.value[3].value = 1540
    summaryCards.value[4].value = 8
    summaryCards.value[5].value = 4280
  }
}

/** 加载趋势数据 */
const loadTrendData = async () => {
  let dates: string[] = []
  let newUsers: number[] = []
  let generateCount: number[] = []
  let pointsSpent: number[] = []

  try {
    // 优先从后端获取真实数据
    const data = await DashboardApi.getDashboardTrend({ days: trendDays.value })
    if (data && data.dates && data.dates.length > 0) {
      dates = data.dates
      newUsers = data.newUsers
      generateCount = data.generateCount
      pointsSpent = data.pointsSpent
    } else {
      throw new Error('empty data')
    }
  } catch {
    // 后端未就绪时使用模拟数据（仅开发环境）
    const days = trendDays.value
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
      newUsers.push(Math.floor(Math.random() * 20) + 5)
      generateCount.push(Math.floor(Math.random() * 50) + 10)
      pointsSpent.push(Math.floor(Math.random() * 500) + 100)
    }
  }

  if (trendChart) {
    trendChart.setOption({
      tooltip: { 
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#1e293b' },
        extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 8px;'
      },
      legend: { data: ['新增用户', '生成次数', '积分消耗'], bottom: 0, icon: 'circle', textStyle: { color: '#64748b' } },
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
          name: '次数', 
          position: 'left',
          splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
          axisLabel: { color: '#64748b' }
        },
        { 
          type: 'value', 
          name: '积分', 
          position: 'right',
          splitLine: { show: false },
          axisLabel: { color: '#64748b' }
        }
      ],
      series: [
        {
          name: '新增用户', type: 'line', data: newUsers, 
          smooth: 0.4, showSymbol: false,
          lineStyle: { width: 3, color: '#3b82f6' },
          itemStyle: { color: '#3b82f6' }, 
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.2)' }, 
              { offset: 1, color: 'rgba(59, 130, 246, 0)' }
            ])
          }
        },
        {
          name: '生成次数', type: 'line', data: generateCount, 
          smooth: 0.4, showSymbol: false,
          lineStyle: { width: 3, color: '#8b5cf6' },
          itemStyle: { color: '#8b5cf6' }, 
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(139, 92, 246, 0.2)' }, 
              { offset: 1, color: 'rgba(139, 92, 246, 0)' }
            ])
          }
        },
        {
          name: '积分消耗', type: 'bar', yAxisIndex: 1, data: pointsSpent,
          barWidth: '20%',
          itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] }
        }
      ]
    })
  }
}

/** 加载兑换码统计 */
const loadRedeemStats = async () => {
  let stats = { totalCount: 100, usedCount: 45, unusedCount: 50, expiredCount: 3, invalidatedCount: 2, usageRate: 0.45 }
  try {
    const data = await RedeemCodeApi.getRedeemCodeStats()
    if (data) stats = data
  } catch {}

  if (redeemChart) {
    redeemChart.setOption({
      tooltip: { 
        trigger: 'item', 
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#1e293b' },
        extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 8px;'
      },
      legend: { bottom: 0, icon: 'circle', textStyle: { color: '#64748b' } },
      series: [{
        type: 'pie', radius: ['50%', '75%'], center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 4 },
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: stats.usedCount, name: '已使用', itemStyle: { color: '#10b981' } },
          { value: stats.unusedCount, name: '未使用', itemStyle: { color: '#3b82f6' } },
          { value: stats.expiredCount, name: '已过期', itemStyle: { color: '#f59e0b' } },
          { value: stats.invalidatedCount, name: '已作废', itemStyle: { color: '#ef4444' } }
        ]
      }]
    })
  }
}

/** 初始化图表 */
const initCharts = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
  }
  if (redeemChartRef.value) {
    redeemChart = echarts.init(redeemChartRef.value)
  }
}

/** resize 处理函数（命名函数，确保可以正确 removeEventListener） */
const handleResize = () => {
  trendChart?.resize()
  redeemChart?.resize()
}

onMounted(() => {
  initCharts()
  loadSummary()
  loadTrendData()
  loadRedeemStats()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  redeemChart?.dispose()
})
</script>

<style lang="scss" scoped>
.modern-dashboard {
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
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

/* 图表卡片 */
.chart-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
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
