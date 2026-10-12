import { apiClient } from './client'
import type { Member, MemberSearchParams, ApiMember, CreateMember, UpdateMember } from '../types/member'
import type { PageResponse, ListResponse } from '../types/api'

export async function getMembers(
  params: MemberSearchParams
): Promise<ListResponse<Member>> {

  const response = await apiClient.get<PageResponse<ApiMember>>(
    '/members',
    {
      params: {
        ...(params.keyword && {
          name: params.keyword
        }),

        ...(params.status !== null && {
          status: params.status
        }),

        _page: params.page,
        _per_page: params.pageSize,
      },
    }
  )
  console.log(response)

  return {
    list: response.data.data,
    total: response.data.items,
    totalPages: response.data.pages
  }
}

// 新增會員
export async function createMember(
  data: CreateMember
): Promise<Member> {
  const response = await apiClient.post<ApiMember>(
    '/members',
    data
  )

  return response.data
}

// 刪除會員
export async function deleteMember(id: string): Promise<void> {
  await apiClient.delete(`/members/${id}`)
}

// 更新會員
export async function updateMember(
  id: string,
  data: UpdateMember
): Promise<Member> {
  const response = await apiClient.patch<ApiMember>( // 不用 put 使用 patch 是因為只更新部分資料
    `/members/${id}`,
    data
  )

  return response.data
}