<template>
  <div class="relative flex flex-col bg-[#F9FAFB] rounded-xl overflow-hidden">
    <div class="flex-1 bg-[#F9FAFB]" ref="containerRef"></div>
    <div class="flex-none h-12 bg-[#F5F5F5] flex-center gap-5">
      <el-icon class="cursor-pointer" size="18" @click="zoomOut">
        <ZoomOut />
      </el-icon>
      <el-icon class="cursor-pointer" size="18" @click="zoomIn">
        <ZoomIn />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { ZoomIn, ZoomOut } from '@element-plus/icons-vue'
// 导入vis-network
import { Network, DataSet } from 'vis-network/standalone'

const containerRef = ref(null)
const network = ref(null)

// 放大功能
const zoomIn = () => {
  if (network.value) {
    const scale = network.value.getScale() * 1.2
    network.value.moveTo({
      scale: scale
    })
  }
}

// 缩小功能
const zoomOut = () => {
  if (network.value) {
    const scale = network.value.getScale() * 0.8
    network.value.moveTo({
      scale: scale
    })
  }
}

onMounted(() => {
  // 定义节点组和颜色
  const groups = {
    center: { color: { background: '#9E9E9E', border: '#757575' }, shape: 'circle' },
    blue: { color: { background: '#4285F4', border: '#3367D6' }, shape: 'circle' },
    red: { color: { background: '#EA4335', border: '#C62828' }, shape: 'circle' },
    green: { color: { background: '#34A853', border: '#2E7D32' }, shape: 'circle' },
    orange: { color: { background: '#FBBC05', border: '#F57F17' }, shape: 'circle' }
  }

  // 创建节点数据集
  var nodes = new DataSet([
    { id: 1, label: "一页爆火的...", group: 'center' },
    { id: 2, label: "应用案例", group: 'red' },
    { id: 3, label: "规划需求", group: 'red' },
    { id: 4, label: "部分问题", group: 'red' },
    { id: 5, label: "流程步骤", group: 'green' },
    { id: 6, label: "入境要求", group: 'green' },
    { id: 7, label: "相关文件", group: 'green' },
    { id: 8, label: "城市景点", group: 'green' },
    { id: 9, label: "对应文件", group: 'green' },
    { id: 10, label: "任务处理", group: 'orange' },
    { id: 11, label: "求婚地点", group: 'orange' },
    { id: 12, label: "旅行贴士", group: 'orange' },
    { id: 13, label: "旅行手册", group: 'orange' },
    { id: 14, label: "手册要求", group: 'blue' },
    { id: 15, label: "规划需求", group: 'blue' },
    { id: 16, label: "成果分析", group: 'blue' },
  ]);

  // 创建边数据集
  var edges = new DataSet([
    { from: 1, to: 2 },
    { from: 1, to: 3, hidden: true }, // 图中未显示此连接
    { from: 1, to: 5 },
    { from: 1, to: 10 },
    { from: 1, to: 16 },
    { from: 2, to: 4 },
    { from: 2, to: 3 },
    { from: 5, to: 6 },
    { from: 5, to: 7 },
    { from: 5, to: 8 },
    { from: 5, to: 9 },
    { from: 10, to: 11 },
    { from: 10, to: 12 },
    { from: 10, to: 13 },
    { from: 16, to: 14 },
    { from: 16, to: 15 },
  ]);
  // 自定义节点绘制函数，添加三条横线
  // 创建网络配置
  var options = {
    groups: groups,

    physics: {
      hierarchicalRepulsion: {
        nodeDistance: 150
      },
      stabilization: true
    },
    nodes: {
      size: 30,
      font: {
        size: 14,
        color: '#576D9C',
        face: 'Arial',
        vadjust: 50 // 垂直调整，使文字位于节点下方
      },
      borderWidth: 0,
    },
    edges: {
      width: 2,
      color: {
        color: '#c8c8c8',
        highlight: '#848484'
      },
      smooth: {
        type: 'continuous'
      }
    },
    // interaction: {
    //   hover: true,
    //   navigationButtons: true,
    //   keyboard: true
    // }
  };

  // 创建网络
  var data = {
    nodes: nodes,
    edges: edges,
  };

  // 保存网络实例的引用
  network.value = new Network(containerRef.value, data, options);
})
</script>