<template>
    <el-container>
        <el-header>
            <nav-header></nav-header>
        </el-header>
        <el-main style="height: 100%;">
            <router-view></router-view>
        </el-main>
    </el-container>
</template>

<script lang="ts" setup>
import NavHeader from "./navHeader.vue"
</script>