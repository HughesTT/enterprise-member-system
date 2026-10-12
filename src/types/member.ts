// 會員狀態型別，0 表示非啟用，1 表示啟用，讓 TypeScript 檢查資料
export type MemberStatus = 0 | 1

// 前端使用的會員資料型別
export interface Member {
  id: string;
  name: string;
  email: string;
  status: MemberStatus;
}

// 後端 API 回傳的會員資料型別
export interface ApiMember {
  id: string
  name: string
  email: string
  status: MemberStatus; // 讓 TypeScript 檢查資料
}

// 新增會員時的資料型別可以不需要提供 id
export type CreateMember = Omit<Member, 'id'>

// 更新會員時的資料型別可以只提供部分欄位
export type UpdateMember = Partial<CreateMember>

// 會員搜尋的參數型別
export interface MemberSearchParams {
  page: number
  pageSize: number
  keyword: string
  status: MemberStatus | null // 讓 TypeScript 檢查資料
}