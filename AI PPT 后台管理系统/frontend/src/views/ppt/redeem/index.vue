<template>
  <div class="modern-dashboard">
    <!-- 搜索工作栏 -->
    <div class="table-card mb-20px">
      <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="-mb-15px" label-width="80px">
        <el-form-item label="兑换码" prop="code">
          <el-input v-model="queryParams.code" class="!w-200px modern-input" clearable placeholder="请输入兑换码" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" class="!w-160px modern-input" clearable placeholder="全部状态">
            <el-option label="未使用" :value="0" />
            <el-option label="已使用" :value="1" />
            <el-option label="已过期" :value="2" />
            <el-option label="已作废" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="批次号" prop="batchNo">
          <el-input v-model="queryParams.batchNo" class="!w-200px modern-input" clearable placeholder="请输入批次号" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker v-model="queryParams.createTime" type="daterange" start-placeholder="开始日期"
            end-placeholder="结束日期" class="!w-240px modern-input" value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]" />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery" class="modern-btn">
            <Icon class="mr-5px" icon="ep:search" /> 搜索
          </el-button>
          <el-button @click="resetQuery" class="modern-btn">
            <Icon class="mr-5px" icon="ep:refresh" /> 重置
          </el-button>
          <el-button type="primary" @click="openGenerateDialog" class="modern-btn modern-btn-primary">
            <Icon class="mr-5px" icon="ep:plus" /> 批量生成
          </el-button>
          <el-button type="success" :loading="exportLoading" @click="handleExport" class="modern-btn modern-btn-success">
            <Icon class="mr-5px" icon="ep:download" /> 导出
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="24" class="mb-20px">
      <el-col :span="6" v-for="(stat, index) in statCards" :key="index">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon-wrap" :style="{ background: stat.color + '15', color: stat.color }">
              <Icon :icon="stat.icon" :size="24" />
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-num">
              <CountTo :start-val="0" :end-val="stat.value" :duration="2000" />
              <span v-if="stat.suffix" class="text-16px text-slate-400 font-medium ml-4px">{{ stat.suffix }}</span>
            </div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 列表 -->
    <div class="table-card">
      <div class="card-header-flex mb-16px">
        <span class="card-title">兑换码列表</span>
      </div>
      <el-table v-loading="loading" :data="list" class="modern-table">
        <el-table-column label="兑换码" prop="code" width="180">
          <template #default="{ row }">
            <span class="font-mono text-14px font-bold text-slate-700 bg-slate-100 px-8px py-4px rounded-6px">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column label="积分面额" prop="points" width="100">
          <template #default="{ row }">
            <span style="font-weight: 700; color: #f59e0b;">{{ row.points }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="100">
          <template #default="{ row }">
            <span class="modern-tag" :class="statusMap[row.status]?.tagClass">
              {{ statusMap[row.status]?.label }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="使用者" prop="usedBy" width="120">
          <template #default="{ row }">
            <span class="text-slate-600 font-medium">{{ row.usedBy || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="兑换时间" prop="usedTime" width="170" :formatter="dateFormatter" class-name="text-slate-500" />
        <el-table-column label="过期时间" prop="expireTime" width="170" class-name="text-slate-500">
          <template #default="{ row }">
            {{ row.expireTime ? formatDate(row.expireTime) : '永久有效' }}
          </template>
        </el-table-column>
        <el-table-column label="批次号" prop="batchNo" width="160" class-name="text-slate-600 font-medium" />
        <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip class-name="text-slate-500" />
        <el-table-column label="创建时间" prop="createTime" width="170" :formatter="dateFormatter" class-name="text-slate-500" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 0" link type="danger" @click="handleInvalidate(row)" class="font-medium">
              作废
            </el-button>
            <span v-else class="text-slate-300">-</span>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="mt-20px flex justify-end">
        <Pagination v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNo" :total="total" @pagination="getList" />
      </div>
    </div>

    <!-- 批量生成弹窗 -->
    <RedeemCodeGenerateDialog ref="generateDialogRef" @success="handleGenerateSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { dateFormatter, formatDate } from '@/utils/formatTime'
import download from '@/utils/download'
import * as RedeemCodeApi from '@/api/ppt/redeemCode'
import RedeemCodeGenerateDialog from './RedeemCodeGenerateDialog.vue'

defineOptions({ name: 'PptRedeem' })

const message = useMessage()

const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])
const exportLoading = ref(false)

const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  code: '',
  status: undefined as number | undefined,
  batchNo: '',
  createTime: []
})
const queryFormRef = ref()

// 状态映射
const statusMap: Record<number, { label: string; tagClass: string }> = {
  0: { label: '未使用', tagClass: 'tag-blue' },
  1: { label: '已使用', tagClass: 'tag-green' },
  2: { label: '已过期', tagClass: 'tag-orange' },
  3: { label: '已作废', tagClass: 'tag-red' }
}

// 统计数据
const stats = ref({
  totalCount: 0, usedCount: 0, unusedCount: 0, usageRate: 0
})

const statCards = computed(() => [
  { label: '总生成数', value: stats.value.totalCount, icon: 'ep:document-copy', color: '#8b5cf6' },
  { label: '已使用', value: stats.value.usedCount, icon: 'ep:check', color: '#10b981', suffix: `/ ${stats.value.totalCount}` },
  { label: '未使用', value: stats.value.unusedCount, icon: 'ep:ticket', color: '#3b82f6' },
  { label: '使用率(%)', value: Number((stats.value.usageRate * 100).toFixed(1)), icon: 'ep:pie-chart', color: '#f59e0b' }
])

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await RedeemCodeApi.getRedeemCodePage(queryParams)
    list.value = data.list
    total.value = data.total
  } catch {
    // 仅开发环境使用 mock 数据，生产环境显示错误
    if (import.meta.env.DEV) {
      list.value = [
        { id: 1, code: 'PPT-TEST-0001', points: 30, status: 0, batchNo: 'BATCH-INIT-001', remark: '初始化测试码', createTime: new Date() },
        { id: 2, code: 'PPT-TEST-0002', points: 30, status: 1, usedBy: '1001', usedTime: new Date(), batchNo: 'BATCH-INIT-001', remark: '初始化测试码', createTime: new Date() },
        { id: 3, code: 'PPT-TEST-0003', points: 50, status: 0, batchNo: 'BATCH-INIT-001', remark: '初始化测试码', createTime: new Date() },
        { id: 4, code: 'PPT-TEST-0004', points: 100, status: 3, batchNo: 'BATCH-INIT-001', remark: '初始化测试码', createTime: new Date() },
        { id: 5, code: 'PPT-TEST-0005', points: 30, status: 2, batchNo: 'BATCH-INIT-001', remark: '初始化测试码', createTime: new Date(Date.now() - 86400000), expireTime: new Date(Date.now() - 3600000) }
      ]
      total.value = 5
    } else {
      list.value = []
      total.value = 0
      message.error('加载兑换码列表失败')
    }
  } finally {
    loading.value = false
  }
}

/** 加载统计 */
const loadStats = async () => {
  try {
    const data = await RedeemCodeApi.getRedeemCodeStats()
    if (data) stats.value = data
  } catch {
    if (import.meta.env.DEV) {
      stats.value = { totalCount: 5, usedCount: 1, unusedCount: 2, usageRate: 0.2 }
    }
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 作废 */
const handleInvalidate = async (row: any) => {
  try {
    await message.confirm(`确定要作废兑换码 ${row.code} 吗？`)
    await RedeemCodeApi.invalidateRedeemCode(row.id)
    message.success('已作废')
    await getList()
    await loadStats()
  } catch {}
}

/** 导出 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await RedeemCodeApi.exportRedeemCode(queryParams)
    download.excel(data, '兑换码数据.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 打开生成弹窗 */
const generateDialogRef = ref()
const openGenerateDialog = () => {
  generateDialogRef.value?.open()
}

/** 生成成功回调 */
const handleGenerateSuccess = () => {
  getList()
  loadStats()
}

onMounted(() => {
  getList()
  loadStats()
})
</script>

<style lang="scss" scoped>
.modern-dashboard {
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
}

/* 卡片样式 */
.table-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
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
    display: flex;
    align-items: baseline;
  }

  .stat-label {
    font-size: 14px;
    color: #64748b;
    margin-top: 8px;
    font-weight: 500;
  }
}

/* 表单控件美化 */
:deep(.modern-input) {
  .el-input__wrapper, .el-select__wrapper {
    background-color: #f8fafc;
    border-radius: 10px;
    box-shadow: 0 0 0 1px #e2e8f0 inset;
    transition: all 0.2s;
    
    &:hover {
      box-shadow: 0 0 0 1px #cbd5e1 inset;
    }
    
    &.is-focus {
      box-shadow: 0 0 0 1px #3b82f6 inset !important;
      background-color: #ffffff;
    }
  }
}

.modern-btn {
  border-radius: 10px;
  font-weight: 500;
  padding: 8px 16px;
  height: 36px;
  border-color: #e2e8f0;
  color: #475569;
  
  &:hover {
    background-color: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5e1;
  }
}

.modern-btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
  border: none;
  
  &:hover {
    background-color: #2563eb;
    color: #ffffff;
    box-shadow: 0 4px 12px -4px rgba(59, 130, 246, 0.4);
  }
}

.modern-btn-success {
  background-color: #10b981;
  color: #ffffff;
  border: none;
  
  &:hover {
    background-color: #059669;
    color: #ffffff;
    box-shadow: 0 4px 12px -4px rgba(16, 185, 129, 0.4);
  }
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
  &.tag-red { background: #fef2f2; color: #ef4444; }
}
</style>
