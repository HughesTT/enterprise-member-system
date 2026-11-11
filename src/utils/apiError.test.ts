import axios from 'axios'
import { getApiErrorMessage } from './apiError'

// 建立模擬 Axios 錯誤
function createAxiosError(status: number) {
  return new axios.AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    {
      data: {},
      status,
      statusText: '',
      headers: {},
      config: { headers: new axios.AxiosHeaders() }
    }
  )
}

// 測試不同 HTTP 狀態碼
const testCases = [
  { status: 400, expected: '請求資料有誤，請確認輸入內容'},
  { status: 401, expected: '登入狀態已失效，請重新登入'},
  { status: 403, expected: '目前帳號沒有權限執行此操作'},
  { status: 404, expected: '找不到指定的資料' },
  { status: 500, expected: '伺服器發生錯誤，請稍後再試'}
]

testCases.forEach(({status, expected}) => {
  const result = getApiErrorMessage(
    createAxiosError(status),
    '預設錯誤訊息'
  )
  console.log(
    `HTTP ${status}:`,
    result === expected ? 'PASS' : 'FAIL'
  )
})

// 測試網路連線失敗（沒有收到伺服器回應）
const networkError = new axios.AxiosError(
  'Network Error',
  'ERR_NETWORK'
)

const networkResult = getApiErrorMessage(
  networkError,
  '預設錯誤訊息'
)

console.log(
  'Network Error:',
  networkResult === '無法連線至伺服器，請檢查網路'
    ? 'PASS'
    : 'FAIL'
)

// 測試非 Axios 錯誤
const normalError = new Error('一般程式錯誤')

const normalResult = getApiErrorMessage(
  normalError,
  '預設錯誤訊息'
)

console.log(
  'Normal Error:',
  normalResult === '預設錯誤訊息'
    ? 'PASS'
    : 'FAIL'
)