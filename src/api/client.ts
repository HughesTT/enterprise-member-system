import axios from 'axios'

// 創建一個 axios 實例 (ApiInstance)，並設置基礎 URL
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000'
})
// 設置響應攔截器(ApiInterceptor)，統一處理 API 錯誤
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // const status = error.response?.status
    console.log('API error:', error)

    // if (status === 401) {
    //   // 處理 401 錯誤，例如跳轉到登錄頁面
    // }
    // if (status === 403) {
    //   // 可以處理 403 錯誤，例如顯示權限不足的提示
    // }
    // if (status === 404) {
    //   // 可以處理 404 錯誤，例如顯示資源未找到的提示
    // }
    // if (status === 500) {
    //   // 可以處理 500 錯誤，例如顯示服務器錯誤的提示
    // }

    return Promise.reject(error) // 已處理過的error，繼續向上拋出，讓其他 API 可以處理
  }
)