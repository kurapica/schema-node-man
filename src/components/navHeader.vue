<template>
    <el-menu 
        :default-active="activeIndex" 
        class="el-menu-demo" 
        mode="horizontal"
    >
        <router-link v-for="(item, index) in routes" v-bind:key="item.name" :to="item.path">
            <el-menu-item :index="`${index}`">{{ _L[item.name] }}</el-menu-item>
        </router-link>
    </el-menu>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { useRouter } from 'vue-router'
import { routes } from "../routes"
import { isNull } from "schema-node"
import { _L } from "schema-node-vueview"

const router = useRouter()
const activeIndex = ref("0")

onMounted(() => {
    const path = router.currentRoute.value.fullPath
    if (!isNull(path))
    {
        const index = routes.findIndex(r => r.path === path)
        if(!isNull(index) && index >= 0)
        {
            activeIndex.value = `${index}`
            return
        }
    }
    activeIndex.value = `${routes.length - 1}`
    router.push(routes[routes.length - 1].path)
})
</script>