export const routes = [
    {
        path: '/introduce',
        name: "Introduce",
        component: () => import('./components/introduce.vue')
    },
    {
        path: '/tryit',
        name: "Try it",
        component: () => import('./components/tryit.vue')
    }
]