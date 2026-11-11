import { apiClient } from './client'
import axios from 'axios'

// 模擬後端回傳 HTTP 401
export function testUnauthorized() {
  return apiClient.get('/test-401', {
    adapter: async (config) => {
      return Promise.reject(
        new axios.AxiosError(
          'Unauthorized',
          'ERR_BAD_REQUEST',
          config,
          undefined,
          {
            data: { message: 'Token 已失效' },
            status: 401,
            statusText: 'Unauthorized',
            headers: {},
            config
          }
        )
      )
    }
  })
}