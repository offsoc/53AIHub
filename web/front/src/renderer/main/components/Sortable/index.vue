<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

import Sortable from 'sortablejs'

const props = withDefaults(
  defineProps<{
    modelValue: any[]
    identity?: string
    props?: any
  }>(),
  {
    modelValue: [],
    identity: 'id',
    props: {
      handle: '.sort-icon',
      animation: 150
    }
  }
)

const emits = defineEmits<{
  (event: 'update:modelValue', data: string): any
}>()
const id = `sort_${Math.random().toString(36).substr(2, 9)}`

const list = ref([])

let _sortable
onMounted(() => {
  const sortableEl = document.querySelector(`#${id}`)
  if (!sortableEl) return
  _sortable = Sortable.create(sortableEl, {
    onStart: ({ target, oldIndex }) => (target.children[oldIndex].style.background = props.dragBg),
    onEnd: ({ target, newIndex: targetIndex, oldIndex: originIndex }) => {
      if (targetIndex === originIndex) return
      const value = list.value
      const originData = value.splice(originIndex, 1)[0]
      value.splice(targetIndex, 0, originData)
      emits('update:modelValue', value)
    },
    ...props.props
  })
})

onUnmounted(() => {
  if (_sortable) _sortable.destroy()
  _sortable = undefined
})
watch(
  () => props.modelValue,
  (val) => {
    list.value = val
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div :id="id">
    <slot name="header" />
    <template v-for="(item, index) in list" :key="item[identity]">
      <slot name="item" :item="item" :index="index" />
    </template>
    <slot name="footer" />
  </div>
</template>

<style>
</style>
