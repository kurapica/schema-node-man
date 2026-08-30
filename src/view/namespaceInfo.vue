<template>
  <el-form v-if="showNode" :model="showNode.rawValue as any" label-width="200px" label-position="left">
    <a v-if="editable" :style="{ 'color': 'green', 'position': 'absolute', 'top': '24px', 'right': '24px', 'text-align': text === true ? 'center' : text }",
        href="javascript:void(0)"
        @click="handleEdit()">
        {{ _L["frontend.view.edit"] }}
    </a>
    <el-form-item v-for="node in displayNode" :key="node.id" :label="_L(node.getPropertyValue(Display) ?? node.name)" :prop="node.id">
      <schemaView :node="node" readonly text="left" :header-cell-style="tableHeaderCellStyle"/>
    </el-form-item>

    <!-- namespace editor -->
    <el-drawer v-model="showNamespaceEditor" :title="operation" direction="rtl" size="100%" append-to-body
      @closed="closeNamespaceEditor">
      <el-container class="main" style="height: 80vh;">
        <el-main>
          <el-form v-if="showNode" ref="editorRef" :model="showNode.rawValue!" label-position="left" style="width: 100%; height: 90%;" label-width="300px" >
            <div class="draw-view">
              <schema-view :node="(showNode as StructNode)" :in-form="SchemaNodeFormType.ExpandAll" text="left" :header-cell-style="tableHeaderCellStyle"></schema-view>
            </div>
          </el-form>
        </el-main>
        <el-footer>
          <el-button type="primary" @click="confirmNameSpace">{{ _L["frontend.view.save"] }}</el-button>
          <el-button @click="showNamespaceEditor = false">{{ _L["frontend.view.cancel"] }}</el-button>
        </el-footer>
      </el-container>
    </el-drawer>
  </el-form>
</template>

<script lang="ts" setup>
import { Attach, DataNode, Display, getCachedNodeType, getNodeSchemaName, getNodeType, INamespaceNodeType, isEmpty, LocaleString, NodeSchema, NS_SYSTEM_SCHEMA_NODE, ReadOnly, ScalarNode, SchemaLoadState, StructNode, StructType } from 'schema-node-core';
import { _L, SchemaNodeFormType, schemaView } from 'schema-node-vue-view';
import { onMounted, onUnmounted, ref, shallowRef, toRaw } from 'vue';
import { ElForm, ElMessage } from 'element-plus'
import { getSchemaServerProvider } from '../schema/provider/schemaServerProvider';
import { removeStorageSchema, saveStorageSchema } from '../schema';
import { logger } from '../utility/logger';

const props = defineProps<{ type?: string, text?: any }>()
const showNode = shallowRef<DataNode | undefined>(undefined)
const displayNode = shallowRef<DataNode[]>([])
const editable = ref(false)
const emit = defineEmits(["update"])

const tableHeaderCellStyle = {
  backgroundColor: 'var(--app-surface-muted)',
  color: 'var(--app-text)',
  borderColor: 'var(--app-border)'
};

const blacklist = ["exps", "relations"]

const show = async() => {
  if (showNode.value) return;
  const type = props.type ? await getNodeType(props.type) : undefined;
  if (!type) return;

  const nodeSchemaType = await getNodeType(`${NS_SYSTEM_SCHEMA_NODE}.schema`) as StructType;
  if (!nodeSchemaType) return;

  const node = nodeSchemaType.create(type.getNodeSchema()) as StructNode;
  editable.value = !(type.loadState & SchemaLoadState.System)
  showNode.value = node
  const nodes: DataNode[] = [];
  for (let f of node.fields) {
    if (blacklist.includes(f.name!) || isEmpty(f.rawValue)) continue;

    const attach = f.type.getPropertyValue(Attach) as string;
    if (attach && attach !== type.kind) continue;

    if (attach)
    {
      if (f instanceof StructNode)
        nodes.push(...Array.from(f.fields).filter(f => !blacklist.includes(f.name!) || !isEmpty(f.rawValue)));
    }
    else
      nodes.push(f);
  }
  displayNode.value = nodes

  emit("update")
}

onMounted(() => show())
onUnmounted(() => showNode.value?.dispose())

//#region Schema Edit

const editorRef = ref<InstanceType<typeof ElForm>>()
const showNamespaceEditor = ref(false)
const operation = ref("")
let isNewType = false

const namesapceWatchHandler: Function[] = []

// update
const handleEdit = async () => {
  showNamespaceEditor.value = true

  const displayField = showNode.value!.getAccessValue("display") as StructNode
  const namespaceField = showNode.value!.getAccessValue("namespace") as ScalarNode
  const nameField = showNode.value!.getAccessValue("name") as ScalarNode

  const refreshOperation = () => {
    operation.value = _L.value["frontend.view.edit"] + " " + _L.value(displayField.value as LocaleString ?? getNodeSchemaName(showNode.value?.rawValue as NodeSchema) ?? "")
}

  namesapceWatchHandler.push(displayField.subscribe(refreshOperation));
  namesapceWatchHandler.push(namespaceField.subscribe(refreshOperation, true));
  namesapceWatchHandler.push(nameField.subscribe(refreshOperation, true));
}

// delete
const handleDelete = async (row: any) => {
  const nodeType = await getNodeType(getNodeSchemaName(row));

  if (nodeType?.isUsed || (nodeType?.loadState ?? 0) & SchemaLoadState.System) {
    ElMessage.error(_L.value["frontend.view.cantdelschema"])
    return
  }
  if ((row.loadState || 0) & SchemaLoadState.Service) {
    const provider = getSchemaServerProvider()
    if (provider) {
      try {
        const res = await provider.deleteSchema(row.name)
        if (!res) {
          ElMessage.error(_L.value["frontend.view.error"])
          return
        }
      }
      catch (ex: any) {
        if (ex && ex.status === 403) {
          ElMessage.error(_L.value["frontend.view.nopermission"])
          return
        }
        ElMessage.error(_L.value["frontend.view.error"])
        console.error(ex)
        return
      }
    }
  }
  removeStorageSchema(getNodeSchemaName(row));
  (nodeType?.namespace as INamespaceNodeType)?.removeSubNodeSchema(row.name);
}

// save
const confirmNameSpace = async () => {
  try
  {
    const res = await editorRef.value!.validate();
    if (!res) {
      ElMessage.error(_L.value["frontend.view.error"])
      return
    }
  }
  catch (ex: any) {
    ElMessage.error(_L.value["frontend.view.error"])
    return
  }
  
  const node = toRaw(showNode.value!)
  if (!node.isValid) {
    ElMessage.error(_L.value["frontend.view.error"])
    return
  }

  const data = node.submitValue as NodeSchema;
  const schema = getCachedNodeType(getNodeSchemaName(data))

  if (isNewType && (schema || await getNodeType(getNodeSchemaName(data)))) {
    ElMessage.error(_L.value["frontend.view.schemanameexists"])
    return
  }

  logger.verbose("[Save][Schema]", getNodeSchemaName(data), data)

  if (!schema || ((schema.loadState ?? 0) & SchemaLoadState.Service)) {
    const provider = getSchemaServerProvider()
    if (provider) {
      try {
        const res = await provider.saveSchema(data)
        if (!res) {
          ElMessage.error(_L.value["frontend.view.error"])
          return
        }
        data.loadState = (data.loadState ?? 0) | SchemaLoadState.Service
      }
      catch (ex: any) {
        if (ex && ex.status === 403) {
          ElMessage.error(_L.value["frontend.view.nopermission"])
          return
        }
        ElMessage.error(_L.value["frontend.view.error"])
        console.error(ex)
        return
      }
    }
  }

  data.loadState = (data.loadState ?? 0) | SchemaLoadState.FrontEnd;

  const namespace = (await getNodeType(data.namespace ?? '')) as INamespaceNodeType
  namespace?.saveSubNodeSchema(data)

  saveStorageSchema(data)
  closeNamespaceEditor()
  showNamespaceEditor.value = false
}

// close
const closeNamespaceEditor = () => {
  namesapceWatchHandler.forEach(watcher => watcher())
  namesapceWatchHandler.splice(0, namesapceWatchHandler.length)
}

//#endregion

</script>
