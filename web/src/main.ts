import { createApp } from 'vue'
import App from './App.vue'
import { createPiniaStore } from './app/providers/pinia'
import { createAppRouter } from './app/router'
import './style.css'

const app = createApp(App)

app.use(createPiniaStore())
app.use(createAppRouter())

app.mount('#app')
