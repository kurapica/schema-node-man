import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from "element-plus"
import { createRouter, createWebHashHistory } from 'vue-router'
import 'element-plus/dist/index.css'
import { routes } from './routes'
import Markdown from './components/markdown.vue'
import "@/assets/locale/zhCN"
import "@/assets/example/schema"

const app = createApp(App)

// Router
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: () => import("./components/homePage.vue"),
            children: routes
        }
    ]
})
app.use(router)
app.config.globalProperties.$router = router

// UI
app.use(ElementPlus)
app.component("Markdown", Markdown)

// Start
app.mount('#app')
