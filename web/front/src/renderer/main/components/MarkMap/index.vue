<template>
  <div class="flex flex-col bg-[#F9FAFB] rounded-xl overflow-hidden">
    <div class="flex-none h-[72px] bg-[#EBECEF] flex items-center px-6">
      <div class="flex-1">
        <div class="inline-flex h-12 px-1.5 items-center bg-[#E1E2E6] rounded-lg">
          <div :class="[
            'w-16 h-9 cursor-pointer flex-center rounded text-base',
            mode === 'image' ? 'bg-white text-[#1D1E1F]' : 'text-[#4F5052]'
          ]" @click="mode = 'image'">
            图片
          </div>
          <div :class="[
            'w-16 h-9 cursor-pointer flex-center rounded text-base',
            mode === 'code' ? 'bg-white text-[#1D1E1F]' : 'text-[#4F5052]'
          ]" @click="mode = 'code'">
            代码
          </div>
        </div>
      </div>
      <div class="flex items-center gap-5" v-show="mode === 'image'">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-icon color="#333333" size="18">
              <Download />
            </el-icon>
            <el-icon color="#9A9A9A" size="12">
              <ArrowDown />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="downloadImage">下载图片</el-dropdown-item>
              <el-dropdown-item @click="copyPlainText">复制文本</el-dropdown-item>
              <el-dropdown-item @click="copyMarkdown">复制markdown</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-icon class="cursor-pointer" size="16" color="#1D1E1F" @click="zoomOut">
          <ZoomOut />
        </el-icon>
        <el-icon class="cursor-pointer" size="16" color="#1D1E1F" @click="zoomIn">
          <ZoomIn />
        </el-icon>
      </div>
      <div class="flex items-center gap-5" v-show="mode === 'code'">
        <el-icon class="cursor-pointer" @click="copyCode">
          <CopyDocument />
        </el-icon>
      </div>

    </div>
    <div class="flex-1 relative overflow-hidden">
      <transition name="slide-fade" mode="out-in">
        <svg v-show="mode === 'image'" class="absolute w-full h-full" ref="svgRef" key="image" />
      </transition>
      <transition name="slide-fade" mode="out-in">
        <div v-show="mode === 'code'" class="absolute w-full h-full p-4" key="code">
          <pre class="whitespace-pre-wrap h-full">{{ value }}</pre>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Markmap } from 'markmap-view'
import { ZoomOut, ZoomIn, Download, ArrowDown, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { transformer } from './index'
import { saveAs } from 'file-saver'

const mode = ref('image') // 添加模式控制
const initValue = `
# LlamaIndex定位转变及AgentWorkflow诞生背景
- LlamaIndex从RAG框架转向多智能体框架
- AgentWorkflow因Workflow不足而诞生
# AgentWorkflow的构成及工作原理
- Agent模块包含FunctionAgent和ReActAgent
- AgentWorkflow模块负责整体流程编排
# 基于AgentWorkflow的客户服务项目实践
- 定义ConciergeAgent等不同功能智能体
- 使用Chainlit进行UI开发
# AgentWorkflow的问题及改进
- FunctionAgent存在响应不及时的问题
- 通过调整聊天记录解决响应问题
# AgentWorkflow的优势与未来展望
- 简化多智能体编排开发过程
- 特定场景有待进一步改进完善
- useful
- easy
- interactive
`
const svgRef = ref()
const value = ref(initValue)
let mm

const update = async () => {
  const { root } = transformer.transform(value.value)
  await mm.setData(root)
  mm.fit()
}

onMounted(() => {
  mm = Markmap.create(svgRef.value)
  update()
})


const copyCode = () => {
  navigator.clipboard.writeText(value.value).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const zoomIn = () => {
  mm.rescale(1.25)
}

const zoomOut = () => {
  mm.rescale(0.8)
}

const downloadImage = async () => {
  const svg = svgRef.value
  // 克隆SVG元素以避免修改原SVG
  const clonedSvg = svg.cloneNode(true)
  // 添加白色背景
  clonedSvg.setAttribute('style', 'background-color: white')
  const svgData = new XMLSerializer().serializeToString(clonedSvg)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()

  // 获取SVG的实际宽高
  const width = parseInt(svg.getAttribute('width')) || svg.clientWidth
  const height = parseInt(svg.getAttribute('height')) || svg.clientHeight

  canvas.width = width
  canvas.height = height

  img.onload = () => {
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, 'markmap.png')
      }
    }, 'image/png')
  }

  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
}

const copyPlainText = () => {
  const text = value.value.replace(/^[#*-]\s*/gm, '')
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('纯文本复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const copyMarkdown = () => {
  navigator.clipboard.writeText(value.value).then(() => {
    ElMessage.success('Markdown复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}
</script>
