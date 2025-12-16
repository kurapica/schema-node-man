<template>
  <table-view :node="argsNode" no-add no-del :in-form="SchemaNodeFormType.ExpandAll" plain-text="left"></table-view>
</template>

<script setup lang="ts">
import { ArrayNode, getSchema, NS_SYSTEM_STRING, StructNode, RelationType, NS_SYSTEM_ARRAY, ScalarNode, type INodeSchema, isEqual, debounce, type AnySchemaNode, isNull } from 'schema-node'
import { onMounted, onUnmounted, toRaw } from 'vue'
import { SchemaNodeFormType, tableView } from 'schema-node-vueview'
import { getAppSchema } from 'schema-node'
import { specialFuncRefresh, type ArgInfo } from '../specialFuncHandler'

const props = defineProps<{ node: ArrayNode }>()
const argsNode = toRaw(props.node)

let typeHandler: Function | undefined = undefined
let returnHandler: Function | undefined = undefined
let funcHandler: Function | undefined = undefined
let argsHandler: Function | undefined = undefined
let fieldHandler: Function | undefined = undefined

onMounted(async () => {
  const relationInfo = argsNode.parent as StructNode
  const typeField = relationInfo.getField("type")! as ScalarNode
  const returnField = relationInfo.getField("return")! as ScalarNode
  const funcField = relationInfo.getField("func")! as ScalarNode

  let typeMap = new Map<string, INodeSchema>()
  let parent: AnySchemaNode | undefined = relationInfo
  let app: string | undefined = undefined
  while (parent) {
    if (parent.config.type === "system.schema.appfieldschema") {
      app = (parent as StructNode).getField("app")?.rawData
      break
    }
    else if (parent.config.type === "system.schema.appschema") {
      app = (parent as StructNode).getField("name")?.rawData
      break
    }
    else if (parent.config.type === "system.schema.structschema") {
      const fieldsNode = (parent as StructNode).getField("fields") as ArrayNode
      fieldHandler = fieldsNode.subscribe(async () => {
        typeMap.clear()
        for (const field of fieldsNode.elements as StructNode[]) {
          const fname = field.getField("name")?.rawData
          const ftype = field.getField("type")?.rawData
          if (fname && ftype) {
            const fschema = await getSchema(ftype)
            if (fschema)
              typeMap.set(fname, fschema)
          }
        }
      }, true)
      break
    }
    parent = parent.parent
  }

  if (app) {
    let appFields = (await getAppSchema(app))?.fields || []
    for (const fld of appFields) {
      const fschema = await getSchema(fld.type)
      if (fschema) typeMap.set(fld.name, fschema)
    }
  }

  const refresh = async () => {
    const type = typeField.rawData
    const ret = returnField.rawData
    const func = funcField.rawData
    const schema = func ? await getSchema(func) : null
    const args = schema?.func?.args || []
    const generic = schema?.func?.generic ? (Array.isArray(schema.func.generic) ? [...schema.func.generic] : [schema.func.generic]) : []

    // entrys for whitelist, maybe more common check later
    const matchEntrys = func == "system.conv.assign" && type == RelationType.WhiteList

    if (schema?.func?.return && /^[tT]\d*$/.test(schema.func.return)) {
      const gidx = schema.func.return.length > 1 ? parseInt(schema.func.return.substring(1)) - 1 : 0
      if (ret) generic[gidx] = ret
    }

    let rarglen = schema?.func?.args.length || 0
    let farglen = rarglen

    // params support
    if (farglen && schema?.func?.args[farglen - 1].params) {
      for (let i = argsNode.elements.length; i >= farglen; i--) {
        const ele = argsNode.elements[i - 1] as StructNode
        const { name, value } = ele.rawData
        if (!isNull(name) || !isNull(value)) {
          farglen = i + 1
          break
        }
      }
    }

    if (argsNode.elements.length > farglen) {
      argsNode.delRows(farglen, argsNode.elements.length - farglen)
    }
    else if (argsNode.elements.length < farglen) {
      while (argsNode.elements.length < farglen)
        argsNode.addRow()
    }

    const specials: ArgInfo[] = func && specialFuncRefresh[func]
      ? await specialFuncRefresh[func](funcField, argsNode.elements as StructNode[], typeMap, ret)
      : []

    for (let i = 0; i < farglen; i++) {
      const row = argsNode.elements[i] as StructNode
      const arg = i < args.length ? args[i] : args[args.length - 1]
      const aschema = await getSchema(arg.type, generic)
      if (matchEntrys) {
        row.getField("type")!.data = NS_SYSTEM_ARRAY
      }
      else {
        row.getField("type")!.data = aschema?.name || NS_SYSTEM_STRING
      }
      if (row.getField("label"))
        row.getField("label")!.data = specials[i]?.display || arg.name

      // value field
      const valueField = row.getField("value") as ScalarNode
      if (aschema?.name === "system.schema.apptarget") {
        if (!valueField.rule.whiteList?.length) {
          valueField.rule.whiteList = ["00000000-0000-0000-0000-000000000000"]
          valueField.validate().then(() => valueField.notifyState())
        }
      }
      else if (!isEqual(specials[i]?.whiteList, valueField.rule.whiteList)) {
        if (valueField.config.type !== row.getField("type")!.data) {
          const trow = row
          const w = specials[i]?.whiteList
          setTimeout(() => {
            const vField = trow.getField("value") as ScalarNode
            vField.rule.whiteList = w
            vField.validate().then(() => valueField.notifyState())
          }, 300);
        }
        else {
          valueField.rule.whiteList = specials[i]?.whiteList
          valueField.validate().then(() => valueField.notifyState())
        }
      }
    }
  }

  typeHandler = typeField.subscribe(refresh)
  returnHandler = returnField.subscribe(refresh)
  funcHandler = funcField.subscribe(refresh)
  argsHandler = argsNode.subscribe(debounce(refresh, 50), true)
})

onUnmounted(() => {
  if (typeHandler) typeHandler()
  if (returnHandler) returnHandler()
  if (funcHandler) funcHandler()
  if (argsHandler) argsHandler()
  if (fieldHandler) fieldHandler()
})
</script>