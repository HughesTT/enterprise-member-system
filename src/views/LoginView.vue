<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const submitting = ref(false)

// 處理登入表單提交的函式
// 會呼叫 authStore.login 並處理錯誤訊息與提交狀態
async function handleSubmit() {
  errorMessage.value = ''
  submitting.value = true

  try {
    await authStore.login(username.value, password.value)
    await router.push({ name: 'MemberList'})
    console.log('Login successful')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登入失敗，請稍後再試'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <form class="login-form" @submit.prevent="handleSubmit">
      <h1>會員管理系統</h1>

      <label for="username">帳號</label>
      <input
        id="username"
        v-model="username"
        type="text"
        autocomplete="username"
        required
      />

      <label for="password">密碼</label>
      <input
        id="password"
        v-model="password"
        type="password"
        autocomplete="current-password"
        required
      />

      <p v-if="errorMessage" role="alert">
        {{ errorMessage }}
      </p>

      <button type="submit" :disabled="submitting">
        {{ submitting ? '登入中…' : '登入' }}
      </button>
    </form>
  </main>
</template>