<template>
  <Layout class="px-[60px] py-8">
    <Header :title="$t('module.platform')" />

    <el-tabs v-model="activeName" class="mt-2">
      <el-tab-pane label="大模型" name="first" lazy>
        <ModelView />
      </el-tab-pane>
      <!-- <el-tab-pane label="联网搜索" name="second" lazy> <WebSearchView /> </el-tab-pane> -->
      <el-tab-pane v-if="isKmRc" label="文档查看与编辑" name="third" lazy> <FileEditorView /> </el-tab-pane>
      <el-tab-pane label="文档解析" name="fourth" lazy> <FileParserView /> </el-tab-pane>
      <!-- <el-tab-pane label="文档存储" name="fifth"> 文档存储功能 </el-tab-pane> -->
    </el-tabs>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModelView from './view/model.vue'
// import WebSearchView from './view/web-search.vue'
import FileParserView from './view/file-parser.vue'
import FileEditorView from './view/file-editor.vue'

const isKmRc =
  ['kmrc.53ai.com', 'km.cc'].includes(window.location.host) || /192\.168\.1\.\d+/.test(window.location.host)
type TabPaneName = 'first' | 'second' | 'third' | 'fourth' | 'fifth'
const activeName = ref<TabPaneName>('first')
</script>

<style scoped></style>
