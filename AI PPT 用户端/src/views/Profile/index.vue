<template>
  <div class="profile-page" ref="pageContainer">
    <div class="container">
      <div class="page-header" ref="header">
        <h1>个人中心</h1>
        <p>管理你的账号、积分余额，并查看使用统计。</p>
      </div>

      <div class="profile-grid">
        <!-- User Info Card -->
        <div class="modern-card user-card" ref="cardUser">
          <div class="user-avatar-lg">
            {{ userStore.userInfo?.nickname?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <div class="user-details">
            <h2>{{ userStore.userInfo?.nickname || '用户名' }}</h2>
            <p class="user-email">{{ userStore.userInfo?.email || 'user@example.com' }}</p>
          </div>
          <button class="btn btn-secondary btn-sm mt-auto">编辑资料</button>
        </div>

        <!-- Points Card -->
        <div class="modern-card points-card" ref="cardPoints">
          <div class="card-header">
            <h3>可用积分</h3>
          </div>
          <div class="points-display">
            <div class="points-value text-gradient" ref="pointsVal">0</div>
            <span class="points-label">分</span>
          </div>
          <div class="redeem-form">
            <input v-model="redeemCode" class="input-field" placeholder="输入兑换码" id="redeem-input" />
            <button class="btn btn-secondary" @click="handleRedeem" :disabled="!redeemCode" id="redeem-btn">兑 换</button>
          </div>
          <transition name="fade">
            <div v-if="redeemMsg" class="redeem-msg" :class="redeemSuccess ? 'success' : 'error'">
              <div class="msg-icon">
                <svg v-if="redeemSuccess" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              {{ redeemMsg }}
            </div>
          </transition>
        </div>

        <!-- Stats Card -->
        <div class="modern-card stats-card" ref="cardStats">
          <div class="card-header">
            <h3>使用统计</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-item" v-for="(s, i) in stats" :key="i" ref="statItems">
              <div class="stat-icon" v-html="s.icon"></div>
              <div class="stat-content">
                <div class="stat-num">{{ s.val }}</div>
                <div class="stat-label">{{ s.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Points Flow -->
        <div class="modern-card flow-card" ref="cardFlow">
          <div class="card-header">
            <h3>积分流水</h3>
          </div>
          <div class="flow-list">
            <div class="flow-item" v-for="f in flows" :key="f.id" ref="flowItems">
              <div class="flow-icon" :class="f.type">
                <svg v-if="f.type === 'income'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              </div>
              <div class="flow-info">
                <span class="flow-desc">{{ f.desc }}</span>
                <span class="flow-time">{{ f.time }}</span>
              </div>
              <div class="flow-amount" :class="f.type">
                {{ f.type === 'income' ? '+' : '-' }}{{ f.amount }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'
import * as pptApi from '@/api/ppt'
import gsap from 'gsap'

const userStore = useUserStore()
const redeemCode = ref('')
const redeemMsg = ref('')
const redeemSuccess = ref(false)
const redeemLoading = ref(false)

// Refs for animation
const pageContainer = ref(null)
const header = ref(null)
const cardUser = ref(null)
const cardPoints = ref(null)
const pointsVal = ref(null)
const cardStats = ref(null)
const statItems = ref([])
const cardFlow = ref(null)
const flowItems = ref([])

let ctx: gsap.Context

const stats = ref([
  { val: 0, label: '已生成文稿', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>' },
  { val: 0, label: '已消耗积分', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
  { val: 0, label: '已获赠积分', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' },
  { val: 0, label: '已用兑换码', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>' },
])

interface FlowItem {
  id: number
  desc: string
  type: string
  amount: number
  time: string
}
const flows = ref<FlowItem[]>([])

async function loadData() {
  try {
    // Fetch points flow
    const flowData = await pptApi.getPointsFlow()
    flows.value = flowData.map(f => ({
      id: f.id,
      desc: f.remark || f.bizType,
      type: f.flowType === 1 ? 'income' : 'expense',
      amount: f.amount,
      time: new Date(f.createTime).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }) + ', ' +
            new Date(f.createTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }))

    // Fetch task list for stats
    const taskList = await pptApi.getTaskList()
    const redeemCount = flowData.filter(f => f.bizType === 'REDEEM').length

    // Update stats
    stats.value[0].val = taskList.length
    stats.value[1].val = userStore.userInfo?.totalSpent || 0
    stats.value[2].val = userStore.userInfo?.totalEarned || 0
    stats.value[3].val = redeemCount
  } catch {
    // Use defaults
  }
}

async function handleRedeem() {
  if (!redeemCode.value || redeemLoading.value) return
  redeemLoading.value = true
  redeemMsg.value = ''

  try {
    const result: any = await pptApi.redeemCode(redeemCode.value)
    redeemSuccess.value = true
    redeemMsg.value = `兑换成功！已为你增加 ${result.points} 积分。`
    redeemCode.value = ''
    
    // Refresh user info
    await userStore.refreshPoints()
    await loadData()
    
    // Smooth GSAP counter anim
    gsap.fromTo(pointsVal.value, { scale: 1.2 }, { scale: 1, duration: 0.5, ease: 'power2.out' })
  } catch (err: any) {
    redeemSuccess.value = false
    redeemMsg.value = err?.message || '兑换失败'
  } finally {
    redeemLoading.value = false
    setTimeout(() => { redeemMsg.value = '' }, 4000)
  }
}

onMounted(async () => {
  await loadData()

  ctx = gsap.context(() => {
    const tl = gsap.timeline()
    
    tl.from(header.value, { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' })
    
    tl.from([cardUser.value, cardPoints.value, cardStats.value, cardFlow.value], {
      y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out'
    }, "-=0.4")
    
    const pointsObj = { val: 0 }
    tl.to(pointsObj, {
      val: userStore.points,
      duration: 1.5,
      ease: 'power3.out',
      onUpdate: () => {
        if (pointsVal.value) {
          pointsVal.value.innerText = Math.floor(pointsObj.val).toString()
        }
      }
    }, "-=0.6")
    
    tl.from(statItems.value, {
      x: -10, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out'
    }, "-=0.8")
    
    tl.from(flowItems.value, {
      y: 10, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out'
    }, "-=0.5")
  })
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<style scoped>
.profile-page { padding: var(--space-8) 0 var(--space-24); }

.page-header { margin-bottom: var(--space-10); }
.page-header h1 { font-size: var(--text-4xl); letter-spacing: -1px; margin-bottom: var(--space-2); }
.page-header p { font-size: var(--text-lg); color: var(--text-secondary); }

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-areas: 
    "user points"
    "user stats"
    "flow flow";
  gap: var(--space-6);
}

.modern-card { padding: var(--space-6); }

.card-header { margin-bottom: var(--space-6); }
.card-header h3 { font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); }

/* User Card */
.user-card { grid-area: user; display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--space-4); }
.user-avatar-lg {
  width: 80px; height: 80px; border-radius: 50%; background: var(--gradient-brave);
  color: white; font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 700;
  display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md);
}
.user-details h2 { font-size: var(--text-xl); font-weight: 700; }
.user-email { color: var(--text-secondary); font-size: var(--text-sm); margin-top: 2px; }
.mt-auto { margin-top: auto; width: 100%; }

/* Points */
.points-card { grid-area: points; }
.points-display { display: flex; align-items: baseline; gap: var(--space-2); margin-bottom: var(--space-6); }
.points-value { font-family: var(--font-display); font-size: 3.5rem; font-weight: 800; line-height: 1; letter-spacing: -1px; }
.points-label { font-size: var(--text-sm); font-weight: 500; color: var(--text-secondary); }

.redeem-form { display: flex; gap: var(--space-3); }
.redeem-form .input-field { flex: 1; }

.redeem-msg { display: inline-flex; align-items: center; gap: 6px; margin-top: var(--space-3); padding: 8px 12px; border-radius: var(--radius-sm); font-size: var(--text-sm); font-weight: 500; }
.redeem-msg.success { background: #ecfdf5; color: #059669; }
.redeem-msg.error { background: #fef2f2; color: #dc2626; }
.msg-icon { display: flex; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Stats */
.stats-card { grid-area: stats; }
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
.stat-item { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4); background: var(--bg-secondary); border-radius: var(--radius-md); }
.stat-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); background: white; color: var(--brand-orange); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); }
.stat-content { display: flex; flex-direction: column; }
.stat-num { font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); line-height: 1.2; }
.stat-label { font-size: var(--text-xs); color: var(--text-secondary); font-weight: 500; }

/* Flow */
.flow-card { grid-area: flow; }
.flow-list { display: flex; flex-direction: column; }
.flow-item { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4) 0; border-bottom: var(--border-subtle); }
.flow-item:last-child { border-bottom: none; padding-bottom: 0; }
.flow-icon {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.flow-icon.income { background: #ecfdf5; color: #059669; }
.flow-icon.expense { background: #f3f4f6; color: #6b7280; }
.flow-info { flex: 1; display: flex; flex-direction: column; }
.flow-desc { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
.flow-time { font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px; }
.flow-amount { font-family: var(--font-display); font-size: var(--text-base); font-weight: 700; }
.flow-amount.income { color: #059669; }
.flow-amount.expense { color: var(--text-primary); }

@media (max-width: 1024px) {
  .profile-grid {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "user"
      "points"
      "stats"
      "flow";
  }
}
</style>
