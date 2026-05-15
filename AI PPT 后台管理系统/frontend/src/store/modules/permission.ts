import { defineStore } from 'pinia'
import { store } from '@/store'
import { cloneDeep } from 'lodash-es'
import remainingRouter from '@/router/modules/remaining'
import { flatMultiLevelRoutes, generateRoute } from '@/utils/routerHelper'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

const { wsCache } = useCache()

export interface PermissionState {
  routers: AppRouteRecordRaw[]
  addRouters: AppRouteRecordRaw[]
  menuTabRouters: AppRouteRecordRaw[]
}

// 需要从菜单中隐藏的路径（基础设施中不需要的模块）
const HIDDEN_MENU_PATHS = ['swagger', 'file', 'file-config', 'config', 'menu']

// 基础设施下只保留这些叶子路由的 component 关键字（白名单），其余全部移除
const INFRA_KEEP_COMPONENTS = ['apiAccessLog', 'apiErrorLog']

/** 递归过滤掉不需要显示的菜单项 */
const filterHiddenMenus = (routes: AppCustomRouteRecordRaw[]): AppCustomRouteRecordRaw[] => {
  return routes
    .map((route) => {
      if (route.children && route.children.length > 0) {
        route = { ...route, children: filterHiddenMenus(route.children) }
      }
      return route
    })
    .filter((route) => !HIDDEN_MENU_PATHS.includes(route.path))
}

/** 递归检查子树中是否存在白名单叶子 */
const hasWhitelistedLeaf = (route: AppCustomRouteRecordRaw): boolean => {
  if (!route.children || route.children.length === 0) {
    const comp = route.component || route.path || ''
    return INFRA_KEEP_COMPONENTS.some((k) => comp.includes(k))
  }
  return route.children.some((child) => hasWhitelistedLeaf(child))
}

/** 递归过滤子树，只保留包含白名单叶子的分支 */
const filterInfraChildren = (children: AppCustomRouteRecordRaw[]): AppCustomRouteRecordRaw[] => {
  return children
    .filter((child) => hasWhitelistedLeaf(child))
    .map((child) => {
      if (child.children && child.children.length > 0) {
        return { ...child, children: filterInfraChildren(child.children) }
      }
      return child
    })
}

/**
 * 去掉「基础设施」外壳，只保留含白名单叶子的子组（如「API日志」）提升为顶级菜单
 */
const flattenInfraMenu = (routes: AppCustomRouteRecordRaw[]): AppCustomRouteRecordRaw[] => {
  const result: AppCustomRouteRecordRaw[] = []
  for (const route of routes) {
    if (route.path === '/infra' && route.children) {
      // 过滤出包含白名单叶子的子菜单组，直接提升到顶级
      const kept = filterInfraChildren(route.children)
      for (const child of kept) {
        result.push({ ...child, path: '/infra/' + child.path, parentId: 0 })
      }
    } else {
      result.push(route)
    }
  }
  return result
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routers: [],
    addRouters: [],
    menuTabRouters: []
  }),
  getters: {
    getRouters(): AppRouteRecordRaw[] {
      return this.routers
    },
    getAddRouters(): AppRouteRecordRaw[] {
      return flatMultiLevelRoutes(cloneDeep(this.addRouters))
    },
    getMenuTabRouters(): AppRouteRecordRaw[] {
      return this.menuTabRouters
    }
  },
  actions: {
    async generateRoutes(): Promise<unknown> {
      return new Promise<void>(async (resolve) => {
        // 获得菜单列表，它在登录的时候，setUserInfoAction 方法中已经进行获取
        let res: AppCustomRouteRecordRaw[] = []
        const roleRouters = wsCache.get(CACHE_KEY.ROLE_ROUTERS)
        if (roleRouters) {
          res = roleRouters as AppCustomRouteRecordRaw[]
        }
        // 过滤掉不需要显示的菜单（API接口、文件管理、配置管理、菜单管理）
        res = filterHiddenMenus(res)
        // 展平基础设施：只保留访问日志/错误日志，提升为顶级菜单
        res = flattenInfraMenu(res)
        // 将「系统管理」排到最后，符合常规管理面板操作习惯
        const BOTTOM_MENU_PATHS = ['/system']
        const bottomMenus = res.filter((r) => BOTTOM_MENU_PATHS.includes(r.path))
        const topMenus = res.filter((r) => !BOTTOM_MENU_PATHS.includes(r.path))
        res = [...topMenus, ...bottomMenus]
        const routerMap: AppRouteRecordRaw[] = generateRoute(res)
        // 动态路由，404一定要放到最后面
        // preschooler：vue-router@4以后已支持静态404路由，此处可不再追加
        this.addRouters = routerMap.concat([
          {
            path: '/:path(.*)*',
            // redirect: '/404',
            component: () => import('@/views/Error/404.vue'),
            name: '404Page',
            meta: {
              hidden: true,
              breadcrumb: false
            }
          }
        ])
        // 渲染菜单的所有路由
        this.routers = cloneDeep(remainingRouter).concat(routerMap)
        resolve()
      })
    },
    setMenuTabRouters(routers: AppRouteRecordRaw[]): void {
      this.menuTabRouters = routers
    }
  },
  persist: false
})

export const usePermissionStoreWithOut = () => {
  return usePermissionStore(store)
}
