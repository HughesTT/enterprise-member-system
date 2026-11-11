import axios from 'axios'
import pinia from '../stores'
import { useAuthStore } from '../stores/auth'

// 創建一個 axios 實例 (ApiInstance)，並設置基礎 URL
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 設置請求攔截器，將 token 添加到每個請求的 headers
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore(pinia)

  const token = authStore.accessToken
  if(token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 設置請求攔截器，將 token 添加到請求
apiClient.interceptors.response.use(
  response => {
    // API 請求成功，直接回傳 response
    return response
  },
  async (error) => {
    // HTTP 401: 登入狀態失效或 Token 無效
    if (error.response?.status === 401) {
      const authStore = useAuthStore(pinia)

      // 清除登入狀態與 localStorage
      authStore.logout()

      // 動態載入 Router，避免初始化時形成循環依賴
      const { default: router } = await import('../router')

      // 導向登入頁面
      await router.push({ name: 'Login' })
    }

    // 將錯誤繼續傳給 API 呼叫端
    return Promise.reject(error)
  }
)


export default apiClient