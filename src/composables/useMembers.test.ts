import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useMembers } from './useMembers'
import { getMembers, createMember, updateMember, deleteMember } from '../api/members.api'
import { useAuthStore } from '../stores/auth'

vi.mock('../api/members.api', () => ({
  getMembers: vi.fn(),
  createMember: vi.fn(),
  deleteMember: vi.fn(),
  updateMember: vi.fn()
}))

describe('useMembers', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初始狀態應正確', () => {
    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    expect(membersStore).toBeDefined()
    expect(membersStore.members.value).toEqual([])
    expect(membersStore.loading.value).toBe(false)
    expect(membersStore.error.value).toBe('')
    expect(membersStore.hasLoaded.value).toBe(false)
    expect(membersStore.totalItems.value).toBe(0)
    expect(membersStore.totalPages.value).toBe(1)
    expect(membersStore.searchParams.page).toBe(1)
    expect(membersStore.searchParams.pageSize).toBe(5)

    wrapper.unmount()
  })

  // 測試成功取得會員資料後，應更新列表與分頁資訊
  it('成功取得會員資料後，應更新列表與分頁資訊', async () => {
    const mockMembers = [
      {
        id: '1',
        name: '王小明',
        email: 'ming@example.com',
        status: 1 as const
      }
    ]

    vi.mocked(getMembers).mockResolvedValue({
      list: mockMembers,
      total: 1,
      totalPages: 1
    })

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    await membersStore.fetchMembers()

    expect(membersStore.members.value).toEqual(mockMembers)
    expect(membersStore.totalItems.value).toBe(1)
    expect(membersStore.totalPages.value).toBe(1)
    expect(membersStore.hasLoaded.value).toBe(true)
    expect(membersStore.loading.value).toBe(false)

    wrapper.unmount()
  })

  // 測試取得會員資料失敗時，應顯示錯誤訊息
  it('取得會員資料失敗時，應顯示錯誤訊息', async () => {
    vi.mocked(getMembers).mockRejectedValue({
      isAxiosError: true,
      message: 'Network Error',
      code: 'NETWORK_ERROR'
    })

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const result = await membersStore.fetchMembers()

    expect(result).toBe('error')
    expect(membersStore.error.value).toBe('無法連線至伺服器，請檢查網路')
    expect(membersStore.loading.value).toBe(false)
    expect(membersStore.hasLoaded.value).toBe(false)

    wrapper.unmount()
  })

  // 測試搜尋會員時，應重設頁碼並重新取得資料
  it('搜尋會員時，應重設頁碼並重新取得資料', async () => {
    vi.mocked(getMembers).mockResolvedValue({
      list: [],
      total: 0,
      totalPages: 1
    })

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    membersStore.searchParams.page = 3

    await membersStore.searchMembers()

    expect(membersStore.searchParams.page).toBe(1)
    expect(getMembers).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  // 測試下一頁功能，應增加頁碼並重新取得資料
  it('下一頁應增加頁碼並重新取得資料', async () => {
    vi.mocked(getMembers).mockResolvedValue({
      list: [],
      total: 10,
      totalPages: 2
    })

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    await membersStore.fetchMembers()

    vi.mocked(getMembers).mockClear()

    await membersStore.nextPage()

    expect(membersStore.searchParams.page).toBe(2)
    expect(getMembers).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  // 測試已經在最後一頁時，不應再次呼叫 API
  it('已經在最後一頁時，不應再次呼叫 API', async () => {
    vi.mocked(getMembers).mockResolvedValue({
      list: [],
      total: 10,
      totalPages: 2
    })

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    await membersStore.fetchMembers()

    membersStore.searchParams.page = 2
    vi.mocked(getMembers).mockClear()

    await membersStore.nextPage()

    expect(membersStore.searchParams.page).toBe(2)
    expect(getMembers).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  // 測試上一頁功能，應減少頁碼並重新取得資料
  it('上一頁應減少頁碼並重新取得資料', async () => {
    vi.mocked(getMembers).mockResolvedValue({
      list: [],
      total: 10,
      totalPages: 3
    })

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    membersStore.searchParams.page = 2

    await membersStore.prevPage()

    expect(membersStore.searchParams.page).toBe(1)
    expect(getMembers).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  // 測試已經在第一頁時，不應再次呼叫 API
  it('已經在第一頁時，不應再次呼叫 API', async () => {
    vi.mocked(getMembers).mockResolvedValue({
      list: [],
      total: 10,
      totalPages: 3
    })

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    membersStore.searchParams.page = 1

    await membersStore.prevPage()

    expect(membersStore.searchParams.page).toBe(1)
    expect(getMembers).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  // 測試重設搜尋條件功能
  it('重設搜尋條件時，應還原參數並重新取得資料', async () => {
    vi.mocked(getMembers).mockResolvedValue({
      list: [],
      total: 0,
      totalPages: 1
    })

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    membersStore.searchParams.page = 3
    membersStore.searchParams.pageSize = 10
    membersStore.searchParams.keyword = '王小明'
    membersStore.searchParams.status = 0

    await membersStore.resetSearch()

    expect(membersStore.searchParams.page).toBe(1)
    expect(membersStore.searchParams.pageSize).toBe(5)
    expect(membersStore.searchParams.keyword).toBe('')
    expect(membersStore.searchParams.status).toBe(null)
    expect(getMembers).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  // 測試環境可以設定管理員身分
  it('測試環境可以設定管理員身分', () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    expect(authStore.user?.role).toBe('admin')
  })

  // 測試管理員新增會員成功後，應重新取得列表並顯示成功訊息
  it('管理員新增會員成功後，應重新取得列表並顯示成功訊息', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const newMember = {
      name: '王小明',
      email: 'ming@example.com',
      status: 1 as const
    }

    vi.mocked(createMember).mockResolvedValue({
      id: '10',
      ...newMember
    })

    vi.mocked(getMembers).mockResolvedValue({
      list: [{ id: '10', ...newMember }],
      total: 1,
      totalPages: 1
    })

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const result = await membersStore.addMember(newMember)

    expect(result).toBe(true)
    expect(createMember).toHaveBeenCalledWith(newMember)
    expect(getMembers).toHaveBeenCalledTimes(1)
    expect(membersStore.members.value).toEqual([
      { id: '10', ...newMember }
    ])
    expect(membersStore.successMessage.value).toBe('新增會員成功')
    expect(membersStore.submitting.value).toBe(false)

    wrapper.unmount()
  })

  // 測試新增會員失敗時，應顯示錯誤訊息
  it('新增會員失敗時，應顯示錯誤訊息', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const newMember = {
      name: '王小明',
      email: 'ming@example.com',
      status: 1 as const
    }

    vi.mocked(createMember).mockRejectedValue(
      new Error('新增失敗')
    )

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const result = await membersStore.addMember(newMember)

    expect(result).toBe(false)
    expect(membersStore.error.value).toBe('新增會員失敗')
    expect(membersStore.successMessage.value).toBe('')
    expect(membersStore.submitting.value).toBe(false)
    expect(getMembers).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  // 測試 staff 帳號無法新增會員
  it('staff 不應有權限新增會員', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '2',
      username: 'staff',
      name: '一般員工',
      role: 'staff'
    }

    const newMember = {
      name: '王小明',
      email: 'ming@example.com',
      status: 1 as const
    }

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const result = await membersStore.addMember(newMember)

    expect(result).toBe(false)
    expect(membersStore.error.value).toBe('目前帳號沒有權限執行此操作')
    expect(createMember).not.toHaveBeenCalled()
    expect(getMembers).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  // 測試管理員編輯會員成功後，應重新取得列表並顯示成功訊息
  it('管理員編輯會員成功後，應重新取得列表並顯示成功訊息', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const updateData = {
      name: '王小明修改',
      email: 'ming-new@example.com'
    }

    vi.mocked(getMembers).mockResolvedValue({
      list: [],
      total: 0,
      totalPages: 1
    })

    vi.mocked(updateMember).mockResolvedValue({
      id: '10',
      name: updateData.name,
      email: updateData.email,
      status: 1
    })

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const result = await membersStore.editMember('10', updateData)

    expect(result).toBe(true)
    expect(updateMember).toHaveBeenCalledWith('10', updateData)
    expect(getMembers).toHaveBeenCalledTimes(1)
    expect(membersStore.successMessage.value).toBe('更新會員成功')
    expect(membersStore.submitting.value).toBe(false)

    wrapper.unmount()
  })

  // 測試編輯會員失敗時，應顯示錯誤訊息
  it('編輯會員失敗時，應顯示錯誤訊息', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const updateData = {
      name: '王小明修改',
      email: 'ming-new@example.com'
    }

    vi.mocked(updateMember).mockRejectedValue(
      new Error('編輯失敗')
    )

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const result = await membersStore.editMember('10', updateData)

    expect(result).toBe(false)
    expect(updateMember).toHaveBeenCalledWith('10', updateData)
    expect(membersStore.error.value).toBe('更新會員失敗')
    expect(membersStore.successMessage.value).toBe('')
    expect(membersStore.submitting.value).toBe(false)
    expect(getMembers).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  // 測試 staff 不應有權限編輯會員
  it('staff 不應有權限編輯會員', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '2',
      username: 'staff',
      name: '一般員工',
      role: 'staff'
    }

    const updateData = {
      name: '王小明修改',
      email: 'ming-new@example.com'
    }

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const result = await membersStore.editMember('10', updateData)

    expect(result).toBe(false)
    expect(membersStore.error.value).toBe('目前帳號沒有權限執行此操作')
    expect(updateMember).not.toHaveBeenCalled()
    expect(getMembers).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  // 測試管理員刪除會員成功後，應重新取得列表並顯示成功訊息
  it('管理員刪除會員成功後，應重新取得列表並顯示成功訊息', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    vi.mocked(deleteMember).mockResolvedValue(undefined)

    vi.mocked(getMembers).mockResolvedValue({
      list: [],
      total: 0,
      totalPages: 1
    })

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const result = await membersStore.removeMember('10')

    expect(result).toBe(true)
    expect(deleteMember).toHaveBeenCalledWith('10')
    expect(getMembers).toHaveBeenCalledTimes(1)
    expect(membersStore.successMessage.value).toBe('會員刪除成功')
    expect(membersStore.submitting.value).toBe(false)

    wrapper.unmount()
  })

  // 測試刪除會員失敗時，應顯示錯誤訊息
  it('刪除會員失敗時，應顯示錯誤訊息', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    vi.mocked(deleteMember).mockRejectedValue(
      new Error('刪除失敗')
    )

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const result = await membersStore.removeMember('10')

    expect(result).toBe(false)
    expect(deleteMember).toHaveBeenCalledWith('10')
    expect(membersStore.error.value).toBe('刪除會員失敗')
    expect(membersStore.successMessage.value).toBe('')
    expect(membersStore.submitting.value).toBe(false)
    expect(getMembers).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  // 測試 staff 嘗試刪除會員時，應顯示權限不足的錯誤訊息
  it('staff 不應有權限刪除會員', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '2',
      username: 'staff',
      name: '一般員工',
      role: 'staff'
    }

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const result = await membersStore.removeMember('10')

    expect(result).toBe(false)
    expect(membersStore.error.value).toBe('目前帳號沒有權限執行此操作')
    expect(deleteMember).not.toHaveBeenCalled()
    expect(getMembers).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  //
  it('刪除最後一頁最後一筆會員後，應自動退回前一頁', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    vi.mocked(deleteMember).mockResolvedValue(undefined)

    vi.mocked(getMembers)
      .mockResolvedValueOnce({
        list: [],
        total: 10,
        totalPages: 2
      })
      .mockResolvedValueOnce({
        list: [],
        total: 10,
        totalPages: 2
      })

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    membersStore.searchParams.page = 3

    const result = await membersStore.removeMember('10')

    expect(result).toBe(true)
    expect(deleteMember).toHaveBeenCalledWith('10')
    expect(getMembers).toHaveBeenCalledTimes(2)
    expect(membersStore.searchParams.page).toBe(2)
    expect(membersStore.successMessage.value).toBe('會員刪除成功')

    wrapper.unmount()
  })

  // 測試刪除成功但列表更新失敗的情況
  it('刪除成功但列表更新失敗時，應保留刪除成功結果並顯示提示', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    vi.mocked(deleteMember).mockResolvedValue(undefined)

    vi.mocked(getMembers).mockRejectedValue(
      new Error('讀取失敗')
    )

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const result = await membersStore.removeMember('10')

    expect(result).toBe(true)
    expect(deleteMember).toHaveBeenCalledWith('10')
    expect(getMembers).toHaveBeenCalledTimes(1)
    expect(membersStore.successMessage.value).toBe(
      '會員刪除成功，但列表更新失敗'
    )
    expect(membersStore.submitting.value).toBe(false)

    wrapper.unmount()
  })

  // 測試新增會員時，尚未完成前不允許重複提交
  it('新增會員尚未完成時，不應允許重複提交', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const newMember = {
      name: '王小明',
      email: 'ming@example.com',
      status: 1 as const
    }

    let resolveCreate!: (value: {
      id: string
      name: string
      email: string
      status: 1
    }) => void

    vi.mocked(createMember).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve
        })
    )

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const firstRequest = membersStore.addMember(newMember)

    const secondResult = await membersStore.addMember(newMember)

    expect(secondResult).toBe(false)
    expect(createMember).toHaveBeenCalledTimes(1)
    expect(membersStore.submitting.value).toBe(true)

    resolveCreate({
      id: '10',
      ...newMember
    })

    vi.mocked(getMembers).mockResolvedValue({
      list: [{ id: '10', ...newMember }],
      total: 1,
      totalPages: 1
    })

    const firstResult = await firstRequest

    expect(firstResult).toBe(true)
    expect(createMember).toHaveBeenCalledTimes(1)
    expect(membersStore.submitting.value).toBe(false)

    wrapper.unmount()
  })

  // 測試編輯會員時，尚未完成前不允許重複提交
  it('編輯會員尚未完成時，不應允許重複提交', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const updateData = {
      name: '王小明修改',
      email: 'ming-new@example.com'
    }

    let resolveUpdate!: (value: {
      id: string
      name: string
      email: string
      status: 1
    }) => void

    vi.mocked(updateMember).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve
        })
    )

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const firstRequest = membersStore.editMember('10', updateData)

    const secondResult = await membersStore.editMember('10', updateData)

    expect(secondResult).toBe(false)
    expect(updateMember).toHaveBeenCalledTimes(1)
    expect(membersStore.submitting.value).toBe(true)

    resolveUpdate({
      id: '10',
      ...updateData,
      status: 1
    })

    vi.mocked(getMembers).mockResolvedValue({
      list: [],
      total: 0,
      totalPages: 1
    })

    const firstResult = await firstRequest

    expect(firstResult).toBe(true)
    expect(updateMember).toHaveBeenCalledTimes(1)
    expect(membersStore.submitting.value).toBe(false)

    wrapper.unmount()
  })

  // 測試刪除會員時，尚未完成前不允許重複提交
  it('刪除會員尚未完成時，不應允許重複提交', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    let resolveDelete!: () => void

    vi.mocked(deleteMember).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDelete = resolve
        })
    )

    let membersStore!: ReturnType<typeof useMembers>

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    const firstRequest = membersStore.removeMember('10')

    const secondResult = await membersStore.removeMember('10')

    expect(secondResult).toBe(false)
    expect(deleteMember).toHaveBeenCalledTimes(1)
    expect(membersStore.submitting.value).toBe(true)

    resolveDelete()

    vi.mocked(getMembers).mockResolvedValue({
      list: [],
      total: 0,
      totalPages: 1
    })

    const firstResult = await firstRequest

    expect(firstResult).toBe(true)
    expect(deleteMember).toHaveBeenCalledTimes(1)
    expect(membersStore.submitting.value).toBe(false)

    wrapper.unmount()
  })

  // 測試元件卸載時，應取消尚未完成的 API 請求
  it('元件卸載時，應取消尚未完成的 API 請求', async () => {
    let membersStore!: ReturnType<typeof useMembers>
    let requestSignal: AbortSignal | undefined

    // 模擬一個尚未完成的 API 請求
    vi.mocked(getMembers).mockImplementation((_params, signal) => {
      requestSignal = signal

      return new Promise((_, reject) => {
        signal?.addEventListener(
          'abort',
          () => reject({ __CANCEL__: true }),
          { once: true }
        )
      })
    })

    const wrapper = mount(
      defineComponent({
        setup() {
          membersStore = useMembers()
          return () => null
        }
      })
    )

    // 發出請求，但暫時不讓它完成
    const request = membersStore.fetchMembers()

    // 確認請求一開始尚未被取消
    expect(requestSignal?.aborted).toBe(false)

    // 模擬使用者離開頁面
    wrapper.unmount()

    // 確認元件卸載後，請求已被取消
    expect(requestSignal?.aborted).toBe(true)

    // 確認取消請求不會被當成一般錯誤
    await expect(request).resolves.toBe('cancelled')
  })
})