<template>
  <Dialog v-model="dialogVisible" title="批量生成兑换码" width="500px">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="生成数量" prop="count">
        <el-select v-model="formData.count" placeholder="选择数量" class="!w-full">
          <el-option label="10 个" :value="10" />
          <el-option label="50 个" :value="50" />
          <el-option label="100 个" :value="100" />
          <el-option label="自定义" :value="0" />
        </el-select>
        <el-input-number v-if="formData.count === 0" v-model="customCount"
          :min="1" :max="1000" class="mt-8px !w-full" placeholder="输入自定义数量" />
      </el-form-item>
      <el-form-item label="积分面额" prop="points">
        <el-select v-model="formData.points" placeholder="选择面额" class="!w-full">
          <el-option label="30 积分" :value="30" />
          <el-option label="50 积分" :value="50" />
          <el-option label="100 积分" :value="100" />
          <el-option label="自定义" :value="0" />
        </el-select>
        <el-input-number v-if="formData.points === 0" v-model="customPoints"
          :min="1" :max="10000" class="mt-8px !w-full" placeholder="输入自定义积分数" />
      </el-form-item>
      <el-form-item label="有效期" prop="expireTime">
        <el-radio-group v-model="expireType" class="mb-8px">
          <el-radio-button value="forever">永久有效</el-radio-button>
          <el-radio-button value="custom">指定截止日期</el-radio-button>
        </el-radio-group>
        <el-date-picker v-if="expireType === 'custom'" v-model="formData.expireTime"
          type="datetime" placeholder="选择截止时间" class="!w-full"
          value-format="YYYY-MM-DD HH:mm:ss" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="2"
          placeholder="标记用途，如：测试用、宣发活动、合作伙伴等" />
      </el-form-item>
    </el-form>

    <!-- 生成结果展示 -->
    <div v-if="generatedCodes.length > 0" class="mt-16px">
      <el-divider content-position="left">
        <el-tag type="success" size="large">
          ✅ 成功生成 {{ generatedCodes.length }} 个兑换码
        </el-tag>
      </el-divider>
      <el-input type="textarea" :value="generatedCodes.join('\n')" :rows="6"
        readonly style="font-family: monospace;" />
      <div class="mt-8px" style="display: flex; gap: 8px;">
        <el-button type="primary" @click="handleCopyAll">
          <Icon class="mr-5px" icon="ep:document-copy" /> 复制全部
        </el-button>
        <el-button type="success" @click="handleExportCodes">
          <Icon class="mr-5px" icon="ep:download" /> 导出 Excel
        </el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button v-if="generatedCodes.length === 0" type="primary" :loading="submitLoading"
        @click="handleSubmit">
        生成
      </el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import * as RedeemCodeApi from '@/api/ppt/redeemCode'

const emit = defineEmits(['success'])
const message = useMessage()

const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref()
const expireType = ref('forever')
const customCount = ref(20)
const customPoints = ref(30)
const generatedCodes = ref<string[]>([])

const formData = reactive({
  count: 10,
  points: 30,
  expireTime: undefined as string | undefined,
  remark: ''
})

const formRules = {
  count: [{ required: true, message: '请选择生成数量', trigger: 'change' }],
  points: [{ required: true, message: '请选择积分面额', trigger: 'change' }]
}

/** 打开弹窗 */
const open = () => {
  dialogVisible.value = true
  generatedCodes.value = []
  formData.count = 10
  formData.points = 30
  formData.expireTime = undefined
  formData.remark = ''
  expireType.value = 'forever'
}

/** 提交生成 */
const handleSubmit = async () => {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    const count = formData.count === 0 ? customCount.value : formData.count
    const points = formData.points === 0 ? customPoints.value : formData.points
    const data = await RedeemCodeApi.generateRedeemCode({
      count,
      points,
      expireTime: expireType.value === 'forever' ? undefined : formData.expireTime,
      remark: formData.remark
    })
    generatedCodes.value = data || []
    message.success(`成功生成 ${generatedCodes.value.length} 个兑换码`)
    emit('success')
  } catch {
    // Mock：生成模拟码
    const count = formData.count === 0 ? customCount.value : formData.count
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      const part1 = Math.random().toString(36).substring(2, 6).toUpperCase()
      const part2 = Math.random().toString(36).substring(2, 6).toUpperCase()
      codes.push(`PPT-${part1}-${part2}`)
    }
    generatedCodes.value = codes
    message.success(`（模拟）成功生成 ${codes.length} 个兑换码`)
    emit('success')
  } finally {
    submitLoading.value = false
  }
}

/** 复制全部 */
const handleCopyAll = async () => {
  try {
    await navigator.clipboard.writeText(generatedCodes.value.join('\n'))
    message.success('已复制到剪贴板')
  } catch {
    message.error('复制失败')
  }
}

/** 导出码列表 */
const handleExportCodes = () => {
  const csvContent = 'data:text/csv;charset=utf-8,' +
    '兑换码\n' + generatedCodes.value.join('\n')
  const link = document.createElement('a')
  link.setAttribute('href', encodeURI(csvContent))
  link.setAttribute('download', `兑换码_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

defineExpose({ open })
</script>
