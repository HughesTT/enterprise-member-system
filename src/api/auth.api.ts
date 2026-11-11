import type { LoginCredentials, LoginResponse } from '../types/auth'

// 模擬登入 API
export async function login(
  credentials: LoginCredentials
):Promise<LoginResponse> {
  // 暫時用固定帳密模擬驗證
  if (credentials.username === 'admin' && credentials.password === 'admin123') {
    return {
      accessToken: 'mock-admin-token',
      user: {
        id: '1',
        username: 'admin',
        name: '系統管理員',
        role: 'admin'
      }
    }
  }

  if (credentials.username === 'staff' && credentials.password === 'staff123') {
    return {
      accessToken: 'mock-staff-token',
      user: {
        id: '2',
        username: 'staff',
        name: '客服人員',
        role: 'staff'
      }
    }
  }

  throw new Error('帳號或密碼錯誤') // 若帳號密碼不符合任何條件，拋出錯誤
}