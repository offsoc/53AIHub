<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    value: string | number
    name: string
    cache?: boolean
  }>(),
  {
    value: '',
    name: '',
    cache: true
  }
)

const emits = defineEmits<{
  (ev: 'load'): void
  (ev: 'show'): void
}>()

const loaded = ref<boolean>(false)

watch(
  () => props.value,
  (val) => {
    if (val === props.name) {
      if (!loaded.value) {
        loaded.value = true
        emits('load')
      }
      emits('show')
    } else {
      if (!props.cache) loaded.value = false
    }
  },
  { immediate: true }
)

defineExpose({
  async reset() {
    loaded.value = false
  }
})
</script>

<template>
  <div v-if="loaded" v-show="name === value">
    <slot />
  </div>
</template>

<style>
</style>
