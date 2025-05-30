<template>
    <markdown v-if="lang=='zh'">
        {{ zhIntro }}
    </markdown>
    <markdown v-else>
        {{ enIntro }}
    </markdown>
</template>

<script lang="ts" setup>
import { getLanguage, subscribeLanguage } from "schema-node"
import enIntro from "../assets/docs/introduce.en.md?raw"
import zhIntro from "../assets/docs/introduce.zh.md?raw"
import { onUnmounted, ref } from "vue";

const lang = ref(getLanguage())
const lanHandler = subscribeLanguage((n: string) => {
    lang.value = n
})
onUnmounted(lanHandler)
</script>