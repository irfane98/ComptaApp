import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../database/init'

interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  website?: string
  siret?: string
  vatNumber?: string
  rib?: {
    bank: string
    iban: string
    bic: string
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const defaultCurrency = ref('XAF')
  const defaultLanguage = ref('fr')
  const companyInfo = ref<CompanyInfo>({
    name: '',
    address: '',
    phone: '',
    email: ''
  })
  
  const loadSettings = async () => {
    const settings = await db.getData('settings')
    if (settings) {
      defaultCurrency.value = settings.defaultCurrency
      defaultLanguage.value = settings.defaultLanguage
      companyInfo.value = settings.companyInfo
    }
  }
  
  const saveSettings = async () => {
    await db.saveData('settings', {
      defaultCurrency: defaultCurrency.value,
      defaultLanguage: defaultLanguage.value,
      companyInfo: companyInfo.value
    })
  }
  
  return {
    defaultCurrency,
    defaultLanguage,
    companyInfo,
    loadSettings,
    saveSettings
  }
})