import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export type UserRole = 'admin' | 'accountant' | 'auditor'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  company?: string
  position?: string
  lastLogin?: string
  twoFactorEnabled?: boolean
  preferences?: {
    theme?: 'light' | 'dark'
    language?: 'fr' | 'en'
    notifications?: boolean
  }
}

interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

interface UpdateProfileData {
  name?: string
  email?: string
  phone?: string
  company?: string
  position?: string
  currentPassword?: string
  newPassword?: string
  avatar?: File
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Permissions par rôle
  const rolePermissions = {
    admin: [
      'manage_users',
      'manage_roles',
      'manage_settings',
      'view_reports',
      'manage_transactions',
      'manage_invoices',
      'manage_accounting'
    ],
    accountant: [
      'view_reports',
      'manage_transactions',
      'manage_invoices',
      'manage_accounting'
    ],
    auditor: [
      'view_reports',
      'view_transactions',
      'view_invoices',
      'view_accounting'
    ]
  }
  
  const login = async ({ email, password, remember = false }: LoginCredentials) => {
    loading.value = true
    error.value = null
    
    try {
      // Simulation d'une requête API
      if (email === 'demo@example.com' && password === 'password') {
        user.value = {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'accountant',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=demo`,
          phone: '+33 1 23 45 67 89',
          company: 'Demo Company',
          position: 'Comptable',
          lastLogin: new Date().toISOString(),
          twoFactorEnabled: false,
          preferences: {
            theme: 'light',
            language: 'fr',
            notifications: true
          }
        }
        token.value = 'demo-token'
        
        if (remember) {
          localStorage.setItem('auth_token', token.value)
        }
        
        return true
      }
      throw new Error('Identifiants invalides')
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    router.push('/login')
  }
  
  const updateProfile = async (data: UpdateProfileData) => {
    if (!user.value) return
    
    loading.value = true
    error.value = null
    
    try {
      // Simulation d'une mise à jour API
      if (data.currentPassword && data.newPassword) {
        // Logique de changement de mot de passe
      }
      
      if (data.avatar) {
        // Logique d'upload d'avatar
        const seed = Math.random().toString(36).substring(7)
        user.value.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
      }
      
      user.value = {
        ...user.value,
        ...data
      }
      
      return true
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false
    return rolePermissions[user.value.role].includes(permission)
  }
  
  const checkAuth = async () => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken && !user.value) {
      // Simulation de récupération du profil
      if (savedToken === 'demo-token') {
        user.value = {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'accountant',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=demo`,
          phone: '+33 1 23 45 67 89',
          company: 'Demo Company',
          position: 'Comptable',
          lastLogin: new Date().toISOString(),
          twoFactorEnabled: false,
          preferences: {
            theme: 'light',
            language: 'fr',
            notifications: true
          }
        }
        token.value = savedToken
      }
    }
  }
  
  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    if (!user.value) return
    
    user.value.preferences = {
      ...user.value.preferences,
      ...preferences
    }
  }
  
  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    updateProfile,
    hasPermission,
    checkAuth,
    updatePreferences
  }
})