// 使用者類型
export type UserRole = 'admin' | 'staff' // 不使用role: string，是為了限制只能是這兩種角色

// 登入資料
export interface LoginCredentials {
  username: string
  password: string
}

// 使用者資料
export interface AuthUser {
  id: string
  username: string
  name: string
  role: UserRole
}

// 登入 API 回傳資料
export interface LoginResponse {
  accessToken: string
  user: AuthUser
}