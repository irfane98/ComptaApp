<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const error = ref('')

onMounted(() => {
  // Rediriger si déjà connecté
  if (auth.isAuthenticated) {
    router.push('/')
  }
})

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  
  try {
    await auth.login({
      email: email.value,
      password: password.value,
      remember: remember.value
    })
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-success-50">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="font-heading text-2xl font-bold text-gray-900">
            Connexion
          </h1>
          <p class="mt-2 text-sm text-gray-600">
            Bienvenue sur ComptaApp
          </p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <BaseInput
            v-model="email"
            type="email"
            label="Email"
            placeholder="vous@example.com"
            required
          />
          
          <BaseInput
            v-model="password"
            type="password"
            label="Mot de passe"
            placeholder="••••••••"
            required
          />
          
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="remember"
                class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              >
              <span class="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
            </label>
            
            <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500">
              Mot de passe oublié ?
            </a>
          </div>
          
          <div v-if="error" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {{ error }}
          </div>
          
          <BaseButton
            type="submit"
            variant="primary"
            class="w-full"
            :loading="loading"
          >
            Se connecter
          </BaseButton>
        </form>
        
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Ou continuer avec</span>
            </div>
          </div>
          
          <div class="mt-6 grid grid-cols-2 gap-3">
            <BaseButton
              variant="secondary"
              class="w-full"
            >
              <img
                class="h-5 w-5 mr-2"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
              >
              Google
            </BaseButton>
            
            <BaseButton
              variant="secondary"
              class="w-full"
            >
              <img
                class="h-5 w-5 mr-2"
                src="https://www.svgrepo.com/show/448234/microsoft.svg"
                alt="Microsoft"
              >
              Microsoft
            </BaseButton>
          </div>
        </div>
        
        <p class="mt-4 text-center text-sm text-gray-600">
          Demo: demo@example.com / password
        </p>
      </div>
    </div>
  </div>
</template>