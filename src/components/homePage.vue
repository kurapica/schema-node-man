<template>
    <el-container style="height: 100vh;">
        <el-header style="position: relative;">
            <nav-header></nav-header>
            <p style="position: absolute; top: 0rem; right: 2rem">
                <el-switch
                    v-model="isDark"
                    :active-text="_L['frontend.dark']"
                    :inactive-text="_L['frontend.light']"
                    @change="toggleTheme"
                    style="margin-right: 2rem"
                />
                <el-input v-if="!isEmbedded" v-model="url" :placeholder="_L['frontend.server.url']" style="display:inline;margin-right: 2rem" @change="saveServer"></el-input>
                <a href="javascript:void(0)" v-if="isEmbedded || url" style="margin-right: 2rem;" @click="openAuth">{{_L["frontend.auth"]}}</a>
                <a href="javascript:void(0)" @click="toggle('enUS')" :class="lang =='enUS' ? 'active' : 'deactive'">EN</a>
                |
                <a href="javascript:void(0)" @click="toggle('zhCN')" :class="lang =='zhCN' ? 'active' : 'deactive'">中</a>
            </p>
        </el-header>
        <el-main style="height: 100%;">
            <router-view></router-view>
        </el-main>

        <!-- auth header items -->
        <el-drawer v-model="showAuth" :title="_L['frontend.auth']" direction="rtl" size="80%" append-to-body>
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <schema-view v-if="authNode" :key="authNode.id" :node="(authNode as StructNode)" :plainText="false" />
                </el-main>
                <el-footer>
                    <br/>
                    <el-button type="primary" @click="saveAuth">{{ _L["frontend.view.save"] }}</el-button>
                    <el-button @click="showAuth = false">{{ _L["frontend.view.close"] }}</el-button>
                </el-footer>
            </el-container>
        </el-drawer>
    </el-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue"
import NavHeader from "./navHeader.vue"
import { setLanguage, getLanguage, StructNode, getNodeType, StructType } from "schema-node-core"
import { _L } from "schema-node-vueview"
import { getSchemaSite, setSchemaSite } from "../schema/provider/schemaServerProvider"
import { getFrontendAuth, saveFrontendAuth } from "../utility/auth"
import { schemaView } from "schema-node-vueview"
import { FrontendAuth } from "../schema/auth.js"

const isEmbedded = document.querySelector('meta[name="schema-embedded"]')?.getAttribute('content') === 'true'

// 主题切换
const isDark = ref(localStorage.getItem('themeMode') === 'dark')
const applyTheme = (mode: 'dark' | 'light') => {
    document.documentElement.setAttribute('data-theme', mode)
    document.documentElement.classList.toggle('dark', mode === 'dark')
    document.body.setAttribute('data-theme', mode)
}

const toggleTheme = () => {
    const mode = isDark.value ? 'dark' : 'light'
    applyTheme(mode)
    localStorage.setItem('themeMode', mode)
}
onMounted(() => {
    const mode = (localStorage.getItem('themeMode') || 'light') as 'dark' | 'light'
    applyTheme(mode)
    isDark.value = mode === 'dark'
})

const lang = ref(getLanguage())
const toggle = (l: string) => {
    lang.value = setLanguage(l)
    localStorage["lang"] = lang.value
}

const url = ref(getSchemaSite())
const saveServer = () => setSchemaSite(url.value)

// auth
const showAuth = ref(false)
const authNode = ref<StructNode | null>(null)
const openAuth = async () => {
    authNode.value?.dispose();
    authNode.value = null;
    showAuth.value = true;
    const type = await getNodeType('frontend.auth') as StructType;
    authNode.value = type.create(getFrontendAuth());
}
const saveAuth = () => {
    saveFrontendAuth(authNode.value?.submitValue as FrontendAuth)
    showAuth.value = false
    authNode.value?.dispose()
    authNode.value = null
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
