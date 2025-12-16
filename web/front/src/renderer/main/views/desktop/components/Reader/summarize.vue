<template>
  <div class="w-4/5 min-h-full mx-auto bg-white px-5 shadow-lg">
    <div class="py-10">
      <h3 class="mb-9 text-center">
        <span class="text-2xl font-semibold text-[#1D1E1F]">知识要点</span>
        <div class="w-[96px] h-3 bg-[#E0EAFF] mx-auto -mt-2"></div>
      </h3>

      <ul class="space-y-4 text-gray-700">
        <li class="flex items-start">
          <div class="flex-shrink-0 mt-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <p class="ml-3">
            Manus 上线及效果惊人：Manus 咋晚 10 点上线，效果非常惊人，可通过案例看其实现效果。
          </p>
        </li>

        <li class="flex items-start">
          <div class="flex-shrink-0 mt-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <div class="ml-3">
            <p class="mb-2">
              用户需求：用户为自己和未婚妻制定 4 月 15 - 23 日从西雅图出发的日本 7 天行程，预算 2500
              - 5000
              美元，热爱历史遗迹、小众景点和日本文化（创造、茶道、美食）。希望参观奈良小鹿并能步行探索城市，计划深挖并需特殊场地推荐，要求提供详细行程安排及简易
              HTML 版旅行手册，包含地图标注、景点说明、实用日语短语和全程旅行贴士。
            </p>
          </div>
        </li>

        <li class="flex items-start">
          <div class="flex-shrink-0 mt-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <div class="ml-3">
            <p class="mb-2">Manus 执行任务的 8 步流程：</p>
            <ol class="list-decimal ml-5 space-y-2">
              <li>研究日本旅游基础信息和人境要求，创建 japan_trip 文件夹及 todo.md 文件。</li>
              <li>创建旅行准备清单，创建 japan_trip/todo.md 文件。</li>
              <li>
                研究与旅行者兴趣相匹配的城市和景点，对任务拆解，用多个关键词搜索和信息汇总，遇到
                CAPTCHA 验证会询问用户，继续收集小众景点、历史遗迹等信息。
              </li>
              <li>
                制定全面的 7 天行程规划，创建日本旅行 / 日本研究.md、编辑日本旅行 /
                待办事项.md、创建日本旅行 / 7 天行程.md。
              </li>
            </ol>
          </div>
        </li>

        <li class="flex items-start">
          <div class="flex-shrink-0 mt-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <p class="ml-3">
            行程合理性分析：通过谷歌地图分析行程合理性，发现部分行程存在景点过多、距离远、路线规划不合理等问题，但总体来说
            Manus 的表现还算十分惊人。
          </p>
        </li>
      </ul>

      <div class="flex items-center justify-end mt-6 space-x-3">
        <div class="flex-1 h-px bg-[#E6E8EB]"></div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <CopyDocument />
          </el-icon>
          <span class="text-sm">{{ $t('action.copy') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <Refresh />
          </el-icon>
          <span class="text-sm">{{ $t('chat.regenerate') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <Share />
          </el-icon>
          <span class="text-sm">{{ $t('action.share') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <Star />
          </el-icon>
          <span class="text-sm">{{ $t('action.favorite') }}</span>
        </div>
        <div class="w-px h-3 bg-[#E6E8EB]"></div>
        <div class="flex items-center text-[#4F5052] cursor-pointer">
          <svg-icon size="18" name="like" />
        </div>
        <div class="flex items-center text-[#4F5052] cursor-pointer">
          <svg-icon size="18" name="dislike" />
        </div>
      </div>
    </div>

    <div class="py-10" v-if="visibles.includes('1')">
      <h3 class="mb-9 text-center">
        <span class="text-2xl font-semibold text-[#1D1E1F]">Q&A问答</span>
        <div class="w-[96px] h-3 bg-[#E0EAFF] mx-auto -mt-2"></div>
      </h3>
      <div class="space-y-6">
        <!-- 问答项 1 -->
        <div class="border-b pb-6">
          <div class="flex items-start mb-3">
            <div
              class="flex-none text-base bg-[#EEF3FE] text-[#2563EB] w-12 h-7 rounded flex-center mr-2"
            >
              问题
            </div>
            <div class="text-base text-[#1D1E1F]">
              要上晚班吗? 每天工作几个小时? 每周休息几天? 每月休息几天?
            </div>
          </div>
          <div class="flex items-start">
            <div
              class="flex-none text-base bg-green-100 text-green-600 w-12 h-7 rounded flex-center mr-2"
            >
              回答
            </div>
            <div class="text-base text-[#1D1E1F]">
              我们有长白班也有两班制，如果你不想上夜班也可以自己选择长白班，每天工作10-12小时，具体看部门安排，长白班加班的时长会多一点，但是也是自由加班的哦，不会强制性的，每工作两个小时可以休息十分钟，中午下午也各有一个小时的吃饭休息时间哦。
            </div>
          </div>
        </div>
        <div class="border-b pb-6">
          <div class="flex items-start mb-3">
            <div
              class="flex-none text-base bg-[#EEF3FE] text-[#2563EB] w-12 h-7 rounded flex-center mr-2"
            >
              问题
            </div>
            <div class="text-base text-[#1D1E1F]">
              要上晚班吗? 每天工作几个小时? 每周休息几天? 每月休息几天?
            </div>
          </div>
          <div class="flex items-start">
            <div
              class="flex-none text-base bg-green-100 text-green-600 w-12 h-7 rounded flex-center mr-2"
            >
              回答
            </div>
            <div class="text-base text-[#1D1E1F]">
              我们有长白班也有两班制，如果你不想上夜班也可以自己选择长白班，每天工作10-12小时，具体看部门安排，长白班加班的时长会多一点，但是也是自由加班的哦，不会强制性的，每工作两个小时可以休息十分钟，中午下午也各有一个小时的吃饭休息时间哦。
            </div>
          </div>
        </div>
        <div class="">
          <div class="flex items-start mb-3">
            <div
              class="flex-none text-base bg-[#EEF3FE] text-[#2563EB] px-2 py-1 rounded flex-center mr-2"
            >
              问题
            </div>
            <div class="text-base text-[#1D1E1F]">
              要上晚班吗? 每天工作几个小时? 每周休息几天? 每月休息几天?
            </div>
          </div>
          <div class="flex items-start">
            <div
              class="flex-none bg-green-100 text-green-600 px-2 py-1 rounded text-base flex-center mr-2"
            >
              回答
            </div>
            <div class="text-base text-[#1D1E1F]">
              我们有长白班也有两班制，如果你不想上夜班也可以自己选择长白班，每天工作10-12小时，具体看部门安排，长白班加班的时长会多一点，但是也是自由加班的哦，不会强制性的，每工作两个小时可以休息十分钟，中午下午也各有一个小时的吃饭休息时间哦。
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-end mt-6 space-x-3">
        <div class="flex-1 h-px bg-[#E6E8EB]"></div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <CopyDocument />
          </el-icon>
          <span class="text-sm">{{ $t('action.copy') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <Refresh />
          </el-icon>
          <span class="text-sm">{{ $t('chat.regenerate') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <Share />
          </el-icon>
          <span class="text-sm">{{ $t('action.share') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <Star />
          </el-icon>
          <span class="text-sm">{{ $t('action.favorite') }}</span>
        </div>
        <div class="w-px h-3 bg-[#E6E8EB]"></div>
        <div class="flex items-center text-[#4F5052] cursor-pointer">
          <svg-icon size="18" name="like" />
        </div>
        <div class="flex items-center text-[#4F5052] cursor-pointer">
          <svg-icon size="18" name="dislike" />
        </div>
      </div>
    </div>
    <div class="py-10" v-if="visibles.includes('2')">
      <h3 class="mb-9 text-center">
        <span class="text-2xl font-semibold text-[#1D1E1F]">思维导图</span>
        <div class="w-[96px] h-3 bg-[#E0EAFF] mx-auto -mt-2"></div>
      </h3>
      <MarkMap class="h-[664px]"></MarkMap>
      <div class="flex items-center justify-end mt-6 space-x-3">
        <div class="flex-1 h-px bg-[#E6E8EB]"></div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <CopyDocument />
          </el-icon>
          <span class="text-sm">{{ $t('action.copy') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <Refresh />
          </el-icon>
          <span class="text-sm">{{ $t('chat.regenerate') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <Share />
          </el-icon>
          <span class="text-sm">{{ $t('action.share') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <Star />
          </el-icon>
          <span class="text-sm">{{ $t('action.favorite') }}</span>
        </div>
        <div class="w-px h-3 bg-[#E6E8EB]"></div>
        <div class="flex items-center text-[#4F5052] cursor-pointer">
          <svg-icon size="18" name="like" />
        </div>
        <div class="flex items-center text-[#4F5052] cursor-pointer">
          <svg-icon size="18" name="dislike" />
        </div>
      </div>
    </div>
    <div class="py-10" v-if="visibles.includes('3')">
      <h3 class="mb-9 text-center">
        <span class="text-2xl font-semibold text-[#1D1E1F]">知识图谱</span>
        <div class="w-[96px] h-3 bg-[#E0EAFF] mx-auto -mt-2"></div>
      </h3>
      <!-- <MarkMap class="h-[664px]"></MarkMap> -->
      <MarkMapVis class="h-[684px]"></MarkMapVis>
      <!-- <MarkMapKnowledge class="h-[664px]"></MarkMapKnowledge> -->
      <div class="flex items-center justify-end mt-6 space-x-3">
        <div class="flex-1 h-px bg-[#E6E8EB]"></div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <CopyDocument />
          </el-icon>
          <span class="text-sm">{{ $t('action.copy') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <Refresh />
          </el-icon>
          <span class="text-sm">{{ $t('chat.regenerate') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <Share />
          </el-icon>
          <span class="text-sm">{{ $t('action.share') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[#4F5052] px-1 cursor-pointer">
          <el-icon>
            <Star />
          </el-icon>
          <span class="text-sm">{{ $t('action.favorite') }}</span>
        </div>
        <div class="w-px h-3 bg-[#E6E8EB]"></div>
        <div class="flex items-center text-[#4F5052] cursor-pointer">
          <svg-icon size="18" name="like" />
        </div>
        <div class="flex items-center text-[#4F5052] cursor-pointer">
          <svg-icon size="18" name="dislike" />
        </div>
      </div>
    </div>

    <div class="h-[122px]"></div>
  </div>
  <div
    class="fixed left-1/2 -translate-x-1/2 bottom-6 h-[78px] px-[60px] bg-[#FFFFFF] rounded-lg flex items-center gap-5 shadow-md"
  >
    <div class="text-base text-[#1D1E1F] whitespace-nowrap">还可以这些操作：</div>
    <div class="w-[134px] h-11 flex-center gap-2.5 border rounded cursor-pointer">
      <div class="size-6 rounded-full flex-center bg-[#F0F3FA]">
        <svg-icon name="question" color="#2D6EFA"></svg-icon>
      </div>
      <span class="text-base text-[#4F5052]">Q&A 问答</span>
    </div>
    <div class="w-[134px] h-11 flex-center gap-2.5 border rounded cursor-pointer">
      <div class="size-6 rounded-full flex-center bg-[#FFF0F0]">
        <svg-icon name="sitemap" color="#FF4D4D"></svg-icon>
      </div>
      <span class="text-base text-[#4F5052]">思维导图</span>
    </div>
    <div class="w-[134px] h-11 flex-center gap-2.5 border rounded cursor-pointer">
      <div class="size-6 rounded-full flex-center bg-[#F3FBF5]">
        <svg-icon name="live-photo" color="#35BE57"></svg-icon>
      </div>
      <span class="text-base text-[#4F5052]">知识图谱</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CopyDocument, Refresh, Star, Share } from '@element-plus/icons-vue'

import MarkMap from '@/components/MarkMap/index.vue'
import MarkMapVis from '@/components/MarkMap/vis.vue'

const visibles = ref(['1', '2', '3'])
// 总结
</script>
