<script setup lang="ts">
import { RouterView } from 'vue-router'




// 測試登入與登出功能的程式碼，使用 Pinia 的 auth store
// import { useAuthStore } from './stores/auth'

// const authStore = useAuthStore()

// async function testLogin() {
//   console.log('登入前：', authStore.isAuthenticated, authStore.user)

//   try {
//     await authStore.login('admin', 'admin123')
//     console.log('登入後：', authStore.isAuthenticated, authStore.user)

//     authStore.logout()
//     console.log('登出後：', authStore.isAuthenticated, authStore.user)
//   } catch (error) {
//     console.error('登入測試失敗：', error)
//   }
// }

// testLogin()
</script>

<template>
  <RouterView />
</template>
