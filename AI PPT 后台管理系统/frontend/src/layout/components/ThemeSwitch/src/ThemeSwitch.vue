<script lang="ts" setup>
import { useAppStore } from '@/store/modules/app'
import { useIcon } from '@/hooks/web/useIcon'
import { useDesign } from '@/hooks/web/useDesign'

defineOptions({ name: 'ThemeSwitch' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('theme-switch')

const Sun = useIcon({ icon: 'emojione-monotone:sun', color: '#fde047' })

const CrescentMoon = useIcon({ icon: 'emojione-monotone:crescent-moon', color: '#fde047' })

const appStore = useAppStore()

// 初始化获取是否是暗黑主题
const isDark = ref(appStore.getIsDark)

// 设置switch的背景颜色
const blackColor = 'var(--el-color-black)'

const themeChange = (val: boolean) => {
  appStore.setIsDark(val)
}
</script>

<template>
  <button
    class="neo-theme-switch"
    :class="[prefixCls, { 'is-dark': isDark }]"
    @click="themeChange(!isDark)"
  >
    <component :is="isDark ? CrescentMoon : Sun" />
  </button>
</template>
<style lang="scss" scoped>
.neo-theme-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #fff;
  border: 3px solid #000;
  border-radius: 8px;
  box-shadow: 4px 4px 0px #000;
  cursor: pointer;
  transition: all 0.1s ease;
  outline: none;
  
  &:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #000;
  }
}

:global(.dark) .neo-theme-switch {
  background-color: #222;
  border-color: #000;
  box-shadow: 4px 4px 0px #000;
}
</style>
