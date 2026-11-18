<script setup lang="ts">
import { ref } from 'vue'
import type { CreateMember } from '../../types/member'

const props = defineProps<{
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

// 驗證 Email 格式的函式
function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  return emailPattern.test(email)
}

const nameInput = ref<HTMLInputElement | null>(null)
const emailInput = ref<HTMLInputElement | null>(null)

const nameError = ref('')
const emailError = ref('')

function handleSubmit() {
  // 每次送出前，先清除上一次的錯誤訊息
  nameError.value = ''
  emailError.value = ''

  const name = props.modelValue.name.trim()
  const email = props.modelValue.email.trim()

  // 驗證姓名
  if (!name) {
    nameError.value = '請輸入姓名'
  }

  // 驗證 Email
  if (!email) {
    emailError.value = '請輸入 Email'
  } else if (!validateEmail(email)) {
    emailError.value = 'Email 格式不正確'
  }

  // 如果有任何欄位錯誤，就停止送出，並將焦點移到第一個有錯誤的欄位
  if (nameError.value || emailError.value) {
    if (nameError.value) { // 如果姓名有錯誤，將焦點移到姓名欄位
      nameInput.value?.focus()
    } else if (emailError.value) { // 如果 Email 有錯誤，將焦點移到 Email 欄位
      emailInput.value?.focus()
    }
    return
  }

  // 將去除前後空白的資料更新回父層
  emit('update:modelValue', {
    ...props.modelValue,
    name,
    email
  })

  // 驗證通過後，才通知父層執行CRUD
  emit('submit')
}

</script>
<template>
  <form class="member-form" @submit.prevent="handleSubmit" novalidate>
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
          nameError = '',
          emit('update:modelValue', {
            ...modelValue,
            name: ($event.target as HTMLInputElement).value
          })
          "
        ref="nameInput"
        :aria-invalid="!!nameError"
        :aria-describedby="nameError ? `${title === '新增會員' ? 'new' : 'edit'}-member-name-error` : undefined"
        :class="{ 'member-form__input--error':nameError }"
      />
      <p v-if="nameError" class="member-form__error" :id="`${title === '新增會員' ? 'new' : 'edit'}-member-name-error`">
        {{ nameError }}
      </p>
    </div>
    <div class="member-form__field">
      <label :for="`${title === '新增會員' ? 'new' : 'edit'}-member-email`">Email</label>
      <input 
        :id="`${title === '新增會員' ? 'new' : 'edit'}-member-email`"
        v-model="modelValue.email"
        type="email"
        placeholder="請輸入Email"
        @input="
          emailError = '',
          emit('update:modelValue', {
            ...modelValue,
            email: ($event.target as HTMLInputElement).value
          })
        "
        ref="emailInput"
        :aria-invalid="!!emailError"
        :aria-describedby="emailError ? `${title === '新增會員' ? 'new' : 'edit'}-member-email-error` : undefined"
        :class="{ 'member-form__input--error':emailError }"
      />
      <p v-if="emailError" class="member-form__error" :id="`${title === '新增會員' ? 'new' : 'edit'}-member-email-error`">
        {{ emailError }}
      </p>
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