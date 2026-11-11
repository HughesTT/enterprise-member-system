import axios from 'axios'

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  // 確認是否為 Axios 錯誤
  if (!axios.isAxiosError(error)) {
    return fallbackMessage
  }

  const status = error.response?.status
  switch (status) {
    case 400:
      return '請求資料有誤，請確認輸入內容'
    case 401:
      return '登入狀態已失效，請重新登入'
    case 403:
      return '目前帳號沒有權限執行此操作'
    case 404:
      return '找不到指定的資料'
    case 500:
      return '伺服器發生錯誤，請稍後再試'
    
    default:
      // 沒有收到伺服器回應
      if (!error.response) {
        return '無法連線至伺服器，請檢查網路'
      }
      return fallbackMessage
  }
}