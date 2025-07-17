<template>
    <el-container style="height: 90vh">
        <el-aside style="height: 80%;width: 10rem;">
            <div class="outline">{{ _L["schema.catalog"] }}</div>
            <el-tree :data="tree" default-expand-all @node-click="onclick">
                <template #default="scope">
                    {{ _L[scope.data.label] }}
                </template>
            </el-tree>
        </el-aside>
        <el-main>
            <section v-for="section in tree" :id="section.id">
                <component v-if="section.com?.value" :is="section.com.value"></component>
                <template v-if="section.children?.length">
                    <section v-for="section2 in section.children" :id="section2.id">
                        <component v-if="section2.com?.value" :is="section.com.value"></component>
                        <template v-if="section2.children?.length">
                            <section v-for="section3 in section2.children" :id="section3.id">
                                <component v-if="section3.com?.value" :is="section.com.value"></component>
                            </section>
                        </template>
                    </section>
                </template>
            </section>
        </el-main>
    </el-container>
</template>

<script lang="ts" setup>
import { generateGuidPart, getLanguage, subscribeLanguage } from 'schema-node'
import { defineAsyncComponent, onUnmounted, ref, type Ref, type Component, shallowRef } from 'vue'
import { _L } from 'schema-node-vue-view'

//#region type
class SectionNode {
    id: string = generateGuidPart()
    label: string
    zh: () => Promise<any>
    en: () => Promise<any>
    com: Ref<Component | null>
    children?: SectionNode[]

    constructor(name: string, nodes?: SectionNode[])
    {
        this.label = `schema.catalog.${name}`
        this.zh = () => import(`@/assets/docs/zh/${name}.vue`)
        this.en = () => import(`@/assets/docs/en/${name}.vue`)
        this.com = shallowRef(null)
        this.children = nodes
    }
}
//#endregion

// Document
const tree: SectionNode[] = [
    new SectionNode("01.intro")
]

//#region Utils
const onclick = (data:any) => {
    const el = window.document.getElementById(data.id)
    if (el) el.scrollIntoView({ behavior: "smooth"})
}

const updateSection = (nodes: SectionNode[]) =>
{
    for(let i = 0; i < nodes.length; i++)
    {
        const node = nodes[i]
        node.com.value = defineAsyncComponent(node[usecn.value ? 'zh' : 'en'])
        if (node.children?.length) updateSection(node.children)
    }
}

// language
const usecn = ref(false)
let langHandler: Function | null = subscribeLanguage(() => {
    usecn.value = getLanguage().startsWith("zh")
    updateSection(tree)
}, true)

onUnmounted(() => langHandler ? langHandler() : null)
//#endregion
</script>

<style lang="scss">
.outline {
  line-height: 50px;
  text-align: center;
  color: #444;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  background-color: white;
}
</style>
