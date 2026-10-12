<script setup lang="ts">
import type { CreateMember } from '../types/member'

defineProps<{
  modelValue: CreateMember
  title: string
  submitText: string
  showCancel?: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CreateMember]
  submit: []
  cancel: []
}>()
</script>
<template>
  <form class="member-form" @submit.prevent="emit('submit')">
    <div class="member-form__heading">
      <span class="member-form__icon" aria-hidden="true">{{ title === '新增會員' ? '+' : '✎' }}</span>
      <h3>{{ title }}</h3>
    </div>

    <div class="member-form__field">
      <label :for="`${title === '新增會員' ? 'new' : 'edit'}-member-name`">姓名</label>
      <input 
        :id="`${title === '新增會員' ? 'new' : 'edit'}-member-name`"
        v-model="modelValue.name"
        type="text"
        placeholder="請輸入姓名"
        @input="
          emit('update:modelValue', {
            ...modelValue,
            name: ($event.target as HTMLInputElement).value
          })
          "
      />
    </div>
    <div class="member-form__field">
      <label :for="`${title === '新增會員' ? 'new' : 'edit'}-member-email`">Email</label>
      <input 
        :id="`${title === '新增會員' ? 'new' : 'edit'}-member-email`"
        v-model="modelValue.email"
        type="email"
        placeholder="請輸入Email"
      />
    </div>
    <div class="member-form__field">
      <label :for="`${title === '新增會員' ? 'new' : 'edit'}-member-status`">狀態</label>
      <select
        :id="`${title === '新增會員' ? 'new' : 'edit'}-member-status`"
        :value="modelValue.status"
        @change="
          emit('update:modelValue', {
            ...modelValue,
            status: ($event.target as HTMLSelectElement).value === '1' ? 1 : 0
          })
        "
      >
        <option :value="1">啟用</option>
        <option :value="0">停用</option>
      </select>
    </div>
    <div class="member-form__actions">
      <button class="button button--primary" type="submit" :disabled="submitting">
      {{ submitting ? '處理中' : submitText }}
      </button>
      <button
        v-if="showCancel"
        class="button button--secondary"
        type="button"
        :disabled="submitting"
        @click="emit('cancel')"
      >
        取消
      </button>
    </div>
  </form>
</template>