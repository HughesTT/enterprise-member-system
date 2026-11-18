import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login as loginApi } from '../api/auth.api'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './auth'

vi.mock('../api/auth.api', () => ({
  login: vi.fn()
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('初始狀態應為未登入', () => {
    const authStore = useAuthStore()

    expect(authStore.user).toBe(null)
    expect(authStore.accessToken).toBe(null)
    expect(authStore.isAuthenticated).toBe(false)
  })

  // 測試登入功能
  it('登入成功應更新認證狀態並儲存資料', async () => {
    const authStore = useAuthStore()

    vi.mocked(loginApi).mockResolvedValue({
      accessToken: 'mock-admin-token',
      user: {
        id: '1',
        username: 'admin',
        name: '系統管理員',
        role: 'admin'
      }
    })

    await authStore.login('admin', 'admin123')

    expect(authStore.user).toEqual({
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    })

    expect(authStore.accessToken).toBe('mock-admin-token')
    expect(authStore.isAuthenticated).toBe(true)

    expect(localStorage.getItem('authUser')).toBe(
      JSON.stringify({
        id: '1',
        username: 'admin',
        name: '系統管理員',
        role: 'admin'
      })
    )

    expect(localStorage.getItem('accessToken')).toBe('mock-admin-token')
  })

  // 測試登入失敗功能
  it('登入失敗應維持未登入狀態', async () => {
    const authStore = useAuthStore()

    vi.mocked(loginApi).mockRejectedValue(
      new Error('帳號或密碼錯誤')
    )

    await expect(
      authStore.login('admin', 'wrong-password')
    ).rejects.toThrow('帳號或密碼錯誤')

    expect(authStore.user).toBe(null)
    expect(authStore.accessToken).toBe(null)
    expect(authStore.isAuthenticated).toBe(false)

    expect(localStorage.getItem('authUser')).toBe(null)
    expect(localStorage.getItem('accessToken')).toBe(null)
  })

  // 測試登出功能
  it('登出後應清除認證狀態與 localStorage', async () => {
    const authStore = useAuthStore()

    // 先模擬已登入狀態
    vi.mocked(loginApi).mockResolvedValue({
      accessToken: 'mock-admin-token',
      user: {
        id: '1',
        username: 'admin',
        name: '系統管理員',
        role: 'admin'
      }
    })

    await authStore.login('admin', 'admin123')

    // 執行登出
    authStore.logout()

    expect(authStore.user).toBe(null)
    expect(authStore.accessToken).toBe(null)
    expect(authStore.isAuthenticated).toBe(false)

    expect(localStorage.getItem('authUser')).toBe(null)
    expect(localStorage.getItem('accessToken')).toBe(null)
  })

  // 測試從 localStorage 還原登入狀態功能
    it('應從 localStorage 還原登入狀態', () => {
    const savedUser = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    localStorage.setItem('authUser', JSON.stringify(savedUser))
    localStorage.setItem('accessToken', 'mock-admin-token')

    const authStore = useAuthStore()

    expect(authStore.user).toEqual(savedUser)
    expect(authStore.accessToken).toBe('mock-admin-token')
    expect(authStore.isAuthenticated).toBe(true)
  })

  // 測試使用者資料格式錯誤時的處理
  it('使用者資料格式錯誤時應清除無效認證資料', () => {
    localStorage.setItem('authUser', JSON.stringify({
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'superadmin'
    }))

    localStorage.setItem('accessToken', 'mock-admin-token')

    const authStore = useAuthStore()

    expect(authStore.user).toBe(null)
    expect(authStore.accessToken).toBe(null)
    expect(authStore.isAuthenticated).toBe(false)

    expect(localStorage.getItem('authUser')).toBe(null)
    expect(localStorage.getItem('accessToken')).toBe(null)
  })

  // 測試使用者資料不是合法 JSON 時的處理
  it('使用者資料不是合法 JSON 時應清除無效認證資料', () => {
    localStorage.setItem('authUser', '{ invalid json }')
    localStorage.setItem('accessToken', 'mock-admin-token')

    const authStore = useAuthStore()

    expect(authStore.user).toBe(null)
    expect(authStore.accessToken).toBe(null)
    expect(authStore.isAuthenticated).toBe(false)

    expect(localStorage.getItem('authUser')).toBe(null)
    expect(localStorage.getItem('accessToken')).toBe(null)
  })

  // 測試缺少 accessToken 時的處理
  it('缺少 accessToken 時不應還原登入狀態', () => {
    const savedUser = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    localStorage.setItem('authUser', JSON.stringify(savedUser))

    const authStore = useAuthStore()

    expect(authStore.user).toBe(null)
    expect(authStore.accessToken).toBe(null)
    expect(authStore.isAuthenticated).toBe(false)

    // 缺少 Token 時，不應還原使用者資料
    expect(localStorage.getItem('authUser')).toBe(JSON.stringify(savedUser))
  })

  // 測試缺少 authUser 時的處理
  it('缺少 authUser 時不應還原登入狀態', () => {
    localStorage.setItem('accessToken', 'mock-admin-token')

    const authStore = useAuthStore()

    expect(authStore.user).toBe(null)
    expect(authStore.accessToken).toBe(null)
    expect(authStore.isAuthenticated).toBe(false)

    // 缺少使用者資料時，原本的 Token 仍保留
    expect(localStorage.getItem('accessToken')).toBe('mock-admin-token')
  })

  // 測試再次呼叫 restoreAuthData 的行為
  it('再次呼叫 restoreAuthData 應能還原登入狀態', () => {
    // 先建立未登入的 Store
    const authStore = useAuthStore()

    expect(authStore.isAuthenticated).toBe(false)

    // 模擬 localStorage 後來取得有效登入資料
    const savedUser = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    localStorage.setItem('authUser', JSON.stringify(savedUser))
    localStorage.setItem('accessToken', 'mock-admin-token')

    // 再次執行還原
    authStore.restoreAuthData()

    expect(authStore.user).toEqual(savedUser)
    expect(authStore.accessToken).toBe('mock-admin-token')
    expect(authStore.isAuthenticated).toBe(true)
  })
})