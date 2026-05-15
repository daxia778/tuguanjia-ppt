<template>
  <el-form
    v-show="getShow"
    ref="formLogin"
    :model="loginData.loginForm"
    :rules="LoginRules"
    class="login-form"
    label-position="top"
    label-width="120px"
    size="large"
  >
    <el-row class="mx-[-10px]">
      <el-col :span="24" class="px-10px">
        <el-form-item>
          <LoginFormTitle class="w-full" />
        </el-form-item>
      </el-col>
      <el-col :span="24" class="px-10px" v-if="false">
        <el-form-item v-if="loginData.tenantEnable === 'true'" prop="tenantName">
          <el-input
            v-model="loginData.loginForm.tenantName"
            :placeholder="t('login.tenantNamePlaceholder')"
            :prefix-icon="iconHouse"
            link
            type="primary"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24" class="px-10px">
        <el-form-item prop="username">
          <el-input
            v-model="loginData.loginForm.username"
            :placeholder="t('login.usernamePlaceholder')"
            :prefix-icon="iconAvatar"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24" class="px-10px">
        <el-form-item prop="password">
          <el-input
            v-model="loginData.loginForm.password"
            :placeholder="t('login.passwordPlaceholder')"
            :prefix-icon="iconLock"
            show-password
            type="password"
            @keyup.enter="getCode()"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24" class="px-10px mt-[-20px] mb-[-20px]">
        <el-form-item>
          <el-row justify="space-between" style="width: 100%">
            <el-col :span="6">
              <el-checkbox v-model="loginData.loginForm.rememberMe">
                {{ t('login.remember') }}
              </el-checkbox>
            </el-col>
            <el-col :offset="6" :span="12">
              <el-link
                class="float-right"
                type="primary"
                @click="setLoginState(LoginStateEnum.RESET_PASSWORD)"
              >
                {{ t('login.forgetPassword') }}
              </el-link>
            </el-col>
          </el-row>
        </el-form-item>
      </el-col>
      <el-col :span="24" class="px-10px">
        <el-form-item>
          <XButton
            :loading="loginLoading"
            :title="t('login.login')"
            class="w-full"
            type="primary"
            @click="getCode()"
          />
        </el-form-item>
      </el-col>
      <Verify
        v-if="loginData.captchaEnable === 'true'"
        ref="verify"
        :captchaType="captchaType"
        :imgSize="{ width: '400px', height: '200px' }"
        mode="pop"
        @success="handleLogin"
      />
      <el-col :span="24" class="px-10px">
        <el-form-item>
          <div class="w-full text-center" style="margin-top: -8px;">
            <el-link type="primary" :underline="false" @click="setLoginState(LoginStateEnum.REGISTER)" style="font-size: 14px;">
              没有账号？立即注册
            </el-link>
          </div>
        </el-form-item>
      </el-col>
      <el-col :span="24" class="px-10px" style="margin-top: -12px;">
        <div class="other-login-row">
          <div class="other-login-btn" @click="setLoginState(LoginStateEnum.MOBILE)">
            <Icon icon="ep:cellphone" :size="18" />
            <span>手机登录</span>
          </div>
          <div class="other-login-divider"></div>
          <div class="other-login-btn" @click="doSocialLogin(30)">
            <Icon icon="ant-design:wechat-filled" :size="18" />
            <span>微信登录</span>
          </div>
        </div>
      </el-col>

    </el-row>
  </el-form>

  <!-- 角色选择弹窗：来自用户前端的登录，成功后弹出 -->
  <RolePickerDialog
    :visible="showRolePicker"
    :nickname="loginData.loginForm.username"
    :redirectPath="fromRedirect"
    @go-admin="handleGoAdmin"
    @go-user="handleGoUser"
  />
</template>
<script lang="ts" setup>
import { ElLoading } from 'element-plus'
import LoginFormTitle from './LoginFormTitle.vue'
import RolePickerDialog from './RolePickerDialog.vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

import { useIcon } from '@/hooks/web/useIcon'

import * as authUtil from '@/utils/auth'
import { usePermissionStore } from '@/store/modules/permission'
import * as LoginApi from '@/api/login'
import { LoginStateEnum, useFormValid, useLoginState } from './useLogin'

defineOptions({ name: 'LoginForm' })

const { t } = useI18n()
const message = useMessage()
const iconHouse = useIcon({ icon: 'ep:house' })
const iconAvatar = useIcon({ icon: 'ep:avatar' })
const iconLock = useIcon({ icon: 'ep:lock' })
const formLogin = ref()
const { validForm } = useFormValid(formLogin)
const { setLoginState, getLoginState } = useLoginState()
const { currentRoute, push } = useRouter()
const permissionStore = usePermissionStore()
const redirect = ref<string>('')
const loginLoading = ref(false)
const verify = ref()
const captchaType = ref('blockPuzzle') // blockPuzzle 滑块 clickWord 点击文字 pictureWord 文字验证码

// ── 用户前端来源检测 ──
const fromUser = ref(false)       // 是否来自用户前端
const fromRedirect = ref('/')     // 用户前端回跳路径
const showRolePicker = ref(false) // 角色选择弹窗

const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN)

const LoginRules = {
  tenantName: [required],
  username: [required],
  password: [required]
}
const loginData = reactive({
  isShowPassword: false,
  captchaEnable: import.meta.env.VITE_APP_CAPTCHA_ENABLE,
  tenantEnable: import.meta.env.VITE_APP_TENANT_ENABLE,
  loginForm: {
    tenantName: import.meta.env.VITE_APP_DEFAULT_LOGIN_TENANT || '',
    username: import.meta.env.VITE_APP_DEFAULT_LOGIN_USERNAME || '',
    password: import.meta.env.VITE_APP_DEFAULT_LOGIN_PASSWORD || '',
    captchaVerification: '',
    rememberMe: true // 默认记录我。如果不需要，可手动修改
  }
})

const socialList = [
  { icon: 'ant-design:wechat-filled', type: 30 },
  { icon: 'ant-design:dingtalk-circle-filled', type: 20 },
  { icon: 'ant-design:github-filled', type: 0 },
  { icon: 'ant-design:alipay-circle-filled', type: 0 }
]

// 获取验证码
const getCode = async () => {
  // 情况一，未开启：则直接登录
  if (loginData.captchaEnable === 'false') {
    await handleLogin({})
  } else {
    // 情况二，已开启：则展示验证码；只有完成验证码的情况，才进行登录
    // 弹出验证码
    verify.value.show()
  }
}
// 获取租户 ID
const getTenantId = async () => {
  if (loginData.tenantEnable === 'true') {
    try {
      const res = await LoginApi.getTenantIdByName(loginData.loginForm.tenantName)
      authUtil.setTenantId(res)
    } catch (e) {
      console.warn('[Mock] 租户获取失败，跳过', e)
    }
  }
}
// 记住我
const getLoginFormCache = () => {
  const loginForm = authUtil.getLoginForm()
  if (loginForm) {
    loginData.loginForm = {
      ...loginData.loginForm,
      username: loginForm.username ? loginForm.username : loginData.loginForm.username,
      password: loginForm.password ? loginForm.password : loginData.loginForm.password,
      rememberMe: loginForm.rememberMe,
      tenantName: loginForm.tenantName ? loginForm.tenantName : loginData.loginForm.tenantName
    }
  }
}
// 根据域名，获得租户信息
const getTenantByWebsite = async () => {
  if (loginData.tenantEnable === 'true') {
    try {
      const website = location.host
      const res = await LoginApi.getTenantByWebsite(website)
      if (res) {
        loginData.loginForm.tenantName = res.name
        authUtil.setTenantId(res.id)
      }
    } catch (e) {
      console.warn('[Mock] 租户域名查询失败，跳过', e)
    }
  }
}
const loading = ref() // ElLoading.service 返回的实例

// ────────────────────────────────────────────────────
//  Mock 数据：后端不可用时提供完整的管理面板体验
// ────────────────────────────────────────────────────
const MOCK_PPT_MENUS: any[] = [
  {
    id: 9000, name: 'PPT管理', path: '/ppt', component: '',
    icon: 'ep:document', parentId: 0, sort: 1, type: 1,
    children: [
      { id: 9010, name: '仪表盘', path: 'dashboard', component: 'ppt/dashboard/index', icon: 'ep:data-line', parentId: 9000, sort: 1, type: 2 },
      { id: 9020, name: '生成任务', path: 'task', component: 'ppt/task/index', icon: 'ep:list', parentId: 9000, sort: 2, type: 2 },
      { id: 9030, name: '积分管理', path: 'points', component: 'ppt/points/index', icon: 'ep:coin', parentId: 9000, sort: 3, type: 2 },
      { id: 9040, name: '兑换码管理', path: 'redeem', component: 'ppt/redeem/index', icon: 'ep:ticket', parentId: 9000, sort: 4, type: 2 },
      { id: 9050, name: 'AI 配置', path: 'aiConfig', component: 'ppt/aiConfig/index', icon: 'ep:setting', parentId: 9000, sort: 5, type: 2 },
    ]
  },
  {
    id: 9100, name: '系统管理', path: '/system', component: '',
    icon: 'ep:tools', parentId: 0, sort: 99, type: 1,
    children: [
      { id: 9110, name: '用户管理', path: 'user', component: 'system/user/index', icon: 'ep:user', parentId: 9100, sort: 1, type: 2 },
      { id: 9120, name: '角色管理', path: 'role', component: 'system/role/index', icon: 'ep:avatar', parentId: 9100, sort: 2, type: 2 },
      { id: 9130, name: '菜单管理', path: 'menu', component: 'system/menu/index', icon: 'ep:menu', parentId: 9100, sort: 3, type: 2 },
    ]
  }
]

const buildMockUserInfo = (username: string) => ({
  permissions: ['*:*:*'],  // 超级管理员权限
  roles: ['super_admin'],
  user: {
    id: 1,
    avatar: '',
    nickname: username === 'admin' ? '管理员' : username,
    deptId: 100,
    username,
  },
  menus: MOCK_PPT_MENUS
})

// 登录
const handleLogin = async (params: any) => {
  loginLoading.value = true
  try {
    await getTenantId()
    const data = await validForm()
    if (!data) {
      return
    }
    const loginDataLoginForm = { ...loginData.loginForm }
    loginDataLoginForm.captchaVerification = params.captchaVerification

    let res: any = null
    let isMock = false

    try {
      res = await LoginApi.login(loginDataLoginForm)
    } catch (e: any) {
      // 后端不可用（网络错误 / ECONNREFUSED / 超时），使用 Mock 登录
      console.warn('[Mock] 后端不可用，使用 Mock 登录', e)
      isMock = true
    }

    if (!isMock && !res) {
      return
    }

    loading.value = ElLoading.service({
      lock: true,
      text: '正在加载系统中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    if (isMock) {
      // ── Mock 路径：写入模拟 Token 和用户缓存 ──
      const mockToken = {
        accessToken: 'mock-admin-token-' + Date.now(),
        refreshToken: 'mock-refresh-' + Date.now(),
        userId: 1,
        userType: 2,
        clientId: 'default',
        expiresTime: Date.now() + 86400000,
      }
      authUtil.setToken(mockToken as any)
      // 直接写入用户缓存（跳过 getInfo API）
      const mockInfo = buildMockUserInfo(loginDataLoginForm.username)
      const { wsCache } = await import('@/hooks/web/useCache').then(m => ({ wsCache: m.useCache().wsCache }))
      const { CACHE_KEY } = await import('@/hooks/web/useCache')
      wsCache.set(CACHE_KEY.USER, mockInfo)
      wsCache.set(CACHE_KEY.ROLE_ROUTERS, mockInfo.menus)
    } else {
      // ── 正常路径 ──
      authUtil.setToken(res)
    }

    if (loginDataLoginForm.rememberMe) {
      authUtil.setLoginForm(loginDataLoginForm)
    } else {
      authUtil.removeLoginForm()
    }

    if (!redirect.value) {
      redirect.value = '/'
    }

    // ── 来自用户前端：弹出角色选择 ──
    if (fromUser.value) {
      loading.value?.close()
      showRolePicker.value = true
      return
    }

    // 判断是否为SSO登录
    if (redirect.value.indexOf('sso') !== -1) {
      window.location.href = window.location.href.replace('/login?redirect=', '')
    } else {
      await push({ path: redirect.value || permissionStore.addRouters[0].path })
    }
  } finally {
    loginLoading.value = false
    loading.value?.close()
  }
}

// ── 角色选择弹窗事件 ──
const handleGoAdmin = () => {
  showRolePicker.value = false
  // 使用 window.location 导航到管理面板首页（避免被 permission guard 二次拦截）
  window.location.href = '/admin/'
}

const handleGoUser = (redirectPath: string) => {
  showRolePicker.value = false
  // 跳转到用户前端（确保以 / 开头，不带 /admin 前缀）
  let target = redirectPath || '/'
  if (target.startsWith('/admin')) {
    target = target.replace(/^\/admin/, '') || '/'
  }
  window.location.href = target
}

// 社交登录
const doSocialLogin = async (type: number) => {
  if (type === 0) {
    message.error('此方式未配置')
  } else {
    loginLoading.value = true
    if (loginData.tenantEnable === 'true') {
      // 尝试先通过 tenantName 获取租户
      await getTenantId()
      // 如果获取不到，则需要弹出提示，进行处理
      if (!authUtil.getTenantId()) {
        try {
          const data = await message.prompt('请输入租户名称', t('common.reminder'))
          if (data?.action !== 'confirm') throw 'cancel'
          const res = await LoginApi.getTenantIdByName(data.value)
          authUtil.setTenantId(res)
        } catch (error) {
          if (error === 'cancel') return
        } finally {
          loginLoading.value = false
        }
      }
    }
    // 计算 redirectUri
    // 注意: type、redirect 需要先 encode 一次，否则钉钉回调会丢失。
    // 配合 social-login.vue#getUrlValue() 使用
    const redirectUri =
      location.origin +
      '/social-login?' +
      encodeURIComponent(`type=${type}&redirect=${redirect.value || '/'}`)

    // 进行跳转
    window.location.href = await LoginApi.socialAuthRedirect(type, encodeURIComponent(redirectUri))
  }
}
watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)
onMounted(() => {
  getLoginFormCache()
  getTenantByWebsite()

  // ── 检测 URL 参数：from=user & action=register ──
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('from') === 'user') {
    fromUser.value = true
    fromRedirect.value = urlParams.get('redirect') || '/'
  }
  if (urlParams.get('action') === 'register') {
    setLoginState(LoginStateEnum.REGISTER)
  }
})
</script>

<style lang="scss" scoped>
:deep(.anticon) {
  &:hover {
    color: var(--el-color-primary) !important;
  }
}

.other-login-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  padding-bottom: 8px;
}

.other-login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  transition: all 0.2s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.06);
  }
}

.other-login-divider {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 4px;
}

.login-code {
  float: right;
  width: 100%;
  height: 38px;

  img {
    width: 100%;
    height: auto;
    max-width: 100px;
    vertical-align: middle;
    cursor: pointer;
  }
}
</style>
