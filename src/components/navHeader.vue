<template>
    <el-menu 
        :default-active="activeIndex" 
        class="el-menu-demo" 
        mode="horizontal"
    >
        <router-link v-for="(item, index) in routes" v-bind:key="item.name" :to="item.path">
            <el-menu-item :index="`${index}`">{{ item.name }}</el-menu-item>
        </router-link>
    </el-menu>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { useRouter } from 'vue-router'
import { routes } from "../routes"
import { isNull } from "schema-node"

const router = useRouter()
const activeIndex = ref("0")

onMounted(() => {
    const path = router.currentRoute.value.fullPath
    if (!isNull(path))
    {
        const index = routes.findIndex(r => r.path === path)
        if(!isNull(index))
        {
            activeIndex.value = `${index}`
            return
        }
    }
    router.push(routes[0].path)
})
</script>