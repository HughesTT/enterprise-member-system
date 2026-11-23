<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToMemberList() {
  router.push({ name: 'MemberList' })
}
</script>

<template>
  <main class="not-found">
    <h1>404</h1>
    <h2>找不到此頁面</h2>
    <p>您所瀏覽的頁面不存在，或網址可能已經變更。</p>

    <button type="button" @click="goToMemberList">
      返回會員列表
    </button>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

h1 {
  font-size: 64px;
  margin: 0;
}

h2 {
  margin: 12px 0;
}

p {
  margin-bottom: 24px;
}

button {
  padding: 10px 20px;
  cursor: pointer;
}
</style>
