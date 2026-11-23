<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Member, CreateMember } from '../types/member'
import { useMembers } from '../composables/useMembers'
import { useAuthStore } from '../stores/auth'
import MemberForm from '../components/members/MemberForm.vue'
import './MemberList.css'

const { members, loading, error, totalItems, totalPages, searchParams, fetchMembers, searchMembers, successMessage, nextPage, prevPage, addMember, removeMember, editMember, submitting, hasLoaded } = useMembers()

const newMember = ref<CreateMember>({
  name: '',
  email: '',
  status: 1
})
const editingMemberId = ref<string | null>(null)
const editForm = ref<CreateMember>({
  name: '',
  email: '',
  status: 1
})

const authStore = useAuthStore()
const router = useRouter()
const isAdmin = computed(() => authStore.user?.role === 'admin')
const hasSearchConditions = computed(() => { // 判斷是否有搜尋條件
  return (
    searchParams.keyword.trim() !== '' || searchParams.status !== null
  )
})
const deletingMemberId = ref<string | null>(null)

async function handleLogout() {
  authStore.logout()
  await router.push({ name: 'Login' })
}

function startEdit(member: Member) {
  editingMemberId.value = member.id
  editForm.value = {
    name: member.name,
    email: member.email,
    status: member.status
  }
}

function cancelEdit() {
  editingMemberId.value = null
  editForm.value = {
    name: '',
    email: '',
    status: 1
  }
}

async function handleAddMember() {
  const success = await addMember(newMember.value)

  if (!success) {
    return
  }

  newMember.value = {
    name: '',
    email: '',
    status: 1
  }
}
async function handleUpdateMember() {
  if (!editingMemberId.value) {
    return
  }

  const success = await editMember(editingMemberId.value, editForm.value)

  if (!success) {
    return
  }

  cancelEdit()
}
async function handleDeleteMember(member: Member) {
  const confirmDelete = window.confirm(`確定要刪除會員「${member.name}」嗎？`)
  if (!confirmDelete) {
    return
  }
  clearTimeout(debounceTimer) // 取消尚未執行的搜尋計時器，避免刪除操作與搜尋衝突
  deletingMemberId.value = member.id
  try {
    const success = await removeMember(member.id)

    if (!success) {
      return
    }
  } finally {
    deletingMemberId.value = null
  }
}

// 監聽搜尋參數變化，使用計時器觸發搜尋
let debounceTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => [
    searchParams.keyword,
    searchParams.status
  ],
  () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      searchMembers()
    }, 500)
  }
)

onMounted(() => {
  fetchMembers()
})

// 離開頁面清除尚未執行的計時器
onUnmounted(() => {
  clearTimeout(debounceTimer)
})
</script>
<template>
  <div class="app-shell">
    <aside class="app-sidebar" aria-label="主要導覽">
      <a class="brand" href="#/members" aria-label="會員管理系統首頁">
        <span class="brand__mark" aria-hidden="true">M</span>
        <span class="brand__text">
          <strong>MemberDesk</strong>
          <small>會員管理系統</small>
        </span>
      </a>

      <div class="sidebar-section-label">工作空間</div>
      <nav class="sidebar-nav">
        <a class="sidebar-nav__link sidebar-nav__link--active" href="#/members" aria-current="page">
          <span class="sidebar-nav__icon" aria-hidden="true">▦</span>
          <span>會員管理</span>
          <span class="sidebar-nav__chevron" aria-hidden="true">›</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-avatar" aria-hidden="true">
          {{ authStore.user?.name?.slice(0, 1) || 'U' }}
        </div>
        <div class="sidebar-account user-info">
          <strong>{{ authStore.user?.name }}</strong>
          <span>{{ authStore.user?.role === 'admin' ? '系統管理員' : '客服人員' }}</span>
        </div>
      </div>
    </aside>

    <main class="member-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">MEMBER DIRECTORY</p>
        <h1>會員管理</h1>
        <p class="page-description">管理會員資料、狀態與帳戶資訊。</p>
      </div>
      <div class="page-heading__actions">
        <div class="member-count">
          <span class="member-count__label">會員總數</span>
          <strong>{{ totalItems }}</strong>
        </div>
        <button class="button button--secondary" type="button" @click="handleLogout">
          登出
        </button>
      </div>
    </header>

    <div class="top-row">
      <section class="search-panel" aria-label="搜尋會員">
        <div class="section-heading">
          <div>
            <h2>搜尋會員</h2>
            <p>依姓名模糊比對或會員狀態篩選列表</p>
          </div>
        </div>
        <form class="search-form" @submit.prevent>
          <label>
            <span>姓名</span>
            <input v-model="searchParams.keyword" type="search" placeholder="請輸入姓名" :disabled="deletingMemberId !== null"/>
          </label>
          <label>
            <span>會員狀態</span>
            <select v-model="searchParams.status" :disabled="deletingMemberId !== null">
              <option :value="null">全部狀態</option>
              <option :value="1">啟用</option>
              <option :value="0">停用</option>
            </select>
          </label>
        </form>
      </section>

      <MemberForm
        v-if="isAdmin"
        v-model="newMember"
        title="新增會員"
        submit-text="新增會員"
        :submitting="submitting"
        @submit="handleAddMember"
      />
    </div>

    <section v-if="isAdmin && editingMemberId" class="edit-section" aria-label="編輯會員">
      <MemberForm
        v-model="editForm"
        title="編輯會員"
        submit-text="儲存修改"
        :show-cancel="true"
        :submitting="submitting"
        @submit="handleUpdateMember"
        @cancel="cancelEdit"
      />
    </section>

    <section class="list-panel" aria-label="會員列表">
      <div class="section-heading section-heading--list">
        <div>
          <h2>會員列表</h2>
          <p>共 {{ totalItems }} 位會員</p>
        </div>
      </div>
      <div
        v-if="successMessage"
        class="list-message list-message--success"
        role="status"
        aria-live="polite"
      >{{ successMessage }}</div>
      <!-- 初次載入 -->
      <div
        v-if="loading && !hasLoaded"
        class="list-message loading-state"
        role="status"
        aria-live="polite"
      >
        <span class="loading-spinner" aria-hidden="true"></span>
        <span>讀取中...</span>
      </div>

      <!-- 初次載入失敗 -->
      <div
        v-else-if="error && !hasLoaded"
        class="list-message list-message--error"
        role="alert"
      >
        {{ error }}
      </div>

      <!-- 已經成功載入過資料 -->
      <template v-else>

        <!-- 搜尋或切換頁碼時的載入提示 -->
        <div
          v-if="loading"
          class="list-message loading-state"
          role="status"
          aria-live="polite"
        >
          <span class="loading-spinner" aria-hidden="true"></span>
          <span>更新資料中...</span>
        </div>

        <!-- 後續載入失敗 -->
        <div
          v-if="error"
          class="list-message list-message--error"
          role="alert"
        >
          {{ error }}
        </div>

        <!-- 原本的會員列表，完整保留 -->
        <div class="table-scroll">
          <table class="member-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>姓名</th>
                <th>電子郵件</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in members" :key="member.id">
                <td class="member-id">{{ member.id }}</td>
                <td class="member-name">{{ member.name }}</td>
                <td>{{ member.email }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="member.status === 1 ? 'status-badge--active' : 'status-badge--inactive'"
                  >
                    {{ member.status === 1 ? '啟用' : '停用' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button type="button" class="button button--row" @click="startEdit(member)" v-if="isAdmin">編輯</button>
                    <button type="button"
                      class="button button--row button--danger" @click="handleDeleteMember(member)"
                      v-if="isAdmin"
                      :disabled="deletingMemberId !== null"
                    >
                      {{ deletingMemberId === member.id ? '刪除中...' : '刪除' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="members.length === 0">
                <td colspan="5" class="empty-state">
                  {{ hasSearchConditions ? '找不到符合條件的會員' : '目前尚無會員資料' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </template>

      <nav class="pagination" aria-label="會員列表分頁">
        <button
          class="button button--secondary"
          :disabled="deletingMemberId !== null || searchParams.page <= 1"
          @click="prevPage"
        >
          上一頁
        </button>
        <span>第 <strong>{{ searchParams.page }}</strong> / {{ totalPages }} 頁</span>
        <button
          class="button button--secondary"
          :disabled="deletingMemberId !== null || searchParams.page >= totalPages"
          @click="nextPage"
        >
          下一頁
        </button>
      </nav>
    </section>
    </main>
  </div>
</template>