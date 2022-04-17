import { createApp } from 'vue'
import App from './App.vue'
import 'normalize.css/normalize.css'
import router from '@/routers'

createApp(App).use(router).mount('#app')
