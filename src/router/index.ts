import { createRouter, createWebHashHistory } from 'vue-router'
import MemberList from '../views/MemberList.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/members'
    },
    {
      path: '/members',
      name: 'MemberList',
      component: MemberList,
      meta: { // meta是用來標記路由的額外資訊，這裡表示進入頁面需要驗證登入狀態
        requiresAuth: true,
        roles: ['admin', 'staff'] // 只有 admin 和 staff 可以進入
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { // 進入頁面不需要驗證登入狀態
        requiresAuth: false
      }
    }
  ],
})

// 路由守衛，檢查頁面是否需要驗證登入狀態
import { useAuthStore } from '../stores/auth'

router.beforeEach((to) => {
  const authStore = useAuthStore()

  // 需要登入，但目前尚未登入
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login' }
  }

  // 已登入，又要前往登入頁
  if (to.name === 'Login' && authStore.isAuthenticated) {
    return { name: 'MemberList'}
  }

  // 檢查目前使用者是否具有該頁面的存取權限
  if (
    to.meta.roles &&
    authStore.user &&
    !to.meta.roles.includes(authStore.user.role)
  ) {
    return { name: 'MemberList'}
  }

  return true
})

export default router