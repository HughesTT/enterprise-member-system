import { createRouter, createWebHistory } from 'vue-router'
import MemberList from '../views/MemberList.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/members'
    },
    {
      path: '/members',
      name: 'MemberList',
      component: MemberList
    }
  ],
})

export default router