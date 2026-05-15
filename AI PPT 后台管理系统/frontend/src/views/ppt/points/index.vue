<template>
  <div class="modern-dashboard">
    <!-- 搜索工作栏 -->
    <div class="table-card mb-20px">
      <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="-mb-15px" label-width="80px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="queryParams.userId" class="!w-160px modern-input" clearable placeholder="请输入用户ID" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="业务类型" prop="bizType">
          <el-select v-model="queryParams.bizType" class="!w-160px modern-input" clearable placeholder="全部类型">
            <el-option label="兑换码" value="REDEEM" />
            <el-option label="生成消耗" value="GENERATE" />
            <el-option label="注册赠送" value="REGISTER" />
            <el-option label="管理员调整" value="ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item label="流水类型" prop="flowType">
          <el-select v-model="queryParams.flowType" class="!w-120px modern-input" clearable placeholder="收支">
            <el-option label="收入" :value="1" />
            <el-option label="支出" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" prop="createTime">
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
          <el-button type="success" :loading="exportLoading" @click="handleExport" class="modern-btn modern-btn-success">
            <Icon class="mr-5px" icon="ep:download" /> 导出
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 列表 -->
    <div class="table-card">
      <div class="card-header-flex mb-16px">
        <span class="card-title">积分流水记录</span>
      </div>
      <el-table v-loading="loading" :data="list" class="modern-table">
        <el-table-column label="ID" prop="id" width="80" class-name="text-slate-500 font-mono" />
        <el-table-column label="用户ID" prop="userId" width="100">
          <template #default="{ row }">
            <span class="font-bold text-slate-700">{{ row.userId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="流水类型" prop="flowType" width="100">
          <template #default="{ row }">
            <span class="modern-tag" :class="row.flowType === 1 ? 'tag-green' : 'tag-red'">
              {{ row.flowType === 1 ? '收入' : '支出' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="业务类型" prop="bizType" width="140">
          <template #default="{ row }">
            <span class="modern-tag" :class="bizTypeMap[row.bizType]?.tagClass || 'tag-blue'">
              {{ bizTypeMap[row.bizType]?.label || row.bizType }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="变动积分" prop="amount" width="140">
          <template #default="{ row }">
            <span class="font-mono text-16px font-bold" :style="{ color: row.flowType === 1 ? '#10b981' : '#ef4444' }">
              {{ row.flowType === 1 ? '+' : '-' }}{{ row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="变动后余额" prop="balanceAfter" width="120">
          <template #default="{ row }">
            <span class="font-mono font-bold text-slate-700">{{ row.balanceAfter }}</span>
          </template>
        </el-table-column>
        <el-table-column label="关联ID" prop="bizId" width="160" show-overflow-tooltip class-name="text-slate-500 font-mono" />
        <el-table-column label="操作人" prop="operator" width="100">
          <template #default="{ row }">
            <span class="text-slate-600 font-medium">{{ row.operator || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip class-name="text-slate-500" />
        <el-table-column label="时间" prop="createTime" width="170" :formatter="dateFormatter" class-name="text-slate-500" />
      </el-table>
      
      <!-- 分页 -->
      <div class="mt-20px flex justify-end">
        <Pagination v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNo" :total="total" @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as PointsApi from '@/api/ppt/points'

defineOptions({ name: 'PptPoints' })

const message = useMessage()
const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])
const exportLoading = ref(false)

const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  userId: undefined,
  bizType: undefined as string | undefined,
  flowType: undefined as number | undefined,
  createTime: []
})
const queryFormRef = ref()

const bizTypeMap: Record<string, { label: string; tagClass: string }> = {
  'REDEEM': { label: '兑换码', tagClass: 'tag-blue' },
  'GENERATE': { label: '生成消耗', tagClass: 'tag-orange' },
  'REGISTER': { label: '注册赠送', tagClass: 'tag-green' },
  'ADMIN': { label: '管理员调整', tagClass: 'tag-purple' }
}

const getList = async () => {
  loading.value = true
  try {
    const data = await PointsApi.getPointsFlowPage(queryParams)
    list.value = data.list
    total.value = data.total
  } catch {
    // Mock data
    list.value = [
      { id: 1, userId: 1001, flowType: 1, bizType: 'REGISTER', bizId: '', amount: 30, balanceAfter: 30, operator: 'system', remark: '注册赠送', createTime: new Date() },
      { id: 2, userId: 1001, flowType: 1, bizType: 'REDEEM', bizId: 'PPT-TEST-0001', amount: 30, balanceAfter: 60, operator: '', remark: '兑换码充值', createTime: new Date() },
      { id: 3, userId: 1001, flowType: 2, bizType: 'GENERATE', bizId: 'TASK-001', amount: 30, balanceAfter: 30, operator: '', remark: '生成PPT消耗', createTime: new Date() },
      { id: 4, userId: 1002, flowType: 1, bizType: 'ADMIN', bizId: '', amount: 100, balanceAfter: 100, operator: 'admin', remark: '管理员手动充值', createTime: new Date() }
    ]
    total.value = 4
  } finally {
    loading.value = false
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

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await PointsApi.exportPointsFlow(queryParams)
    download.excel(data, '积分流水.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
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
