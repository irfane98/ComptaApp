import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

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
  
  const login = async ({ email, password, remember = false }: LoginCredentials) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.success) {
        user.value = response.data.user
        token.value = response.data.token
        
        if (remember) {
          localStorage.setItem('token', response.data.token)
        }
        
        return true
      }
      throw new Error('Identifiants invalides')
    } catch (e) {
      error.value = e.response?.data?.message || e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }
  
  const updateProfile = async (data: UpdateProfileData) => {
    if (!user.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put('/users/profile', data)
      
      if (response.data.success) {
        user.value = {
          ...user.value,
          ...response.data.user
        }
        return true
      }
      throw new Error('Erreur lors de la mise à jour du profil')
    } catch (e) {
      error.value = e.response?.data?.message || e.message
      throw e
    } finally {
      loading.value = false
    }
  }
  
  const checkAuth = async () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken && !user.value) {
      try {
        const response = await api.get('/users/profile')
        if (response.data.success) {
          user.value = response.data.user
          token.value = savedToken
        }
      } catch (e) {
        localStorage.removeItem('token')
      }
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
    checkAuth
  }
})