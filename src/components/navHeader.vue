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

const router = useRouter()
const activeIndex = ref(`${routes.length-1}`)

onMounted(() => router.push(routes[routes.length-1].path))
</script>