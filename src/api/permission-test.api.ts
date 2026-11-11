import { apiClient } from './client'
import axios from 'axios'

// 模擬後端回傳 HTTP 403
export function testForbidden() {
  return apiClient.get('/test-403', {
    adapter: async (config) => {
      return Promise.reject(
        new axios.AxiosError(
          'Forbidden',
          'ERR_BAD_REQUEST',
          config,
          undefined,
          {
            data: { message: '帳號目前沒有操作權限' },
            status: 403,
            statusText: 'Forbidden',
            headers: {},
            config
          }
        )
      )
    }
  })
}