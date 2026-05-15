<template>
  <div class="modern-dashboard">
    <!-- 搜索工作栏 -->
    <div class="table-card mb-20px">
      <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="-mb-15px" label-width="80px">
        <el-form-item label="任务编号" prop="taskNo">
          <el-input v-model="queryParams.taskNo" class="!w-200px modern-input" clearable placeholder="请输入任务编号" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="queryParams.userId" class="!w-160px modern-input" clearable placeholder="请输入用户ID" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" class="!w-140px modern-input" clearable placeholder="全部状态">
            <el-option label="待生成" :value="0" />
            <el-option label="生成中" :value="1" />
            <el-option label="成功" :value="2" />
            <el-option label="失败" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="风格" prop="style">
          <el-select v-model="queryParams.style" class="!w-120px modern-input" clearable placeholder="风格">
            <el-option label="科技感" value="tech" />
            <el-option label="商务" value="business" />
            <el-option label="极简" value="minimal" />
          </el-select>
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
        </el-form-item>
      </el-form>
    </div>

    <!-- 列表 -->
    <div class="table-card">
      <div class="card-header-flex mb-16px">
        <span class="card-title">PPT 生成记录</span>
      </div>
      <el-table v-loading="loading" :data="list" class="modern-table">
        <el-table-column label="任务编号" prop="taskNo" width="160">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="openDetail(row)" class="font-mono font-bold">{{ row.taskNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="用户ID" prop="userId" width="100">
          <template #default="{ row }">
            <span class="font-bold text-slate-700">{{ row.userId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="PPT标题" prop="title" min-width="200" show-overflow-tooltip class-name="font-medium text-slate-800" />
        <el-table-column label="风格" prop="style" width="90">
          <template #default="{ row }">
            <span class="modern-tag tag-purple">{{ styleMap[row.style] || row.style }}</span>
          </template>
        </el-table-column>
        <el-table-column label="页数" prop="pageCount" width="70">
          <template #default="{ row }">
            <span class="font-mono text-14px">{{ row.pageCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="消耗积分" prop="pointsCost" width="90">
          <template #default="{ row }">
            <span style="color: #f59e0b; font-weight: 700;">{{ row.pointsCost }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="120">
          <template #default="{ row }">
            <div class="pulse-status" :class="taskStatusMap[row.status]?.pulseClass">
              <span>{{ taskStatusMap[row.status]?.label }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="AI模型" prop="aiModel" width="120">
          <template #default="{ row }">
            <span class="modern-tag tag-blue">{{ row.aiModel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="耗时(秒)" prop="generateTime" width="90" class-name="text-slate-500 font-mono">
          <template #default="{ row }">
            {{ row.generateTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="170" :formatter="dateFormatter" class-name="text-slate-500" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center gap-12px">
              <el-button link type="primary" @click="openDetail(row)" class="font-medium">详情</el-button>
              <el-button v-if="row.status === 3" link type="warning" @click="handleRetry(row)" class="font-medium">重试</el-button>
              <el-button v-if="row.status === 2 && row.resultUrl" link type="success" @click="handleDownload(row)" class="font-medium">下载</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="mt-20px flex justify-end">
        <Pagination v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNo" :total="total" @pagination="getList" />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <Dialog v-model="detailVisible" title="任务详情" width="650px" class="modern-dialog">
      <el-descriptions :column="2" border v-if="currentTask" class="modern-descriptions">
        <el-descriptions-item label="任务编号" label-class-name="desc-label">{{ currentTask.taskNo }}</el-descriptions-item>
        <el-descriptions-item label="用户ID" label-class-name="desc-label">{{ currentTask.userId }}</el-descriptions-item>
        <el-descriptions-item label="PPT标题" :span="2" label-class-name="desc-label">{{ currentTask.title }}</el-descriptions-item>
        <el-descriptions-item label="风格" label-class-name="desc-label">{{ styleMap[currentTask.style] || currentTask.style }}</el-descriptions-item>
        <el-descriptions-item label="页数" label-class-name="desc-label">{{ currentTask.pageCount }}</el-descriptions-item>
        <el-descriptions-item label="消耗积分" label-class-name="desc-label">{{ currentTask.pointsCost }}</el-descriptions-item>
        <el-descriptions-item label="AI模型" label-class-name="desc-label">{{ currentTask.aiModel }}</el-descriptions-item>
        <el-descriptions-item label="状态" label-class-name="desc-label">
          <div class="pulse-status" :class="taskStatusMap[currentTask.status]?.pulseClass">
            <span>{{ taskStatusMap[currentTask.status]?.label }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="耗时" label-class-name="desc-label">{{ currentTask.generateTime ? currentTask.generateTime + '秒' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户输入" :span="2" label-class-name="desc-label">
          <div class="bg-slate-50 p-12px rounded-8px text-slate-600 text-13px" style="white-space: pre-wrap; max-height: 200px; overflow-y: auto;">
            {{ currentTask.inputText || '无' }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentTask.errorMsg" label="失败原因" :span="2" label-class-name="desc-label">
          <span class="modern-tag tag-red">{{ currentTask.errorMsg }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentTask.resultUrl" label="下载链接" :span="2" label-class-name="desc-label">
          <el-link type="primary" :href="currentTask.resultUrl" target="_blank" class="font-mono">
            {{ currentTask.resultUrl }}
          </el-link>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false" class="modern-btn">关闭</el-button>
        <el-button v-if="currentTask?.status === 3" type="warning" @click="handleRetry(currentTask!)" class="modern-btn" style="background-color: #f59e0b; color: white; border: none;">
          不扣积分重试
        </el-button>
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as PptTaskApi from '@/api/ppt/task'

defineOptions({ name: 'PptTask' })

const message = useMessage()
const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])

const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  taskNo: '',
  userId: undefined,
  status: undefined as number | undefined,
  style: undefined as string | undefined,
  createTime: []
})
const queryFormRef = ref()

const styleMap: Record<string, string> = {
  'tech': '科技感',
  'business': '商务',
  'minimal': '极简'
}

const taskStatusMap: Record<number, { label: string; pulseClass: string }> = {
  0: { label: '待生成', pulseClass: 'pending' },
  1: { label: '生成中', pulseClass: 'processing' },
  2: { label: '成功', pulseClass: 'healthy' },
  3: { label: '失败', pulseClass: 'error' }
}

// 详情弹窗
const detailVisible = ref(false)
const currentTask = ref<any>(null)

const getList = async () => {
  loading.value = true
  try {
    const data = await PptTaskApi.getPptTaskPage(queryParams)
    list.value = data.list
    total.value = data.total
  } catch {
    // Mock data
    list.value = [
      { id: 1, taskNo: 'TASK-20260430-001', userId: 1001, title: '2026年Q2季度工作汇报', inputText: '包含团队目标、完成情况、下季度计划', style: 'business', pageCount: 10, pointsCost: 30, status: 2, aiModel: 'gpt-5-3', generateTime: 45, resultUrl: 'https://example.com/ppt/1.pptx', createTime: new Date() },
      { id: 2, taskNo: 'TASK-20260430-002', userId: 1002, title: 'AI技术趋势分析', inputText: 'AI大模型发展趋势、应用场景、未来展望', style: 'tech', pageCount: 15, pointsCost: 50, status: 1, aiModel: 'gpt-5-3', generateTime: null, createTime: new Date() },
      { id: 3, taskNo: 'TASK-20260430-003', userId: 1001, title: '产品需求评审', inputText: '新功能需求文档、用户故事、原型说明', style: 'minimal', pageCount: 8, pointsCost: 30, status: 3, aiModel: 'gpt-5-3', generateTime: null, errorMsg: 'AI接口超时', createTime: new Date() }
    ]
    total.value = 3
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

const openDetail = (row: any) => {
  currentTask.value = row
  detailVisible.value = true
}

const handleRetry = async (row: any) => {
  try {
    await message.confirm('确定要重试此任务吗？（不会扣除积分）')
    await PptTaskApi.retryPptTask(row.id)
    message.success('已提交重试')
    await getList()
  } catch {}
}

const handleDownload = (row: any) => {
  if (row.resultUrl) {
    window.open(row.resultUrl, '_blank')
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

/* 脉冲状态灯 */
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
    &::before { background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }
  }
  
  &.processing {
    color: #d97706;
    &::before { background: #f59e0b; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2); animation: pulse-orange 2s infinite; }
  }

  &.error {
    color: #dc2626;
    &::before { background: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2); }
  }

  &.pending {
    color: #64748b;
    &::before { background: #94a3b8; }
  }
}

@keyframes pulse-orange {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

/* Description 样式重写 */
:deep(.modern-descriptions) {
  .el-descriptions__cell {
    border-color: #f1f5f9;
  }
  .desc-label {
    background-color: #f8fafc !important;
    color: #475569;
    font-weight: 600;
    width: 100px;
  }
}
</style>
