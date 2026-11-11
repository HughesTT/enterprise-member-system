// TypeScript Module Augmentation 模組擴充，告訴 TypeScript vue-router 的 RouteMeta 有哪些額外屬性
import 'vue-router'
import type { UserRole } from './auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: UserRole[]
  }
}