import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import locale from 'element-plus/es/locale/lang/zh-cn'
import ElementPlus from "element-plus"
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createRouter, createWebHashHistory } from 'vue-router'
import 'element-plus/dist/index.css'
import { routes } from './routes'
import Markdown from './components/markdown.vue'
import "./assets/locale/zhCN"
import "./assets/locale/enUS"
import "./auth"
import { setLanguage } from 'schema-node'
import { reloadStorageSchemas } from './schema'
import { reloadStorageAppSchemas } from './appSchema'
import { setSchemaSite } from './schemaServerProvider'

const app = createApp(App)

// language
if (localStorage["lang"])
    setLanguage(localStorage["lang"])

// schema init
reloadStorageSchemas()
reloadStorageAppSchemas()
if (document.querySelector('meta[name="schema-embedded"]')?.getAttribute('content') === 'true') {
    setSchemaSite(document.querySelector('meta[name="schema-api-base-url"]')?.getAttribute('content') || '/schema')
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
app.use(ElementPlus, { locale})
app.component("Markdown", Markdown)

// Start
app.mount('#app')
