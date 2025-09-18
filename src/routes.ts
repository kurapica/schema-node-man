import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs';

export const routes = [
    {
        path: '/introduce',
        name: "schema.nav.introduce",
        component: () => import('./components/introduce.vue')
    },
    {
        path: '/type',
        name: "schema.nav.type",
        component: () => import('./components/schema.vue')
    },
    {
        path: '/app',
        name: "schema.nav.app",
        component: () => import('./components/appSchema.vue')
    }
]