<template>
    <section style="width: 100%;">
        <schema-view
            style="width: 100%;"
            :key="localeNode.guid"
            :node="keyNode"
            :plainText="plainText"
            v-bind="$attrs">
            <template #append>
                <a href="javasscript:void(0)" @click="openTrans">{{ _L["schema.designer.tran"] }}</a>
            </template>
        </schema-view>

        <template v-if="keyNode.readonly && plainText">
            <a href="javasscript:void(0)" style="position: absolute; right: 1rem" @click="openTrans">{{ _L["schema.designer.tran"] }}</a>
        </template>

        <!-- show trans -->
        <el-drawer v-model="showTrans" :title="_L['schema.designer.tran'] + ` ${keyNode.rawData || ''}`" direction="rtl" size="50%"
            destroy-on-close
            append-to-body>
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <el-form :data="transNode">
                        <schema-view :node="transNode" :plainText="plainText" v-bind="$attrs"></schema-view>
                    </el-form>
                </el-main>
                <el-footer>
                    <br/>
                    <el-button @click="showTrans = false">{{ _L["schema.designer.close"] }}</el-button>
                </el-footer>
            </el-container>
        </el-drawer>
    </section>
</template>

<script lang="ts" setup>
import { StructNode } from 'schema-node'
import { _L, schemaView } from 'schema-node-vueview'
import { ref, toRaw } from 'vue'

const props = defineProps<{
    /**
     * Struct Schema node
     */
    node: StructNode,

    /**
     * Display readon only value as plain text
     */
    plainText?: any
}>()

const localeNode = toRaw(props.node) as StructNode
const keyNode = localeNode.getField("key")
const transNode = localeNode.getField("trans")

const showTrans = ref(false)
const openTrans = () => showTrans.value = true

</script>