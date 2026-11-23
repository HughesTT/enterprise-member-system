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
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登入失敗，請稍後再試'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-card" aria-labelledby="login-title">
      <a class="login-brand" href="#/login" aria-label="會員管理系統">
        <span class="login-brand__mark" aria-hidden="true">M</span>
        <span>
          <strong>MemberDesk</strong>
          <small>會員管理系統</small>
        </span>
      </a>

      <div class="login-intro">
        <p class="login-eyebrow">WELCOME BACK</p>
        <h1 id="login-title">登入管理平台</h1>
        <p>請輸入您的帳號與密碼，以繼續使用系統。</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <label for="username">帳號</label>
        <input
          id="username"
          v-model="username"
          type="text"
          autocomplete="username"
          placeholder="請輸入帳號"
          required
        />

        <label for="password">密碼</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="請輸入密碼"
          required
        />

        <p v-if="errorMessage" class="login-error" role="alert">
          {{ errorMessage }}
        </p>

        <button type="submit" :disabled="submitting">
          {{ submitting ? '登入中…' : '登入' }}
          <span aria-hidden="true">→</span>
        </button>
      </form>

      <p class="login-note">系統管理員與客服人員請使用已授權的帳號登入。</p>
    </section>
    <p class="login-copyright">MemberDesk · 會員管理平台</p>
  </main>
</template>

<style>
.login-page {
  display: grid;
  min-height: 100vh;
  align-content: center;
  justify-items: center;
  padding: 32px 20px;
  background:
    radial-gradient(ellipse at 12% 12%, rgb(63 112 211 / 9%), transparent 34%),
    radial-gradient(ellipse at 90% 86%, rgb(80 133 224 / 8%), transparent 32%),
    #f5f7fb;
}

.login-card {
  width: min(100%, 440px);
  padding: 38px 40px 30px;
  border: 1px solid #e5eaf1;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 18px 55px rgb(34 55 91 / 9%);
}

.login-brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: #172b4d;
  text-decoration: none;
}

.login-brand__mark {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(145deg, #4279e8, #2859be);
  box-shadow: 0 5px 12px rgb(50 104 213 / 24%);
  color: #fff;
  font-size: 19px;
  font-weight: 750;
}

.login-brand > span:last-child {
  display: grid;
  gap: 2px;
}

.login-brand strong {
  font-size: 15px;
}

.login-brand small {
  color: #74839a;
  font-size: 11px;
}

.login-intro {
  margin: 37px 0 26px;
}

.login-eyebrow {
  margin: 0 0 8px;
  color: #3268d5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1.3px;
}

.login-intro h1 {
  margin: 0;
  color: #172b4d;
  font-size: 25px;
  font-weight: 720;
  letter-spacing: -0.5px;
}

.login-intro > p:last-child {
  margin: 8px 0 0;
  color: #74839a;
  font-size: 13px;
  line-height: 1.6;
}

.login-form {
  display: grid;
  gap: 9px;
}

.login-form label {
  margin-top: 6px;
  color: #3a4d68;
  font-size: 12px;
  font-weight: 650;
}

.login-form input {
  width: 100%;
  min-height: 43px;
  padding: 10px 12px;
  border: 1px solid #d9e1eb;
  border-radius: 7px;
  outline: none;
  background: #fff;
  color: #172b4d;
  font: inherit;
  font-size: 13px;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.login-form input::placeholder {
  color: #a1adbc;
}

.login-form input:focus {
  border-color: #3268d5;
  box-shadow: 0 0 0 3px rgb(50 104 213 / 12%);
}

.login-form button {
  display: flex;
  min-height: 43px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  border: 0;
  border-radius: 7px;
  background: #3268d5;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 650;
  transition: background-color 150ms ease;
}

.login-form button:hover:not(:disabled) {
  background: #2456bc;
}

.login-form button:focus-visible {
  outline: 3px solid rgb(50 104 213 / 30%);
  outline-offset: 2px;
}

.login-form button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.login-error {
  margin: 3px 0;
  color: #b44747;
  font-size: 12px;
}

.login-note {
  margin: 23px 0 0;
  padding-top: 17px;
  border-top: 1px solid #edf1f6;
  color: #8794a7;
  font-size: 11px;
  line-height: 1.6;
}

.login-copyright {
  margin: 19px 0 0;
  color: #97a2b1;
  font-size: 11px;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 24px 24px;
  }
}
</style>