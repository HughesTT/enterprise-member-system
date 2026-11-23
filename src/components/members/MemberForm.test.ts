import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MemberForm from './MemberForm.vue'

describe('MemberForm', () => {
  it('應正確顯示姓名、Email 欄位與提交按鈕', () => {
    const wrapper = mount(MemberForm, {
      props: {
        modelValue: {
          name: '',
          email: '',
          status: 1
        },
        title: '新增會員',
        submitText: '新增',
        submitting: false
      }
    })

    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.findAll('input')).toHaveLength(2)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  // 測試輸入姓名與 Email 時，應觸發 update:modelValue 事件
  it('輸入姓名與 Email 時，應觸發 update:modelValue 事件', async () => {
    const wrapper = mount(MemberForm, {
      props: {
        modelValue: {
          name: '',
          email: '',
          status: 1
        },
        title: '新增會員',
        submitText: '新增',
        submitting: false
      }
    })

    await wrapper.findAll('input')[0].setValue('王小明')
    await wrapper.findAll('input')[1].setValue('test@example.com')

    const emitted = wrapper.emitted('update:modelValue')

    expect(emitted).toBeTruthy()
    expect(emitted?.at(-1)?.[0]).toEqual({
      name: '王小明',
      email: 'test@example.com',
      status: 1
    })
  })

  // 測試姓名為空白時，應顯示姓名必填錯誤訊息
  it('姓名為空白時，應顯示姓名必填錯誤訊息', async () => {
    const wrapper = mount(MemberForm, {
      props: {
        modelValue: {
          name: '',
          email: '',
          status: 1
        },
        title: '新增會員',
        submitText: '新增',
        submitting: false
      }
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('請輸入姓名')
  })

  // 測試 Email 格式錯誤時，應顯示格式錯誤訊息
  it('Email 格式錯誤時，應顯示格式錯誤訊息', async () => {
    const wrapper = mount(MemberForm, {
      props: {
        modelValue: {
          name: '王小明',
          email: 'invalid-email',
          status: 1
        },
        title: '新增會員',
        submitText: '新增',
        submitting: false
      }
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Email 格式不正確')
  })

  // 測試表單驗證失敗時，不應觸發 submit 事件
  it('表單驗證失敗時，不應觸發 submit 事件', async () => {
    const wrapper = mount(MemberForm, {
      props: {
        modelValue: {
          name: '',
          email: '',
          status: 1
        },
        title: '新增會員',
        submitText: '新增',
        submitting: false
      }
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  // 測試姓名與 Email 驗證成功時，應觸發 submit 事件
  it('姓名與 Email 驗證成功時，應觸發 submit 事件', async () => {
    const wrapper = mount(MemberForm, {
      props: {
        modelValue: {
          name: '王小明',
          email: 'test@example.com',
          status: 1
        },
        title: '新增會員',
        submitText: '新增',
        submitting: false
      }
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  // 測試提交處理中時，應停用按鈕並顯示處理中
  it('提交處理中時，應停用按鈕並顯示處理中', () => {
    const wrapper = mount(MemberForm, {
      props: {
        modelValue: {
          name: '王小明',
          email: 'test@example.com',
          status: 1
        },
        title: '新增會員',
        submitText: '新增',
        submitting: true
      }
    })

    const submitButton = wrapper.find('button[type="submit"]')

    expect(submitButton.attributes('disabled')).toBeDefined()
    expect(submitButton.text()).toBe('處理中')
  })

  // 測試姓名與 Email 都有錯誤時，應將焦點移到姓名欄位
  it('姓名與 Email 都有錯誤時，應將焦點移到姓名欄位', async () => {
    const wrapper = mount(MemberForm, {
      attachTo: document.body,
      props: {
        modelValue: {
          name: '',
          email: '',
          status: 1
        },
        title: '新增會員',
        submitText: '新增',
        submitting: false
      }
    })

    await wrapper.find('form').trigger('submit')

    expect(document.activeElement).toBe(
      wrapper.find('input[type="text"]').element
    )

    wrapper.unmount()
  })

  // 測試姓名正常但 Email 空白時，應將焦點移到 Email 欄位
  it('姓名正常但 Email 空白時，應將焦點移到 Email 欄位', async () => {
    const wrapper = mount(MemberForm, {
      attachTo: document.body,
      props: {
        modelValue: {
          name: '王小明',
          email: '',
          status: 1
        },
        title: '新增會員',
        submitText: '新增',
        submitting: false
      }
    })

    await wrapper.find('form').trigger('submit')

    expect(document.activeElement).toBe(
      wrapper.find('input[type="email"]').element
    )

    wrapper.unmount()
  })

  // 測試顯示取消按鈕時，點擊應觸發 cancel 事件
  it('顯示取消按鈕時，點擊應觸發 cancel 事件', async () => {
    const wrapper = mount(MemberForm, {
      props: {
        modelValue: {
          name: '',
          email: '',
          status: 1
        },
        title: '編輯會員',
        submitText: '儲存',
        showCancel: true,
        submitting: false
      }
    })

    await wrapper.find('button[type="button"]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // 測試輸入姓名後，應清除姓名錯誤訊息
  it('輸入姓名後，應清除姓名錯誤訊息', async () => {
    const wrapper = mount(MemberForm, {
      props: {
        modelValue: {
          name: '',
          email: '',
          status: 1
        },
        title: '新增會員',
        submitText: '新增',
        submitting: false
      }
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('請輸入姓名')

    await wrapper.find('input[type="text"]').setValue('王小明')

    expect(wrapper.text()).not.toContain('請輸入姓名')
  })

  // 測試輸入 Email 後，應清除 Email 錯誤訊息
  it('輸入 Email 後，應清除 Email 錯誤訊息', async () => {
    const wrapper = mount(MemberForm, {
      props: {
        modelValue: {
          name: '王小明',
          email: '',
          status: 1
        },
        title: '新增會員',
        submitText: '新增',
        submitting: false
      }
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('請輸入 Email')

    await wrapper.find('input[type="email"]').setValue('test@example.com')

    expect(wrapper.text()).not.toContain('請輸入 Email')
  })

  // 測試提交時應去除姓名與 Email 前後的空白
  it('提交時應去除姓名與 Email 前後的空白', async () => {
    const wrapper = mount(MemberForm, {
      props: {
        modelValue: {
          name: ' 王小明 ',
          email: ' test@example.com ',
          status: 1
        },
        title: '新增會員',
        submitText: '新增',
        submitting: false
      }
    })

    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('update:modelValue')

    expect(emitted).toBeTruthy()
    expect(emitted?.[0][0]).toEqual({
      name: '王小明',
      email: 'test@example.com',
      status: 1
    })

    expect(wrapper.emitted('submit')).toHaveLength(1)
  })
})