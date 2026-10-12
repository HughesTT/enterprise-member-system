import { ref, reactive } from 'vue'
import { createMember, getMembers, deleteMember, updateMember } from '../api/members'
import type { Member, MemberSearchParams, CreateMember, UpdateMember } from '../types/member'

export function useMembers() {
  const members = ref<Member[]>([])
  const loading = ref(false)
  const error = ref('')
  const submitting = ref(false)
  
  const totalItems = ref(0)
  const totalPages = ref(1)

  const searchParams = reactive<MemberSearchParams>({
    page: 1,
    pageSize: 2,
    keyword: '',
    status: null
  })

  // 讀取會員資料
  async function fetchMembers() {
    loading.value = true
    error.value = ''

    try {
      const response = await getMembers(searchParams)
      console.log(response)
      members.value = response.list
      totalItems.value = response.total
      totalPages.value = response.totalPages
          } catch (err) {
      error.value ='讀取會員資料失敗'
    } finally {
      loading.value = false
    }
  }

  // 新增會員
  async function addMember(data: CreateMember): Promise<boolean> {
    submitting.value = true
    error.value = ''
    try {
      await createMember(data)
      await fetchMembers()

      return true
    } catch (err) {
      error.value = '新增會員失敗'
      return false
    } finally {
      submitting.value = false
    }
  }

  // 刪除會員
  async function removeMember(id: string): Promise<boolean> {
    submitting.value = true
    error.value = ''
    try {
      await deleteMember(id)
      await fetchMembers()
      return true
    } catch (err) {
      error.value = '刪除會員失敗'
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
    submitting.value = true
    error.value = ''
    try {
      await updateMember(id, data)
      await fetchMembers()

      return true
    } catch (err) {
      error.value = '更新會員失敗'
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
    searchParams.pageSize = 2,
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