<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Member, CreateMember } from '../types/member'
import { useMembers } from '../composables/useMembers'
import MemberForm from '../components/MemberForm.vue'
import './MemberList.css'

const { members, loading, error, totalItems, totalPages, searchParams, fetchMembers, resetSearch, nextPage, prevPage, addMember, removeMember, editMember, submitting } = useMembers()

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
  if (!newMember.value.name.trim()) {
    error.value = '請輸入姓名'
    return
  }
  if (!newMember.value.email.trim()) {
    error.value = '請輸入 Email'
    return
  }

  const success = await addMember(newMember.value)

  if (!success) {
    return
  }

  newMember.value = {
    name: '',
    email: '',
    status: 1
  }

  cancelEdit()
}
async function handleUpdateMember() {
  if (!editingMemberId.value) {
    return
  }

  if (!editForm.value.name.trim()) {
    error.value = '請輸入姓名'
    return
  }
  if (!editForm.value.email.trim()) {
    error.value = '請輸入 Email'
    return
  }

  const success = await editMember(editingMemberId.value, editForm.value)

  if (!success) {
    return
  }

  cancelEdit()
}
async function handleDeleteMmeber(id: string) {
  const confirmDelete = window.confirm(`確定要刪除會員${id}嗎？`)
  if (!confirmDelete) {
    return
  }
  const success = await removeMember(id)

  if (!success) {
    return
  }
}

onMounted(() => {
  fetchMembers()
})
</script>
<template>
  <main class="member-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">MEMBER DIRECTORY</p>
        <h1>會員管理</h1>
      </div>
      <div class="member-count">
        <span class="member-count__label">會員總數</span>
        <strong>{{ totalItems }}</strong>
      </div>
    </header>

    <div class="top-row">
    <section class="search-panel" aria-label="搜尋會員">
      <div class="section-heading">
        <div>
          <h2>搜尋會員</h2>
          <p>依姓名或會員狀態篩選列表</p>
        </div>
      </div>
      <div class="search-form">
        <label>
          <span>姓名</span>
          <input v-model="searchParams.keyword" type="text" placeholder="請輸入姓名" @keydown.enter="fetchMembers" />
        </label>
        <label>
          <span>會員狀態</span>
          <select v-model="searchParams.status">
            <option :value="null">全部狀態</option>
            <option :value="1">啟用</option>
            <option :value="0">停用</option>
          </select>
        </label>
        <div class="search-actions">
          <button class="button button--primary" @click="fetchMembers">搜尋</button>
          <button class="button button--secondary" @click="resetSearch">重設</button>
        </div>
      </div>
    </section>

      <MemberForm
        v-model="newMember"
        title="新增會員"
        submit-text="新增會員"
        :submitting="submitting"
        @submit="handleAddMember"
      />
    </div>

    <section v-if="editingMemberId" class="edit-section" aria-label="編輯會員">
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
      <div v-if="loading" class="list-message" role="status">讀取中...</div>
      <div v-else-if="error" class="list-message list-message--error" role="alert">{{ error }}</div>
      <div v-else class="table-scroll">
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
                  <button class="button button--row" @click="startEdit(member)">編輯</button>
                  <button class="button button--row button--danger" @click="handleDeleteMmeber(member.id)">刪除</button>
                </div>
              </td>
            </tr>
            <tr v-if="members.length === 0">
              <td colspan="5" class="empty-state">目前沒有符合條件的會員</td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav class="pagination" aria-label="會員列表分頁">
        <button
          class="button button--secondary"
          :disabled="searchParams.page <= 1"
          @click="prevPage"
        >
          上一頁
        </button>
        <span>第 <strong>{{ searchParams.page }}</strong> / {{ totalPages }} 頁</span>
        <button
          class="button button--secondary"
          :disabled="searchParams.page >= totalPages"
          @click="nextPage"
        >
          下一頁
        </button>
      </nav>
    </section>
  </main>
</template>