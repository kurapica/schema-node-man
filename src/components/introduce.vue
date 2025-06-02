<template>
    <markdown
        :zh="zhIntro"
        :en="enIntro"
    ></markdown>
</template>

<script lang="ts" setup>
import enIntro from "../assets/docs/introduce.en.md?raw"
import zhIntro from "../assets/docs/introduce.zh.md?raw"
</script>