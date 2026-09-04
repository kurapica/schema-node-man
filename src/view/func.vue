<template>
  <section>
    <!-- other fields -->
    <template v-for="other in others" :key="other.name">
      <schema-view :node="other" :readonly="readonly" :text="text"
        :in-form="getSubNodeFormType(other, props.inForm, skin)" :skin="skin" :debug="debug" />
    </template>

    <!-- return type -->
    <schema-view :node="ret" :readonly="readonly" :text="text" :in-form="getSubNodeFormType(ret, props.inForm, skin)" :skin="skin" :debug="debug" />

    <!-- args -->
    <el-form-item :key="args.id" :prop="args.access">
      <template #label>
        <span><span v-if="args.require" style="color: #f56c6c; font-size: 14px"> * </span>{{ _L(args.getPropertyValue(Display) ?? args.name) }} </span>
      </template>
      <div class="func-arg-list" style="width: 100%;">
        <template v-if="!state.arglen && !state.readonly">
          <el-button type="primary" @click="args.addRow()">{{ _L["frontend.view.new"] }}</el-button>
        </template>
        <div v-for="i in state.arglen" class="func-arg" style="display: grid; grid-template-columns: repeat(2, 48%); grid-gap: 12px">
          <el-card class="box-card" shadow="hover" :style="{ ['background-color']: argColor[i - 1] }">
            <schema-view v-if="args.at(i - 1)" :key="args.at(i - 1)!.id" :node="args.at(i - 1)" :in-form="SchemaNodeFormType.Expand2" :readonly="readonly" text="left" :debug="debug" label-width="160px"></schema-view>
            <div v-if="!state.readonly" class="bottom clearfix">
              <el-button type="primary" @click="args.addRow(i)">{{ _L["frontend.view.new"] }}</el-button>
              <el-button type="danger" style="float: right" @click="args.delRows(i - 1)">{{ _L["frontend.view.delete"] }}</el-button>
            </div>
          </el-card>
          <el-card shadow="hover">
            <el-form v-if="argNodes.length >= i && argNodes[i - 1].node" :data="argNodes[i - 1].node?.rawValue">
              <template v-if="!argNodes[i - 1].showdata">
                <schema-view :key="argNodes[i - 1].node!.id" :node="argNodes[i - 1].node" :in-form="SchemaNodeFormType.Expand2"></schema-view>
                <br />
                <br />
                <el-button type="info" class="bottom clearfix" @click="toggleShow(i - 1)">{{_L["frontend.view.showdata"] }}</el-button>
              </template>
              <template v-else>
                <pre>{{ argNodes[i - 1].node?.rawValue }}</pre>
                <br />
                <el-button type="info" class="bottom clearfix" @click="toggleShow(i - 1)">{{_L["frontend.view.showform"] }}</el-button>
              </template>
            </el-form>
          </el-card>
        </div>
      </div>
    </el-form-item>

    <!-- Exps -->
    <el-form-item :key="exps.id" :prop="exps.access">
      <template #label>
        <span><span v-if="exps.require" style="color: #f56c6c; font-size: 14px"> * </span>{{ _L(exps.getPropertyValue(Display) ?? exps.name) }}
        </span>
      </template>
      <div class="func-arg-list" style="width: 100%;">
        <template v-if="!state.explen && !state.readonly">
          <el-button type="primary" @click="exps.addRow()">{{ _L["frontend.view.new"] }}</el-button>
        </template>
        <div v-for="i in state.explen" class="func-arg"
          style="display: grid; grid-template-columns: repeat(2, 48%); grid-gap: 12px">
          <el-card class="box-card" shadow="hover" :style="{ ['background-color']: color[i - 1] }">
            <schema-view v-if="exps.at(i - 1)" :key="exps.at(i - 1)!.id"
              :node="exps.at(i - 1)" :in-form="SchemaNodeFormType.Expand2" text="left"
              style="width: 100%;" :debug="debug"  label-width="160px"></schema-view>
            <div v-if="!state.readonly" class="bottom clearfix">
              <el-button type="primary" @click="exps.addRow(i)">{{ _L["frontend.view.new"] }}</el-button>
              <el-button type="danger" style="float: right" @click="exps.delRows(i - 1)">{{
                _L["frontend.view.delete"]
                }}</el-button>
            </div>
          </el-card>
          <el-card shadow="hover">
            <pre v-if="result.length >= i">{{ result[i - 1] instanceof Date ? result[i - 1].toISOString() : result[i - 1] }}
        </pre>
          </el-card>
        </div>
      </div>
    </el-form-item>
  </section>
</template>

<script setup lang="ts">
import { _LS, DataNode, debounce, Display, FuncExp, FunctionNode, FunctionType, getNodeType, isNull, NS_SYSTEM_LIST, ReadOnly, Require, SCHEMA_KIND_ARRAY, splitString, ValueType } from 'schema-node-core'
import { onMounted, onUnmounted, reactive, ref, shallowRef, toRaw } from 'vue'
import { SchemaNodeFormType } from '../../../schema-node-vue-view/src/enum/formType';
import { subscribeAncestorProperty } from '../../../schema-node-vue-view/src/utility/toolset';
import { _L, getSubNodeFormType } from 'schema-node-vue-view';
import { schemaView } from 'schema-node-vue-view';

defineOptions({ inheritAttrs: false })

// ── Template ──────────────────────────────────────────────────────
const props = defineProps<{
  node: FunctionNode,
  readonly?: boolean,
  text?: boolean | 'left' | 'right' | 'center',
  inForm?: SchemaNodeFormType,
  debug?: boolean,
  skin?: string
}>();
const node = (toRaw(props.node) as FunctionNode)!;
const ret = node.return;
const args = node.args;
const exps = node.exps;
const others = node.others;

// ── UI State ──────────────────────────────────────────────────────
const state = reactive({
  readonly: false,
  arglen: 0,
  explen: 0,
})
const argNodes = shallowRef<{ node?: DataNode, showdata: boolean }[]>([])
const result = ref<any[]>([])
const argColor = ref<string[]>([])
const color = ref<string[]>([])

const toggleShow = (i: number) => {
  argNodes.value[i].showdata = !argNodes.value[i].showdata;
  argNodes.value = [...argNodes.value];
}

// ── Life Cycle ────────────────────────────────────────────────────
/** Subscription */
const subs: Function[] = []

const doCalc = debounce(async() => {
  const datas: Record<string, any> = {};

  // args
  for (let i = 0; i < args.length; i++) {
    const arg = args.at(i);
    const name = arg?.getAccessValue('name')?.getValue() as string ?? '';
    if (name) datas[name] = argNodes.value[i]?.node?.getValue();
  }

  // exps
  const newResult: any[] = [];
  for (let i = 0; i < exps.length; i++) {
    const exp = exps.at(i)?.getValue() as FuncExp;
    if (!exp?.name || !exp.call?.mode || !exp.call?.func) {
      newResult.push(null);
      continue;
    }

    // calc
    const funcType = await getNodeType(exp.call?.func);
    if (!(funcType instanceof FunctionType)) {
      newResult.push(null);
      continue;
    }
    
    // call args
    const funcArgs: any[] = [];
    let processAble = true;
    for (let i = 0; i < funcType.args.length; i++) {
      const arg = funcType.args.at(i)!;
      for (let j = i; j < (arg.variadic ? exp.call?.args?.length ?? 0 : i + 1); j++)
      {
        const callArg = exp.call?.args?.at(j);
        if (isNull(callArg?.source) && isNull(callArg?.value)) {
          if (arg.require) {
            processAble = false;
            break;
          }
          funcArgs.push(null);
          continue;
        }
        if (!isNull(callArg!.source)) {
          const paths = splitString(callArg!.source!);
          let val = datas;
          for (const path of paths) {
            val = val?.[path];
          }
          funcArgs.push(val ?? null);
        }
        else
          funcArgs.push(callArg!.value);
      }
    }

    if (processAble) {
      const retVal = await funcType.call(funcArgs, exp.call.mode);
      newResult.push(retVal);
      datas[exp.name] = retVal;
    }
    else
      newResult.push(null);
  }

  result.value = newResult;
}, 500);

onMounted(() => {
  if (props.readonly) {
    state.readonly = true
  } else {
    subs.push(subscribeAncestorProperty(node, ReadOnly, (values: boolean[]) => state.readonly = values.some(v => v), true))
  }

  subs.push(args.subscribe(async () => {
    state.arglen = args.length

    const inputNodes = [...argNodes.value];
    let changed = false;
    for (let i = 0; i < args.length; i++) {
      const arg = args.at(i);
      const argType = arg?.getAccessValue('type')?.getValue() as string ?? '';
      let valType = argType ? await getNodeType(argType) as ValueType : undefined;
      if (valType && arg?.getAccessValue('variadic')?.getValue() as boolean && valType.kind !== SCHEMA_KIND_ARRAY)
        valType = await getNodeType(`${NS_SYSTEM_LIST}<${valType.name}>`) as ValueType;

      let input = inputNodes[i];
      if (input?.node?.type != valType) {
        changed = true;
        input?.node?.dispose();
        inputNodes[i] = { node: valType?.create(undefined) as DataNode, showdata: false };
        if (inputNodes[i].node)
          inputNodes[i].node!.recordSubscription(inputNodes[i].node!.subscribe(doCalc));
      }
    }
    for (let i = inputNodes.length - 1; i >= args.length; i--) {
      changed = true;
      inputNodes.pop()?.node?.dispose();
    }
    if (changed) argNodes.value = inputNodes;
  }, true));
  subs.push(exps.subscribeItem(() => state.explen = exps.length, true));
  subs.push(exps.subscribe(doCalc));
})

onUnmounted(() => {
  subs.forEach(sub => sub())
})
</script>
