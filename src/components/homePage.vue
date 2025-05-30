<template>
    <el-container>
        <el-header style="position: relative;">
            <nav-header></nav-header>
            <p style="position: absolute; top: 0rem; right: 1rem">
                <a href="javascript:void(0)" @click="toggle('en')" :class="lang=='en' ? 'active' : 'deactive'">EN</a>
                |
                <a href="javascript:void(0)" @click="toggle('zh')" :class="lang=='zh' ? 'active' : 'deactive'">中</a>
            </p>
        </el-header>
        <el-main style="height: 100%;">
            <router-view></router-view>
        </el-main>
    </el-container>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import NavHeader from "./navHeader.vue"
import { setLanguage, getLanguage } from "schema-node"

const lang = ref(getLanguage())

const toggle = (l: string) => {
    setLanguage(l)
    lang.value = getLanguage()
}
</script>

<style lang="css" scoped>
.active{
    color: green
}
.deactive{
    color: gray
}
</style>