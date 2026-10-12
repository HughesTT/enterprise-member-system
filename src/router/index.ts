import { createRouter, createWebHashHistory } from 'vue-router'
import MemberList from '../views/MemberList.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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