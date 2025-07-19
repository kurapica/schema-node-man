export const routes = [
    {
        path: '/introduce',
        name: "schema.nav.introduce",
        component: () => import('./components/introduce.vue')
    },
    //{
    //    path: '/tryit',
    //    name: "schema.nav.tryit",
    //    component: () => import('./components/tryit.vue')
    //},
    {
        path: '/type',
        name: "schema.nav.type",
        component: () => import('./components/schema.vue')
    }
]