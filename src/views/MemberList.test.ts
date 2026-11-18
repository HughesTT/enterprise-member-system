import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, reactive } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import MemberList from './MemberList.vue'
import { useMembers } from '../composables/useMembers'
import { useAuthStore } from '../stores/auth'

// 模擬 useMembers
vi.mock('../composables/useMembers', () => ({
  useMembers: vi.fn()
}))

describe('MemberList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('頁面掛載時，應呼叫 fetchMembers', async () => {
    const fetchMembers = vi.fn()

    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers,
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(false)
    } as ReturnType<typeof useMembers>)

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: MemberList },
        { path: '/login', name: 'Login', component: { template: '<div>Login</div>' } }
      ]
    })

    const wrapper = mount(MemberList, {
      global: {
        plugins: [router]
      }
    })

    await router.isReady()

    expect(fetchMembers).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  // 測試應正確顯示管理員姓名與角色
  it('應正確顯示管理員姓名與角色', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    expect(wrapper.find('.user-info').text()).toContain('系統管理員')

    wrapper.unmount()
  })

  // 測試應正確顯示客服人員姓名與角色
  it('應正確顯示客服人員姓名與角色', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '2',
      username: 'staff',
      name: '客服小明',
      role: 'staff'
    }

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    expect(wrapper.find('.user-info').text()).toContain('客服小明')
    expect(wrapper.find('.user-info').text()).toContain('客服人員')

    wrapper.unmount()
  })

  // 測試 staff 登入時，不應顯示新增會員表單
  it('staff 登入時，不應顯示新增會員表單', () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '2',
      username: 'staff',
      name: '客服小明',
      role: 'staff'
    }

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    expect(wrapper.text()).not.toContain('新增會員')

    wrapper.unmount()
  })

  // 測試 staff 登入時，不應顯示編輯與刪除按鈕
  it('staff 登入時，不應顯示編輯與刪除按鈕', () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '2',
      username: 'staff',
      name: '客服小明',
      role: 'staff'
    }

    vi.mocked(useMembers).mockReturnValue({
      members: ref([
        {
          id: '1',
          name: '王小明',
          email: 'test@example.com',
          status: 1
        }
      ]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(1),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    expect(wrapper.findAll('.button--row')).toHaveLength(0)

    wrapper.unmount()
  })

  // 測試 admin 登入時，應顯示編輯與刪除按鈕
  it('admin 登入時，應顯示編輯與刪除按鈕', () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    expect(wrapper.findAll('.button--row')).toHaveLength(2)

    wrapper.unmount()
  })

  // 測試 admin 點擊編輯時，應顯示帶有會員資料的編輯表單
  it('admin 點擊編輯時，應顯示帶有會員資料的編輯表單', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    await wrapper.find('.button--row').trigger('click')

    expect(wrapper.find('.edit-section').exists()).toBe(true)
    expect(wrapper.find('.edit-section').text()).toContain('編輯會員')

    const inputs = wrapper.find('.edit-section').findAll('input')

    expect((inputs[0].element as HTMLInputElement).value).toBe('王小明')
    expect((inputs[1].element as HTMLInputElement).value).toBe('test@example.com')

    wrapper.unmount()
  })

  // 測試點擊取消編輯時，應關閉編輯表單
  it('點擊取消編輯時，應關閉編輯表單', async () => {
    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    // 開啟編輯表單
    await wrapper.find('.button--row').trigger('click')

    expect(wrapper.find('.edit-section').exists()).toBe(true)

    // 點擊取消
    await wrapper.find('.edit-section button.button--secondary').trigger('click')

    expect(wrapper.find('.edit-section').exists()).toBe(false)

    wrapper.unmount()
  })

  // 測試新增會員成功後，應清空新增表單
  it('新增會員成功後，應清空新增表單', async () => {
    const addMember = vi.fn().mockResolvedValue(true)

    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember,
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    const inputs = wrapper.findAll('.top-row .member-form input')

    await inputs[0].setValue('王小明')
    await inputs[1].setValue('test@example.com')

    await wrapper.find('.top-row form.member-form').trigger('submit')

    expect(addMember).toHaveBeenCalledWith({
      name: '王小明',
      email: 'test@example.com',
      status: 1
    })

    expect((inputs[0].element as HTMLInputElement).value).toBe('')
    expect((inputs[1].element as HTMLInputElement).value).toBe('')

    wrapper.unmount()
  })

  // 測試新增會員失敗時，應保留新增表單內容
  it('新增會員失敗時，應保留新增表單內容', async () => {
    const addMember = vi.fn().mockResolvedValue(false)

    // 沿用上一個測試的 mockReturnValue 設定
    // 但將 addMember 替換成這個 mock

    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      addMember,
      resetSearch: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const authStore = useAuthStore()

    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    const inputs = wrapper.findAll('.top-row .member-form input')

    await inputs[0].setValue('王小明')
    await inputs[1].setValue('test@example.com')

    await wrapper.find('.top-row form.member-form').trigger('submit')

    expect(addMember).toHaveBeenCalledTimes(1)

    expect((inputs[0].element as HTMLInputElement).value).toBe('王小明')
    expect((inputs[1].element as HTMLInputElement).value).toBe('test@example.com')

    wrapper.unmount()
  })

  // 測試編輯會員成功後，應呼叫 editMember 並關閉編輯表單
  it('編輯會員成功後，應呼叫 editMember 並關閉編輯表單', async () => {
    const editMember = vi.fn().mockResolvedValue(false)

    vi.mocked(useMembers).mockReturnValue({
      members: ref([
        {
          id: '1',
          name: '王小明',
          email: 'test@example.com',
          status: 1
        }
      ]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(1),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember,
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const authStore = useAuthStore()
    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    // 開啟編輯表單
    await wrapper.find('.button--row').trigger('click')

    // 修改編輯表單內容
    const inputs = wrapper.findAll('.edit-section .member-form input')
    await inputs[0].setValue('陳小華')
    await inputs[1].setValue('new@example.com')

    // 送出編輯表單
    await wrapper.find('.edit-section form.member-form').trigger('submit')

    expect(editMember).toHaveBeenCalledWith('1', {
      name: '陳小華',
      email: 'new@example.com',
      status: 1
    })

    expect(wrapper.find('.edit-section').exists()).toBe(true)
    expect((inputs[0].element as HTMLInputElement).value).toBe('陳小華')
    expect((inputs[1].element as HTMLInputElement).value).toBe('new@example.com')

    wrapper.unmount()
  })

  //
  it('編輯會員失敗時，應保留編輯表單內容', async () => {
    const editMember = vi.fn().mockResolvedValue(false)

    vi.mocked(useMembers).mockReturnValue({
      members: ref([
        {
          id: '1',
          name: '王小明',
          email: 'test@example.com',
          status: 1
        }
      ]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(1),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember,
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const authStore = useAuthStore()
    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    // 開啟編輯表單
    await wrapper.find('.button--row').trigger('click')

    // 修改編輯表單內容
    const inputs = wrapper.findAll('.edit-section .member-form input')
    await inputs[0].setValue('陳小華')
    await inputs[1].setValue('new@example.com')

    // 送出編輯表單
    await wrapper.find('.edit-section form.member-form').trigger('submit')

    expect(editMember).toHaveBeenCalledWith('1', {
      name: '陳小華',
      email: 'new@example.com',
      status: 1
    })

    expect(wrapper.find('.edit-section').exists()).toBe(true)

    expect((inputs[0].element as HTMLInputElement).value).toBe('陳小華')
    expect((inputs[1].element as HTMLInputElement).value).toBe('new@example.com')
  })

  // 測試取消刪除會員的行為
  it('取消刪除會員時，不應呼叫 removeMember', async () => {
    const removeMember = vi.fn()

    vi.mocked(useMembers).mockReturnValue({
      members: ref([
        {
          id: '1',
          name: '王小明',
          email: 'test@example.com',
          status: 1
        }
      ]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(1),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember,
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const authStore = useAuthStore()
    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    // 模擬使用者取消刪除
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    await wrapper.find('.button--danger').trigger('click')

    expect(confirmSpy).toHaveBeenCalledWith('確定要刪除會員「王小明」嗎？')
    expect(removeMember).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  // 測試確認刪除會員的行為
  it('確認刪除會員時，應呼叫 removeMember', async () => {
    const removeMember = vi.fn().mockResolvedValue(true)

    vi.mocked(useMembers).mockReturnValue({
      members: ref([
        {
          id: '1',
          name: '王小明',
          email: 'test@example.com',
          status: 1
        }
      ]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(1),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember,
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const authStore = useAuthStore()
    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    // 模擬使用者取消刪除
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    await wrapper.find('.button--danger').trigger('click')
    await flushPromises()

    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  // 測試確認刪除會員後，按鈕狀態是否正確恢復
  it('確認刪除會員後，應恢復刪除按鈕狀態', async () => {
    // 控制刪除 API 的完成時機
    let resolveRemove!: (value: boolean) => void

    const removeMember = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveRemove = resolve
        })
    )

    vi.mocked(useMembers).mockReturnValue({
      members: ref([
        {
          id: '1',
          name: '王小明',
          email: 'test@example.com',
          status: 1
        }
      ]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(1),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember,
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    // 設定管理員登入
    const authStore = useAuthStore()
    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    // 模擬使用者確認刪除
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    // 建立頁面
    const wrapper = mount(MemberList, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [
              { path: '/', component: MemberList },
              {
                path: '/login',
                name: 'Login',
                component: { template: '<div>Login</div>' }
              }
            ]
          })
        ]
      }
    })

    // 取得刪除按鈕
    const deleteButton = wrapper.find('.button--danger')

    // 點擊刪除
    await deleteButton.trigger('click')

    // 確認刪除 API 已被呼叫
    expect(confirmSpy).toHaveBeenCalledWith('確定要刪除會員「王小明」嗎？')
    expect(removeMember).toHaveBeenCalledTimes(1)
    expect(removeMember).toHaveBeenCalledWith('1')

    // API 尚未完成時，按鈕應顯示刪除中
    expect(deleteButton.text()).toBe('刪除中...')
    expect((deleteButton.element as HTMLButtonElement).disabled).toBe(true)

    // 模擬刪除 API 成功完成
    resolveRemove(true)
    await flushPromises()

    // API 完成後，按鈕應恢復正常
    expect(deleteButton.text()).toBe('刪除')
    expect((deleteButton.element as HTMLButtonElement).disabled).toBe(false)

    // 清理測試資源
    confirmSpy.mockRestore()
    wrapper.unmount()
  })

  //
  it('點擊登出時，應清除登入狀態並導向登入頁', async () => {
    // 建立 useMembers mock
    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const authStore = useAuthStore()
    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const logoutSpy = vi.spyOn(authStore, 'logout')

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: MemberList },
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login</div>' }
        }
      ]
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(MemberList, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.find('.button--secondary').trigger('click')

    // 等待登出與 Router 導向完成
    await flushPromises()

    expect(logoutSpy).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.name).toBe('Login')

    wrapper.unmount()
  })

  // 測試搜尋功能的 debounce 行為
  it('輸入搜尋關鍵字後，應在 500ms debounce 時間到才呼叫 searchMembers', async () => {
    vi.useFakeTimers()

    const searchMembers = vi.fn()

    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers,
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const authStore = useAuthStore()
    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: MemberList },
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login</div>' }
        }
      ]
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(MemberList, {
      global: {
        plugins: [router]
      }
    })

    // 輸入搜尋關鍵字
    const searchInput = wrapper.find('.search-panel input')
    await searchInput.setValue('王小明')

    // 499ms 時不應呼叫搜尋
    vi.advanceTimersByTime(499)
    expect(searchMembers).not.toHaveBeenCalled()

    // 再經過 1ms，應呼叫搜尋
    vi.advanceTimersByTime(1)
    expect(searchMembers).toHaveBeenCalledTimes(1)

    wrapper.unmount()
    vi.useRealTimers()
  })

  // 測試連續輸入時，debounce 會重新計時
  it('測試連續輸入時會重新計時', async () => {
    vi.useFakeTimers()

    const searchMembers = vi.fn()

    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers,
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const authStore = useAuthStore()
    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: MemberList },
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login</div>' }
        }
      ]
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(MemberList, {
      global: {
        plugins: [router]
      }
    })

    // 輸入搜尋關鍵字
    const searchInput = wrapper.find('.search-panel input')

    // 第一次輸入
    await searchInput.setValue('王')
    vi.advanceTimersByTime(300)

    expect(searchMembers).not.toHaveBeenCalled()

    // 第二次輸入，重新計時
    await searchInput.setValue('王小明')

    vi.advanceTimersByTime(499)
    expect(searchMembers).not.toHaveBeenCalled()

    // 再經過 1ms
    vi.advanceTimersByTime(1)
    expect(searchMembers).toHaveBeenCalledTimes(1)

    wrapper.unmount()
    vi.useRealTimers()
  })

  // 測試卸載時，debounce timer 是否被清除
  it('測試卸載時清除 debounce timer', async () => {
    vi.useFakeTimers()

    const searchMembers = vi.fn()

    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(1),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers,
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const authStore = useAuthStore()
    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: MemberList },
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login</div>' }
        }
      ]
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(MemberList, {
      global: {
        plugins: [router]
      }
    })

    // 輸入搜尋關鍵字
    const searchInput = wrapper.find('.search-panel input')
    await searchInput.setValue('王小明')

    // 先經過 300ms，確認尚未執行搜尋
    vi.advanceTimersByTime(300)
    expect(searchMembers).not.toHaveBeenCalled()

    // 卸載元件
    wrapper.unmount()

    // 再經過 500ms
    vi.advanceTimersByTime(500)

    // 確認卸載後沒有執行搜尋
    expect(searchMembers).not.toHaveBeenCalled()

    vi.useRealTimers()
  })

  // 測試下一頁功能
  it('測試下一頁功能', async () => {

    const nextPage = vi.fn()

    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(3),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: nextPage,
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const authStore = useAuthStore()
    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: MemberList },
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login</div>' }
        }
      ]
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(MemberList, {
      global: {
        plugins: [router]
      }
    })

    // 點擊下一頁
    const nextButton = wrapper.findAll('.pagination button')[1]
    await nextButton.trigger('click')

    // 確認 nextPage 被呼叫一次
    expect((nextButton.element as HTMLButtonElement).disabled).toBe(false)
    nextPage.mockClear()
    await nextButton.trigger('click')
    expect(nextPage).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  // 測試上一頁功能
  it('測試上一頁功能', async () => {

    const prevPage = vi.fn()

    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(3),
      searchParams: reactive({
        page: 2,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: prevPage,
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const authStore = useAuthStore()
    authStore.user = {
      id: '1',
      username: 'admin',
      name: '系統管理員',
      role: 'admin'
    }

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: MemberList },
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login</div>' }
        }
      ]
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(MemberList, {
      global: {
        plugins: [router]
      }
    })

    // 點擊上一頁
    const prevButton = wrapper.findAll('.pagination button')[0]
    await prevButton.trigger('click')

    // 確認 prevPage 被呼叫一次
    expect((prevButton.element as HTMLButtonElement).disabled).toBe(false)
    prevPage.mockClear()
    await prevButton.trigger('click')
    expect(prevPage).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  // 測試沒有會員資料時，應顯示目前尚無會員資料
  it('測試沒有會員資料時，應顯示目前尚無會員資料', async () => {

    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(0),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: MemberList },
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login</div>' }
        }
      ]
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(MemberList, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('目前尚無會員資料')
    wrapper.unmount()
  })

  // 測試搜尋不到符合條件的會員時，應顯示找不到符合條件的會員
  it('測試搜尋不到符合條件的會員時，應顯示找不到符合條件的會員', async () => {
    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(0),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: 'nonexistent',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: MemberList },
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login</div>' }
        }
      ]
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(MemberList, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('找不到符合條件的會員')
    wrapper.unmount()
  })

  // 測試載入中，應顯示載入提示
  it('測試載入中，應顯示載入提示', async () => {
    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(true),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(0),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(false)
    } as ReturnType<typeof useMembers>)

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: MemberList },
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login</div>' }
        }
      ]
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(MemberList, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('讀取中...')
    wrapper.unmount()
  })

  // 測試新增錯誤訊息顯示測試
  it('測試新增錯誤訊息顯示測試', async () => {
    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref('取得會員資料失敗'),
      totalItems: ref(0),
      totalPages: ref(0),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref(''),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: MemberList },
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login</div>' }
        }
      ]
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(MemberList, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('取得會員資料失敗')
    wrapper.unmount()
  })

  // 測試成功訊息顯示測試
  it('測試成功訊息顯示測試', async () => {
    vi.mocked(useMembers).mockReturnValue({
      members: ref([]),
      loading: ref(false),
      error: ref(''),
      totalItems: ref(0),
      totalPages: ref(0),
      searchParams: reactive({
        page: 1,
        pageSize: 10,
        keyword: '',
        status: null
      }),
      fetchMembers: vi.fn(),
      searchMembers: vi.fn(),
      successMessage: ref('新增會員成功'),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      resetSearch: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      editMember: vi.fn(),
      submitting: ref(false),
      hasLoaded: ref(true)
    } as ReturnType<typeof useMembers>)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: MemberList },
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login</div>' }
        }
      ]
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(MemberList, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('新增會員成功')
    wrapper.unmount()
  })
})