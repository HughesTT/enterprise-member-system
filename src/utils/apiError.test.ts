import axios from 'axios'
import { describe, it, expect } from 'vitest'
import { getApiErrorMessage } from './apiError'

// 建立模擬 Axios 錯誤
describe('getApiErrorMessage - HTTP 狀態碼', () => {
  // 測試不同 HTTP 狀態碼
  const testCases = [
    { status: 400, expected: '請求資料有誤，請確認輸入內容'},
    { status: 401, expected: '登入狀態已失效，請重新登入'},
    { status: 403, expected: '目前帳號沒有權限執行此操作'},
    { status: 404, expected: '找不到指定的資料' },
    { status: 500, expected: '伺服器發生錯誤，請稍後再試'}
  ]

  testCases.forEach(({ status, expected }) => 
  it(`HTTP ${status}`, () => {
    const result = getApiErrorMessage(
      createAxiosError(status),
      '預設錯誤訊息'
    )
    expect(result).toBe(expected)
  }))

  // 測試 Network Error
  it('Network Error 應回傳網路錯誤訊息', () => {
    const networkError = new axios.AxiosError(
      'Network Error',
      'ERR_NETWORK'
    )
    const result = getApiErrorMessage(
      networkError,
      '預設錯誤訊息'
    )
    expect(result).toBe('無法連線至伺服器，請檢查網路')
  })

  // 測試一般 JavaScript Error
  it('一般 JavaScript Error 應回應預設錯誤訊息', () => {
    const normalError = new Error('一般程式錯誤')
    const result = getApiErrorMessage(
      normalError,
      '預設錯誤訊息'
    )
    expect(result).toBe('預設錯誤訊息')
  })

  // 測試未列出的 HTTP 狀態碼
  it('未列出的 HTTP 狀態碼應回應預設錯誤訊息', () => {
    const result = getApiErrorMessage(
      createAxiosError(503),
      '預設錯誤訊息'
    )
    expect(result).toBe('預設錯誤訊息')
  })
})

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
      headers: new axios.AxiosHeaders(),
      config: { headers: new axios.AxiosHeaders() }
    }
  )
}