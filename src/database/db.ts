import localforage from 'localforage'

// Configuration de localforage pour la persistance des données
localforage.config({
  name: 'compta-app',
  storeName: 'accounting_data'
})

export const db = {
  async saveData(key: string, data: any) {
    try {
      await localforage.setItem(key, data)
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde des données ${key}:`, error)
    }
  },

  async getData(key: string) {
    try {
      return await localforage.getItem(key)
    } catch (error) {
      console.error(`Erreur lors de la récupération des données ${key}:`, error)
      return null
    }
  },

  async removeData(key: string) {
    try {
      await localforage.removeItem(key)
    } catch (error) {
      console.error(`Erreur lors de la suppression des données ${key}:`, error)
    }
  }
}