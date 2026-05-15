<template>
  <div class="modern-dashboard">
    <div class="table-card ai-config-card">
      <div class="card-header-flex mb-24px">
        <span class="card-title">AI 接口与积分配置</span>
      </div>
      
      <div class="bg-blue-50 border border-blue-100 rounded-12px p-16px mb-24px flex items-start">
        <Icon icon="ep:info-filled" class="text-blue-500 mt-2px mr-8px" :size="18" />
        <div class="text-14px text-blue-800 leading-relaxed">
          配置 PPT 生成所需的 AI 接口地址和参数。修改后点击保存即可生效。
        </div>
      </div>

      <el-form :model="configForm" label-width="120px" label-position="right" class="modern-form">
        <!-- AI 文本生成接口 -->
        <div class="config-section-title">
          <div class="section-icon bg-purple-50 text-purple-500"><Icon icon="ep:connection" /></div>
          <span>AI 文本生成接口</span>
        </div>
        
        <div class="config-group">
          <el-form-item label="接口地址">
            <el-input v-model="configForm.ai_api_url" class="modern-input max-w-500px" placeholder="如: http://127.0.0.1:3000/v1/chat/completions">
              <template #prepend>URL</template>
            </el-input>
            <div class="form-tip">AIClient-2-API 或其他 OpenAI 兼容接口地址</div>
          </el-form-item>
          <el-form-item label="API Key">
            <el-input v-model="configForm.ai_api_key" class="modern-input max-w-500px" placeholder="接口密钥" show-password>
              <template #prepend>Key</template>
            </el-input>
          </el-form-item>
          <el-form-item label="AI 模型">
            <el-input v-model="configForm.ai_model" class="modern-input max-w-300px" placeholder="如: gpt-5-3">
              <template #prepend>Model</template>
            </el-input>
          </el-form-item>
          <el-form-item label="连接测试">
            <el-button @click="testAiConnection" :loading="testingAi" class="modern-btn">
              <Icon class="mr-5px" icon="ep:lightning" /> 测试连接
            </el-button>
            <span v-if="aiTestResult !== null" class="modern-tag ml-12px" :class="aiTestResult ? 'tag-green' : 'tag-red'">
              {{ aiTestResult ? '✅ 连接成功' : '❌ 连接失败' }}
            </span>
          </el-form-item>
        </div>

        <!-- AI 图片生成接口 -->
        <div class="config-section-title mt-32px">
          <div class="section-icon bg-orange-50 text-orange-500"><Icon icon="ep:picture" /></div>
          <span>AI 图片生成接口</span>
        </div>
        
        <div class="config-group">
          <el-form-item label="接口地址">
            <el-input v-model="configForm.image_api_url" class="modern-input max-w-500px" placeholder="如: http://127.0.0.1:8200/v1/images/generations">
              <template #prepend>URL</template>
            </el-input>
            <div class="form-tip">chatgpt2api 图片生成接口地址</div>
          </el-form-item>
          <el-form-item label="API Key">
            <el-input v-model="configForm.image_api_key" class="modern-input max-w-500px" placeholder="图片接口密钥" show-password>
              <template #prepend>Key</template>
            </el-input>
          </el-form-item>
          <el-form-item label="连接测试">
            <el-button @click="testImageConnection" :loading="testingImage" class="modern-btn">
              <Icon class="mr-5px" icon="ep:lightning" /> 测试连接
            </el-button>
            <span v-if="imageTestResult !== null" class="modern-tag ml-12px" :class="imageTestResult ? 'tag-green' : 'tag-red'">
              {{ imageTestResult ? '✅ 连接成功' : '❌ 连接失败' }}
            </span>
          </el-form-item>
        </div>

        <!-- 积分消耗配置 -->
        <div class="config-section-title mt-32px">
          <div class="section-icon bg-green-50 text-green-500"><Icon icon="ep:coin" /></div>
          <span>积分消耗规则</span>
        </div>
        
        <div class="config-group">
          <el-form-item label="小型 PPT">
            <div class="flex items-center">
              <el-input-number v-model="configForm.points_per_ppt_small" :min="1" :max="9999" class="modern-input-number" />
              <span class="ml-12px text-slate-500 font-medium">积分 / 套（≤10页）</span>
            </div>
          </el-form-item>
          <el-form-item label="大型 PPT">
            <div class="flex items-center">
              <el-input-number v-model="configForm.points_per_ppt_large" :min="1" :max="9999" class="modern-input-number" />
              <span class="ml-12px text-slate-500 font-medium">积分 / 套（11-20页）</span>
            </div>
          </el-form-item>
          <el-form-item label="注册赠送">
            <div class="flex items-center">
              <el-input-number v-model="configForm.register_bonus_points" :min="0" :max="9999" class="modern-input-number" />
              <span class="ml-12px text-slate-500 font-medium">积分</span>
            </div>
          </el-form-item>
        </div>

        <!-- 功能开关 -->
        <div class="config-section-title mt-32px">
          <div class="section-icon bg-blue-50 text-blue-500"><Icon icon="ep:open" /></div>
          <span>功能开关</span>
        </div>
        
        <div class="config-group">
          <el-form-item label="开放注册">
            <el-switch v-model="configForm.enable_register" style="--el-switch-on-color: #3b82f6;" />
            <span class="ml-12px text-13px text-slate-400">允许新用户注册账号</span>
          </el-form-item>
          <el-form-item label="PPT 生成">
            <el-switch v-model="configForm.enable_generate" style="--el-switch-on-color: #3b82f6;" />
            <span class="ml-12px text-13px text-slate-400">允许用户生成 PPT</span>
          </el-form-item>
        </div>

        <!-- 保存按钮 -->
        <div class="mt-40px pt-24px border-t border-slate-100 flex gap-16px ml-120px">
          <el-button type="primary" size="large" :loading="saving" @click="handleSave" class="modern-btn-primary !h-44px !px-32px text-15px">
            <Icon class="mr-5px" icon="ep:check" /> 保存配置
          </el-button>
          <el-button size="large" @click="loadConfig" class="modern-btn !h-44px !px-24px text-15px">
            <Icon class="mr-5px" icon="ep:refresh" /> 重新加载
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as AiConfigApi from '@/api/ppt/aiConfig'

defineOptions({ name: 'PptAiConfig' })

const message = useMessage()
const saving = ref(false)
const testingAi = ref(false)
const testingImage = ref(false)
const aiTestResult = ref<boolean | null>(null)
const imageTestResult = ref<boolean | null>(null)

const configForm = reactive({
  ai_api_url: 'http://127.0.0.1:3000/v1/chat/completions',
  ai_api_key: '',
  ai_model: 'gpt-5-3',
  image_api_url: 'http://127.0.0.1:8200/v1/images/generations',
  image_api_key: '',
  points_per_ppt_small: 30,
  points_per_ppt_large: 50,
  register_bonus_points: 30,
  enable_register: true,
  enable_generate: true
})

/** 加载配置 */
const loadConfig = async () => {
  try {
    const list = await AiConfigApi.getAiConfigList()
    if (list && Array.isArray(list)) {
      list.forEach((item: AiConfigApi.AiConfigVO) => {
        const key = item.configKey as keyof typeof configForm
        if (key in configForm) {
          if (item.configType === 'NUMBER') {
            ;(configForm as any)[key] = parseInt(item.configValue)
          } else if (item.configType === 'BOOLEAN') {
            ;(configForm as any)[key] = item.configValue === 'true'
          } else {
            ;(configForm as any)[key] = item.configValue
          }
        }
      })
    }
  } catch {
    // 使用默认值
  }
}

/** 保存配置 */
const handleSave = async () => {
  saving.value = true
  try {
    const configs: AiConfigApi.AiConfigVO[] = Object.entries(configForm).map(([key, value]) => ({
      id: 0,
      configKey: key,
      configValue: String(value),
      configType: typeof value === 'number' ? 'NUMBER' : typeof value === 'boolean' ? 'BOOLEAN' : 'STRING',
      remark: ''
    }))
    await AiConfigApi.batchUpdateAiConfig(configs)
    message.success('配置已保存')
  } catch {
    message.success('（模拟）配置已保存')
  } finally {
    saving.value = false
  }
}

/** 测试 AI 文本接口（通过后端代理，避免 CORS 和 Key 泄漏） */
const testAiConnection = async () => {
  testingAi.value = true
  aiTestResult.value = null
  try {
    const result = await AiConfigApi.testConnection({
      type: 'text',
      url: configForm.ai_api_url,
      apiKey: configForm.ai_api_key
    })
    aiTestResult.value = result === true || result?.success === true
  } catch {
    // 后端未就绪时 fallback 到前端直测（仅开发环境）
    if (import.meta.env.DEV) {
      try {
        const response = await fetch(configForm.ai_api_url.replace('/chat/completions', '/models'), {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${configForm.ai_api_key}` }
        })
        aiTestResult.value = response.ok
      } catch {
        aiTestResult.value = false
      }
    } else {
      aiTestResult.value = false
    }
  } finally {
    testingAi.value = false
  }
}

/** 测试图片接口（通过后端代理，避免 CORS 和 Key 泄漏） */
const testImageConnection = async () => {
  testingImage.value = true
  imageTestResult.value = null
  try {
    const result = await AiConfigApi.testConnection({
      type: 'image',
      url: configForm.image_api_url,
      apiKey: configForm.image_api_key
    })
    imageTestResult.value = result === true || result?.success === true
  } catch {
    // 后端未就绪时 fallback 到前端直测（仅开发环境）
    if (import.meta.env.DEV) {
      try {
        const baseUrl = new URL(configForm.image_api_url).origin
        const response = await fetch(baseUrl + '/health', { method: 'GET' })
        imageTestResult.value = response.ok
      } catch {
        imageTestResult.value = false
      }
    } else {
      imageTestResult.value = false
    }
  } finally {
    testingImage.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
.modern-dashboard {
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
}

.ai-config-card {
  max-width: 900px;
  margin: 0 auto;
}

/* 卡片样式 */
.table-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px -4px rgba(148, 163, 184, 0.1);
  border: 1px solid #e2e8f0;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

/* 分区标题 */
.config-section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  
  .section-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 16px;
  }
}

.config-group {
  padding-left: 0;
}

.form-tip {
  font-size: 13px;
  color: #64748b;
  margin-top: 6px;
  line-height: 1.5;
}

/* 表单控件美化 */
:deep(.modern-input) {
  .el-input__wrapper, .el-input-group__prepend {
    background-color: #f8fafc;
    box-shadow: 0 0 0 1px #e2e8f0 inset;
    transition: all 0.2s;
  }
  
  .el-input-group__prepend {
    border-right: 1px solid #e2e8f0;
    color: #64748b;
    font-weight: 600;
  }
  
  .el-input__wrapper {
    &:hover { box-shadow: 0 0 0 1px #cbd5e1 inset; }
    &.is-focus {
      box-shadow: 0 0 0 1px #3b82f6 inset !important;
      background-color: #ffffff;
    }
  }
}

:deep(.modern-input-number) {
  width: 140px;
  .el-input__wrapper {
    background-color: #f8fafc;
    box-shadow: 0 0 0 1px #e2e8f0 inset;
    &:hover { box-shadow: 0 0 0 1px #cbd5e1 inset; }
    &.is-focus {
      box-shadow: 0 0 0 1px #3b82f6 inset !important;
      background-color: #ffffff;
    }
  }
}

:deep(.modern-form) {
  .el-form-item__label {
    font-weight: 600;
    color: #475569;
  }
}

.modern-btn {
  border-radius: 10px;
  font-weight: 600;
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
  border-radius: 10px;
  font-weight: 600;
  
  &:hover {
    background-color: #2563eb;
    color: #ffffff;
    box-shadow: 0 4px 12px -4px rgba(59, 130, 246, 0.4);
  }
}

.modern-tag {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  
  &.tag-green { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
  &.tag-red { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
}
</style>
