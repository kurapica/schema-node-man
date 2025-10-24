import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs';

export const routes = [
    {
        path: '/introduce',
        name: "frontend.nav.introduce",
        component: () => import('./components/introduce.vue')
    },
    {
        path: '/type',
        name: "frontend.nav.type",
        component: () => import('./components/schema.vue')
    },
    {
        path: '/app',
        name: "frontend.nav.app",
        component: () => import('./components/appSchema.vue')
    }
]