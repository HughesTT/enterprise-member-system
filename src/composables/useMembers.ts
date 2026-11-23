import { ref, reactive, computed, onUnmounted } from 'vue'
import axios from 'axios'
import { createMember, getMembers, deleteMember, updateMember } from '../api/members.api'
import type { Member, MemberSearchParams, CreateMember, UpdateMember } from '../types/member'
import { useAuthStore } from '../stores/auth'
import { getApiErrorMessage } from '../utils/apiError'

export function useMembers() {
  const authStore = useAuthStore()
  const canManageMembers = computed( // 判斷目前帳號是否有管理會員的權限
    () => authStore.user?.role === 'admin'
  )
  const members = ref<Member[]>([])
  const hasLoaded = ref(false) // 是否已經載入過會員資料
  const loading = ref(false)
  const error = ref('')
  const submitting = ref(false)
  
  const totalItems = ref(0)
  const totalPages = ref(1)
  const DEFAULT_PAGE_SIZE = 5 // 先定義每頁顯示的比數，方便未來維護

  const searchParams = reactive<MemberSearchParams>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    keyword: '',
    status: null
  })
  const successMessage = ref('')

  // 紀錄目前正在執行的請求
  let activeController: AbortController | null = null

  // 元件移除時，取消尚未完成的 API 請求
  onUnmounted(() => {
    activeController?.abort()
  })

  type FetchResult = 'success' | 'error' | 'cancelled'

  // 讀取會員資料
  async function fetchMembers(): Promise<FetchResult> {
    // 取消前一個尚未完成的請求
    activeController?.abort()

    // 建立新的取消控制器
    const controller = new AbortController()
    activeController = controller

    loading.value = true
    error.value = ''

    try {
      const response = await getMembers(searchParams, controller.signal)

      // 只有最新的請求可以更新畫面
      if (activeController !== controller) return 'cancelled'

      members.value = response.list
      totalItems.value = response.total
      totalPages.value = response.totalPages
      hasLoaded.value = true
      return 'success'
    } catch (err) {
      if (axios.isCancel(err)) return 'cancelled'  // 被取消的請求不應顯示錯誤
      // 如果不是最新的請求，不處理錯誤
      if (activeController !== controller) return 'cancelled'
      error.value = getApiErrorMessage(
        err,
        '讀取會員資料失敗'
      )

      return 'error'
    } finally {
      // 避免舊請求結束時，將新請求的 loading 關閉
      if (activeController === controller) { // 只有最新的請求控制器等於目前的控制器才關閉 loading
        loading.value = false
        activeController = null
      }
    }
  }

  // 新增會員
  async function addMember(data: CreateMember): Promise<boolean> {
    if (!canManageMembers.value) {
      error.value = '目前帳號沒有權限執行此操作'
      return false
    }
    if (submitting.value) {
      return false
    }
    submitting.value = true
    error.value = ''
    successMessage.value = ''
    try {
      await createMember(data)

      const fetchResult = await fetchMembers() // 重新抓取會員列表，確保畫面更新
      if (fetchResult === 'error') {
        successMessage.value = '會員新增成功，但列表更新失敗'
      } else {
        successMessage.value = '新增會員成功'
      }
      return true
    } catch (err) {
      error.value = getApiErrorMessage(
        err,
        '新增會員失敗'
      )
      return false
    } finally {
      submitting.value = false
    }
  }

  // 刪除會員
  async function removeMember(id: string): Promise<boolean> {
    if (!canManageMembers.value) {
      error.value = '目前帳號沒有權限執行此操作'
      return false
    }
    if (submitting.value) {
      return false
    }
    submitting.value = true
    error.value = ''
    successMessage.value = ''
    try {
      await deleteMember(id)
      const fetchResult = await fetchMembers()

      if (fetchResult === 'error') {
        successMessage.value = '會員刪除成功，但列表更新失敗'
        return true
      }

      if (fetchResult === 'cancelled') {
        successMessage.value = '會員刪除成功'
        return true
      }

      // 如果刪除後當前頁超過總頁數，調整頁碼並重新讀取
      if (searchParams.page > totalPages.value) {
        searchParams.page = totalPages.value
        const pageFetchResult = await fetchMembers() // 與前一個fetchResult做區分
        if (pageFetchResult === 'error') {
          successMessage.value = '會員刪除成功，但列表更新失敗'
          return true
        }

        if (pageFetchResult === 'cancelled') {
          successMessage.value = '會員刪除成功'
          return true
        }
      }
      successMessage.value = '會員刪除成功'
      return true
    } catch (err) {
      error.value = getApiErrorMessage(
        err,
        '刪除會員失敗'
      )
      return false
    } finally {
      submitting.value = false
    }
  }

  // 更新會員
  async function editMember(
    id: string,
    data: UpdateMember
  ): Promise<boolean> {
    if (!canManageMembers.value) {
      error.value = '目前帳號沒有權限執行此操作'
      return false
    }
    if (submitting.value) {
      return false
    }
    submitting.value = true
    error.value = ''
    successMessage.value = ''
    try {
      await updateMember(id, data)
      const fetchResult = await fetchMembers()
      if (fetchResult === 'error') {
        successMessage.value = '會員更新成功，但列表更新失敗'
      } else {
        successMessage.value = '更新會員成功'
      }

      return true
    } catch (err) {
      error.value = getApiErrorMessage(
        err,
        '更新會員失敗'
      )
      return false
    } finally {
      submitting.value = false
    }
  }

  // 搜尋會員，將頁碼重置為 1 並重新抓取會員資料
  async function searchMembers() {
    searchParams.page = 1
    await fetchMembers()
  }

  // 重新設定搜尋條件並重新抓取會員資料
  async function resetSearch() {
    searchParams.page = 1
    searchParams.pageSize = DEFAULT_PAGE_SIZE
    searchParams.keyword = ''
    searchParams.status = null
    await fetchMembers()
  }

  async function nextPage() {
    if (searchParams.page >= totalPages.value) { return }
    searchParams.page++
    await fetchMembers()
  }

  async function prevPage() {
    if (searchParams.page <= 1) { return }
    searchParams.page--
    await fetchMembers()
  }

  return {
    members,
    loading,
    error,
    searchParams,
    hasLoaded,
    successMessage,
    totalItems,
    totalPages,
    fetchMembers,
    resetSearch,
    searchMembers,
    nextPage,
    prevPage,
    addMember,
    removeMember,
    editMember,
    submitting,
  }
}