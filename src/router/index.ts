import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/auth/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../views/Transactions.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/plan-comptable',
      name: 'accountingPlan',
      component: () => import('../components/AccountingPlan.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/journals',
      name: 'journals',
      component: () => import('../views/Journals.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: () => import('../views/Invoices.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/bank-reconciliation',
      name: 'bankReconciliation',
      component: () => import('../views/BankReconciliation.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/financial-statements',
      name: 'financialStatements',
      component: () => import('../views/FinancialStatements.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && auth.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router