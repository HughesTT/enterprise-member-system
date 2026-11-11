import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import { createMember, getMembers, deleteMember, updateMember } from '../api/members.api'
import type { Member, MemberSearchParams, CreateMember, UpdateMember } from '../types/member'
import { useAuthStore } from '../stores/auth'
import { getApiErrorMessage } from '../utils/apiError'

export function useMembers() {
  const authStore = useAuthStore()
  const canManageMembers = computed(
    () => authStore.user?.role === 'admin'
  )
  const members = ref<Member[]>([])
  const loading = ref(false)
  const error = ref('')
  const submitting = ref(false)
  
  const totalItems = ref(0)
  const totalPages = ref(1)

  const searchParams = reactive<MemberSearchParams>({
    page: 1,
    pageSize: 5,
    keyword: '',
    status: null
  })
  const successMessage = ref('')

  // 紀錄目前正在執行的請求
  let activeController: AbortController | null = null

  // 讀取會員資料
  async function fetchMembers() {
    // 每次讀取會員資料前，清空成功訊息
    successMessage.value = ''
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
      if (activeController !== controller) return

      members.value = response.list
      totalItems.value = response.total
      totalPages.value = response.totalPages
    } catch (err) {
      if (axios.isCancel(err)) return // 被取消的請求不應顯示錯誤
      if (activeController === controller) { // 只有最新的請求可以更新錯誤訊息
        error.value = getApiErrorMessage(
          err,
          '讀取會員資料失敗'
        )
      }
    } finally {
      // 避免就請求結束時，將新請求的 loading 關閉
      if (activeController === controller) {
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
      await fetchMembers()
      successMessage.value = '新增會員成功'

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
      await fetchMembers()
      successMessage.value = '刪除會員成功'
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
      await fetchMembers()
      successMessage.value = '更新會員成功'

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
    searchParams.page = 1,
    searchParams.pageSize = 5,
    searchParams.keyword = '',
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