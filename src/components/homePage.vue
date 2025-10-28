<template>
    <el-container>
        <el-header style="position: relative;">
            <nav-header></nav-header>
            <p v-if="!isEmbedded" style="position: absolute; top: 0rem; right: 1rem">
                <el-input v-model="url" :placeholder="_L['frontend.server.url']" style="display:inline;margin-right: 2rem" @change="saveServer"></el-input>
                <a href="javascript:void(0)" @click="toggle('enUS')" :class="lang =='enUS' ? 'active' : 'deactive'">EN</a>
                |
                <a href="javascript:void(0)" @click="toggle('zhCN')" :class="lang =='zhCN' ? 'active' : 'deactive'">中</a>
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
import { _L } from "schema-node-vueview"
import { getSchemaSite, setSchemaSite } from "@/schemaServerProvider"

const isEmbedded = document.querySelector('meta[name="schema-embedded"]')?.getAttribute('content') === 'true'

const lang = ref(getLanguage())
const toggle = (l: string) => {
    lang.value = setLanguage(l)
    localStorage["lang"] = lang.value
}

const url = ref(getSchemaSite())
const saveServer = () => setSchemaSite(url.value)
</script>

<style lang="css" scoped>
.active{
    color: green
}
.deactive{
    color: gray
}
</style>