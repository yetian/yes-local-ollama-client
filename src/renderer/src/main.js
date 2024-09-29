import { createApp } from 'vue'
import App from './App.vue'

// import vue router
import router from './router.js'

import './assets/style.css'

const app = createApp(App).use(router)
app.mount('#app')
