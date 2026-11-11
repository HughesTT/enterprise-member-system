import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser } from '../types/auth' // import type 是 TypeScript 的語法，用來只匯入型別，不會在編譯後的 JavaScript 中產生實際的匯入程式碼
import { login as loginApi } from '../api/auth.api'

// 建立使用者資料驗證函式
function isValidAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) { // 如果不是物件或為 null，則不是有效的 AuthUser
    return false
  }

  const user = value as Record<string, unknown>

  return (
    typeof user.id === 'string' &&
    typeof user.username === 'string' &&
    typeof user.name === 'string' &&
    (user.role === 'admin' || user.role === 'staff')
  )
}

// 認證狀態管理 Pinia Store
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null) // 使用者資訊，若未登入則為 null
  const accessToken = ref<string | null>(null) // 存放存取token，若未登入則為 null
  const isAuthenticated = computed(() => accessToken.value !== null) // 使用computed計算是否已驗證登入狀態
  // isAuthenticated 是計算屬性，不需要在login、logout手動設定

  // 儲存認證資料到本地，加入 localStorage 讓重新整理後能還原登入狀態
  function saveAuthData() {
    if (user.value && accessToken.value) {
      localStorage.setItem('authUser', JSON.stringify(user.value)) // 儲存使用者資訊到 localStorage
      localStorage.setItem('accessToken', accessToken.value) // 儲存存取token到 localStorage
    }
  }

  // 初始化時嘗試從 localStorage 還原認證資料
  function restoreAuthData() {
    const savedUser = localStorage.getItem('authUser')
    const savedToken = localStorage.getItem('accessToken')

    // 只要其中一項不存在，就不還原登入狀態
    if (!savedUser || !savedToken) return

    try {
      const parsedUser: unknown = JSON.parse(savedUser)
      // 確認解析後的資料符合 AuthUser
      if (!isValidAuthUser(parsedUser)) {
        throw new Error('使用者資料格式錯誤')
      }
      user.value = parsedUser // 告訴 TypeScript 這個物件是 AuthUser 型別
      accessToken.value = savedToken // 將儲存的存取token還原
    } catch (error) {
      // 儲存資料格式異常時，清除無效資料防止錯誤
      user.value = null
      accessToken.value = null
      localStorage.removeItem('authUser')
      localStorage.removeItem('accessToken')
    }
  }

  // 登入函式，呼叫 API 並更新使用者資訊與認證狀態
  async function login(username: string, password: string) {
    const result = await loginApi({ username, password })
    user.value = result.user
    accessToken.value = result.accessToken
    saveAuthData() // 登入成功後儲存認證資料到 localStorage
  }

  // 登出函式，清除使用者資訊與認證狀態
  function logout() {
    user.value = null
    accessToken.value = null
    localStorage.removeItem('authUser') // 登出時清除 localStorage 中的使用者資訊
    localStorage.removeItem('accessToken') // 登出時清除 localStorage 中的存取token
  }

  restoreAuthData() // Store 建立時，自動還原登入資料

  return {
    user,
    accessToken,
    isAuthenticated,
    login,
    logout,
    restoreAuthData,
  }
})