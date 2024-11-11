import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { db } from './database/init'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Initialiser la base de données avant de monter l'application
db.init().then(() => {
  app.mount('#app')
})