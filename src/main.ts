import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from "element-plus"
import { createRouter, createWebHashHistory } from 'vue-router'
import 'element-plus/dist/index.css'
import { routes } from './routes'
import Markdown from './components/markdown.vue'
import "@/assets/locale/zhCN"
import "@/assets/locale/enUS"
import { setLanguage } from 'schema-node'
import { reloadStorageSchemas } from '@/schema'
import { reloadStorageAppSchemas } from './appSchema'
import "@/assets/example/schema"
import { setSchemaSite } from './schemaServerProvider'

const app = createApp(App)

// language
if (localStorage["lang"])
    setLanguage(localStorage["lang"])

// schema init
reloadStorageSchemas()
reloadStorageAppSchemas()
if (document.querySelector('meta[name="schema-embedded"]')?.getAttribute('content') === 'true') {
    setSchemaSite(document.querySelector('meta[name="api-base-url"]')?.getAttribute('content') || '/schema')
}

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
