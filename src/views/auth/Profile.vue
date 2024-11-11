<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseSelect from '../../components/base/BaseSelect.vue'
import {
  UserCircleIcon,
  BellIcon,
  KeyIcon,
  GlobeAltIcon
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const activeTab = ref('profile')
const editing = ref(false)
const loading = ref(false)
const error = ref('')

const formData = ref({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  phone: auth.user?.phone || '',
  company: auth.user?.company || '',
  position: auth.user?.position || '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const preferences = ref({
  theme: auth.user?.preferences?.theme || 'light',
  language: auth.user?.preferences?.language || 'fr',
  notifications: auth.user?.preferences?.notifications ?? true
})

const avatarUrl = computed(() => {
  return auth.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user?.email}`
})

const handleAvatarChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    const file = input.files[0]
    try {
      await auth.updateProfile({ avatar: file })
    } catch (e) {
      error.value = e.message
    }
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await auth.updateProfile(formData.value)
    editing.value = false
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const updatePreferences = async () => {
  try {
    await auth.updatePreferences(preferences.value)
  } catch (e) {
    error.value = e.message
  }
}

const tabs = [
  { key: 'profile', label: 'Profil', icon: UserCircleIcon },
  { key: 'security', label: 'Sécurité', icon: KeyIcon },
  { key: 'preferences', label: 'Préférences', icon: GlobeAltIcon },
  { key: 'notifications', label: 'Notifications', icon: BellIcon }
]
</script>

<template>
  <div class="space-y-6">
    <h1 class="font-heading text-2xl font-bold text-gray-900">
      Profil Utilisateur
    </h1>
    
    <div class="grid grid-cols-12 gap-6">
      <!-- Sidebar -->
      <div class="col-span-12 md:col-span-4 lg:col-span-3">
        <BaseCard>
          <div class="text-center">
            <div class="relative inline-block">
              <img
                :src="avatarUrl"
                :alt="auth.user?.name"
                class="w-32 h-32 rounded-full mx-auto"
              >
              <label
                class="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarChange"
                >
                <UserCircleIcon class="w-5 h-5 text-gray-600" />
              </label>
            </div>
            
            <h3 class="mt-4 text-lg font-medium text-gray-900">
              {{ auth.user?.name }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ auth.user?.email }}
            </p>
            
            <div class="mt-2">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-blue-100 text-blue-800': auth.user?.role === 'admin',
                  'bg-green-100 text-green-800': auth.user?.role === 'accountant',
                  'bg-purple-100 text-purple-800': auth.user?.role === 'auditor'
                }"
              >
                {{ auth.user?.role }}
              </span>
            </div>
          </div>
          
          <div class="mt-6 border-t border-gray-200 pt-4">
            <nav class="space-y-1">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg"
                :class="activeTab === tab.key
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                @click="activeTab = tab.key"
              >
                <component
                  :is="tab.icon"
                  class="w-5 h-5 mr-3"
                  :class="activeTab === tab.key ? 'text-primary-500' : 'text-gray-400'"
                />
                {{ tab.label }}
              </button>
            </nav>
          </div>
        </BaseCard>
      </div>
      
      <!-- Contenu principal -->
      <div class="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
        <!-- Profil -->
        <BaseCard v-if="activeTab === 'profile'">
          <template #title>
            Informations personnelles
          </template>
          
          <form v-if="editing" @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInput
                v-model="formData.name"
                label="Nom complet"
                required
              />
              
              <BaseInput
                v-model="formData.email"
                type="email"
                label="Email"
                required
              />
              
              <BaseInput
                v-model="formData.phone"
                label="Téléphone"
              />
              
              <BaseInput
                v-model="formData.company"
                label="Entreprise"
              />
              
              <BaseInput
                v-model="formData.position"
                label="Poste"
              />
            </div>
            
            <div v-if="error" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {{ error }}
            </div>
            
            <div class="flex justify-end space-x-3">
              <BaseButton
                type="button"
                variant="secondary"
                @click="editing = false"
              >
                Annuler
              </BaseButton>
              
              <BaseButton
                type="submit"
                variant="primary"
                :loading="loading"
              >
                Enregistrer
              </BaseButton>
            </div>
          </form>
          
          <div v-else>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt class="text-sm font-medium text-gray-500">Nom complet</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ auth.user?.name }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ auth.user?.email }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Téléphone</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ auth.user?.phone || '—' }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Entreprise</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ auth.user?.company || '—' }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Poste</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ auth.user?.position || '—' }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500">Dernière connexion</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ new Date(auth.user?.lastLogin || '').toLocaleString('fr-FR') }}
                </dd>
              </div>
            </dl>
            
            <div class="mt-6">
              <BaseButton
                variant="primary"
                @click="editing = true"
              >
                Modifier le profil
              </BaseButton>
            </div>
          </div>
        </BaseCard>
        
        <!-- Sécurité -->
        <BaseCard v-if="activeTab === 'security'">
          <template #title>
            Sécurité du compte
          </template>
          
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <BaseInput
              v-model="formData.currentPassword"
              type="password"
              label="Mot de passe actuel"
              required
            />
            
            <BaseInput
              v-model="formData.newPassword"
              type="password"
              label="Nouveau mot de passe"
              required
            />
            
            <BaseInput
              v-model="formData.confirmPassword"
              type="password"
              label="Confirmer le mot de passe"
              required
            />
            
            <div class="mt-6 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">
                    Authentification à deux facteurs
                  </h4>
                  <p class="text-sm text-gray-500">
                    Ajoutez une couche de sécurité supplémentaire à votre compte
                  </p>
                </div>
                <div class="flex items-center">
                  <button
                    type="button"
                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    :class="auth.user?.twoFactorEnabled ? 'bg-primary-600' : 'bg-gray-200'"
                    role="switch"
                    :aria-checked="auth.user?.twoFactorEnabled"
                  >
                    <span
                      class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      :class="auth.user?.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">
                    Sessions actives
                  </h4>
                  <p class="text-sm text-gray-500">
                    Gérez et déconnectez vos sessions actives sur d'autres appareils
                  </p>
                </div>
                <BaseButton variant="secondary">
                  Gérer les sessions
                </BaseButton>
              </div>
            </div>
          </form>
        </BaseCard>
        
        <!-- Préférences -->
        <BaseCard v-if="activeTab === 'preferences'">
          <template #title>
            Préférences
          </template>
          
          <div class="space-y-6">
            <div>
              <label class="text-sm font-medium text-gray-700">Thème</label>
              <BaseSelect
                v-model="preferences.theme"
                :options="[
                  { value: 'light', label: 'Clair' },
                  { value: 'dark', label: 'Sombre' }
                ]"
                class="mt-1"
                @change="updatePreferences"
              />
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-700">Langue</label>
              <BaseSelect
                v-model="preferences.language"
                :options="[
                  { value: 'fr', label: 'Français' },
                  { value: 'en', label: 'English' }
                ]"
                class="mt-1"
                @change="updatePreferences"
              />
            </div>
          </div>
        </BaseCard>
        
        <!-- Notifications -->
        <BaseCard v-if="activeTab === 'notifications'">
          <template #title>
            Préférences de notification
          </template>
          
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">
                  Notifications par email
                </h4>
                <p class="text-sm text-gray-500">
                  Recevez des notifications par email pour les activités importantes
                </p>
              </div>
              <div class="flex items-center">
                <button
                  type="button"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  :class="preferences.notifications ? 'bg-primary-600' : 'bg-gray-200'"
                  role="switch"
                  :aria-checked="preferences.notifications"
                  @click="preferences.notifications = !preferences.notifications; updatePreferences()"
                >
                  <span
                    class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="preferences.notifications ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>