<script setup lang="ts">
import { provide, computed, watch, onMounted } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { ComponentSize, ElConfigProvider } from 'element-plus'
import { useLocaleStore } from '@/store/modules/locale'
import { useWindowSize } from '@vueuse/core'
import { useAppStore } from '@/store/modules/app'
import { setCssVar } from '@/utils'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { useDesign } from '@/hooks/web/useDesign'

const { variables } = useDesign()

const appStore = useAppStore()

const props = defineProps({
  size: propTypes.oneOf<ComponentSize>(['default', 'small', 'large']).def('default')
})

provide('configGlobal', props)

// 初始化所有主题色
onMounted(() => {
  // 强制刷新主题缓存，确保新的浅色侧边栏主题生效
  const THEME_VERSION = 'v4_dark_navy'
  const cachedVersion = localStorage.getItem('__theme_version__')
  if (cachedVersion !== THEME_VERSION) {
    const { wsCache } = useCache()
    wsCache.delete(CACHE_KEY.THEME)
    // 重置 store 中的 theme 为默认值
    appStore.setTheme({
      elColorPrimary: '#3b82f6',
      leftMenuBorderColor: 'inherit',
      leftMenuBgColor: '#1e293b',
      leftMenuBgLightColor: '#283548',
      leftMenuBgActiveColor: 'rgba(59, 130, 246, 0.15)',
      leftMenuCollapseBgActiveColor: 'rgba(59, 130, 246, 0.15)',
      leftMenuTextColor: '#94a3b8',
      leftMenuTextActiveColor: '#60a5fa',
      logoTitleTextColor: '#f1f5f9',
      logoBorderColor: 'inherit',
      topHeaderBgColor: '#fff',
      topHeaderTextColor: 'inherit',
      topHeaderHoverColor: '#f1f5f9',
      topToolBorderColor: '#e2e8f0'
    })
    localStorage.setItem('__theme_version__', THEME_VERSION)
  }
  appStore.setCssVarTheme()
})

const { width } = useWindowSize()

// 监听窗口变化
watch(
  () => width.value,
  (width: number) => {
    if (width < 768) {
      !appStore.getMobile ? appStore.setMobile(true) : undefined
      setCssVar('--left-menu-min-width', '0')
      appStore.setCollapse(true)
      appStore.getLayout !== 'classic' ? appStore.setLayout('classic') : undefined
    } else {
      appStore.getMobile ? appStore.setMobile(false) : undefined
      setCssVar('--left-menu-min-width', '64px')
    }
  },
  {
    immediate: true
  }
)

// 多语言相关
const localeStore = useLocaleStore()

const currentLocale = computed(() => localeStore.currentLocale)
</script>

<template>
  <ElConfigProvider
    :namespace="variables.elNamespace"
    :locale="currentLocale.elLocale"
    :message="{ max: 5 }"
    :size="size"
  >
    <slot></slot>
  </ElConfigProvider>
</template>
