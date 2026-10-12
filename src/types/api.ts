// 分頁 API 回應的資料型別定義，JSON Server 實際回傳的資料結構
export interface PageResponse<T> {
  first: number
  prev: number | null
  next: number | null
  last: number
  pages: number
  items: number
  data: T[]
}
// 列表 API 回應的資料型別定義，前端實際使用的資料結構
export interface ListResponse<T> {
  list: T[]
  total: number
  totalPages: number
}