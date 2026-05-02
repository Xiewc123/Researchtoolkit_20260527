<template>
  <div class="dynasty-module">
    <!-- 1. 顶部标题栏（保留第一版视觉风格） -->
    <div class="module-header">
      <div class="header-content">
        <div class="title-box">
          <el-icon class="title-icon"><Calendar /></el-icon>
          <div>
            <h2>朝代年号索引表</h2>
            <p>Chronological Table of Chinese Dynasties</p>
          </div>
        </div>
        <!-- 右侧纪年线图表 -->
        <div class="mini-timeline-viz">
          <div class="viz-track">
            <div class="viz-segment s1">秦汉</div>
            <div class="viz-segment s2">魏晋</div>
            <div class="viz-segment s3">隋唐</div>
            <div class="viz-segment s4">宋元</div>
            <div class="viz-segment s5">明清</div>
          </div>
          <span>公元前 202 — 公元 1949</span>
        </div>
      </div>
    </div>

    <!-- 2. 查询栏（完全保留您要求的布局和功能） -->
    <div class="search-bar-card">
      <el-row :gutter="12">
        <el-col :span="6">
          <el-select v-model="selectedDynasty" placeholder="选择朝代" clearable class="w-full">
            <el-option 
              v-for="d in dynastyData" 
              :key="d.name" 
              :label="d.name" 
              :value="d.name" 
            />
          </el-select>
        </el-col>
        <el-col :span="10">
          <el-input 
            v-model="searchQuery" 
            placeholder="输入年号、皇帝或公元纪年..." 
            :prefix-icon="Search" 
            clearable
          />
        </el-col>
        <el-col :span="8" class="text-right">
          <el-button-group>
            <el-button type="primary" plain @click="openExternal">
              两千年西历转换
            </el-button>
          </el-button-group>
        </el-col>
      </el-row>
    </div>

    <!-- 3. 主内容区：双层折叠列表 -->
    <div class="list-container">
      <el-collapse v-model="activeDynastyNames">
        <el-collapse-item 
          v-for="dynasty in filteredDynasties" 
          :key="dynasty.name" 
          :name="dynasty.name"
        >
          <!-- 朝代标题槽 -->
          <template #title>
            <div class="dynasty-header">
              <span class="d-label">{{ dynasty.name }}</span>
              <span class="d-time">{{ formatYear(dynasty.start) }} ~ {{ formatYear(dynasty.end) }}</span>
            </div>
          </template>

          <!-- 内部：皇帝折叠层 -->
          <div class="emperor-collapse-wrapper">
            <el-collapse v-model="activeEmperorNames">
              <el-collapse-item 
                v-for="emp in dynasty.emperors" 
                :key="emp.name" 
                :name="emp.name"
              >
                <template #title>
                  <div class="emperor-header">
                    <span class="e-name">{{ emp.name }}</span>
                    <span class="e-period">在位: {{ formatYear(emp.start) }}-{{ formatYear(emp.end) }}</span>
                  </div>
                </template>

                <!-- 年号与元年详情 -->
                <div v-for="era in emp.eras" :key="era.name" class="era-detail-block">
                  <div class="era-tag">{{ era.name }}</div>
                  <div class="year-grid">
                    <div 
                      v-for="year in getYearGrid(era)" 
                      :key="year.ad" 
                      class="year-card"
                    >
                      <span class="y-ord">{{ year.label }}</span>
                      <span class="y-ad">{{ formatYear(year.ad) }}</span>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-collapse-item>
      </el-collapse>

      <!-- 无搜索结果显示 -->
      <el-empty v-if="filteredDynasties.length === 0" description="未找到相关朝代或年号" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Calendar, Search } from '@element-plus/icons-vue'
import { dynastyData } from '../data/dynasties'
import { openUrl } from '@tauri-apps/plugin-opener'

const externalUrl = 'https://sinocal.sinica.edu.tw/'
const openExternal = async () => {
  try {
    await openUrl(externalUrl)
  } catch (e) {
    console.error('打开失败', e)
  }
}
const searchQuery = ref('')
const selectedDynasty = ref('')
const activeDynastyNames = ref(['唐朝']) // 默认展开
const activeEmperorNames = ref<string[]>([])
const formatYear = (y: number) => y < 0 ? `前${Math.abs(y)}` : y

// --- 核心优化：过滤逻辑 ---
const filteredDynasties = computed(() => {
  const query = searchQuery.value.trim()
  const selected = selectedDynasty.value

  // 如果没有任何筛选条件，返回全部
  if (!query && !selected) return dynastyData

  // 解析是否为年份检索
  let searchYear: number | null = null
  if (/^-?\d+$/.test(query)) {
    searchYear = parseInt(query)
  } else if (/^前\d+$/.test(query)) {
    searchYear = -parseInt(query.substring(1))
  }

  return dynastyData.filter(d => {
    // 1. 下拉框筛选逻辑：没选则为真，选了则匹配名称
    const matchSelected = !selected || d.name === selected

    // 2. 搜索框内容匹配逻辑
    let matchSearch = true // 默认如果没有输入任何搜索词，则视为匹配通过
    
    if (query) {
      if (searchYear !== null) {
        // 如果是年份，判断是否在该朝代范围内
        matchSearch = searchYear >= d.start && searchYear <= d.end
      } else {
        // 如果是文字，匹配朝代名、皇帝名或年号
        matchSearch = d.name.includes(query) || 
          d.emperors.some(e => 
            e.name.includes(query) || 
            e.eras.some(era => {
              if (query.length >= 2) return era.name === query || era.name.includes(query)
              return era.name.includes(query)
            })
          )
      }
    }

    // 必须同时满足下拉框和搜索框（且搜索框是有逻辑交集的）
    return matchSelected && matchSearch
  })
})

// --- 新增：搜索时自动展开匹配的项 ---
watch(searchQuery, (newVal) => {
  if (newVal.trim()) {
    const dynNames: string[] = []
    const empNames: string[] = []
    
    filteredDynasties.value.forEach(d => {
      dynNames.push(d.name)
      d.emperors.forEach(e => {
        // 如果皇帝名或其年号包含搜索词，则展开该皇帝项
        if (e.name.includes(newVal) || e.eras.some(era => era.name.includes(newVal))) {
          empNames.push(e.name)
        }
      })
    })
    activeDynastyNames.value = dynNames
    activeEmperorNames.value = empNames
  }
})

// 计算年份列表 (保持不变)
const getYearGrid = (era: any) => {
  if (!era || typeof era.start !== 'number') return []
  const list = []
  const end = era.end || era.start
  for (let ad = era.start; ad <= end; ad++) {
    const ordinal = ad - era.start + 1
    list.push({ ad, label: ordinal === 1 ? '元年' : `${ordinal}年` })
  }
  return list
}

</script>

<style scoped>
.search-bar-card {
  position: relative;
  z-index: 10;
}
.dynasty-module {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #1e293b;
}

/* 顶部标题区样式 */
.module-header {
  padding: 24px;
  background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5));
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-box { display: flex; align-items: center; gap: 16px; }
.title-icon {
  font-size: 32px;
  color: #2f6f84;
  background: #fff;
  padding: 10px;
  border-radius: 14px;
  box-shadow: 0 4px 15px rgba(47, 111, 132, 0.15);
}
.title-box h2 { margin: 0; font-size: 22px; font-weight: 700; color: #1e293b; }
.title-box p { margin: 4px 0 0; font-size: 11px; color: #94a3b8; letter-spacing: 1px; }

/* 纪年线可视化 */
.mini-timeline-viz { text-align: right; }
.viz-track {
  display: flex;
  width: 300px;
  height: 24px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 6px;
  border: 1px solid rgba(0,0,0,0.05);
}
.viz-segment {
  display: grid;
  place-items: center;
  font-size: 10px;
  color: white;
  border-right: 1px solid rgba(255,255,255,0.2);
}
.s1 { flex: 2; background: #2f6f84; }
.s2 { flex: 1.5; background: #4a90a4; }
.s3 { flex: 3; background: #9a7a40; }
.s4 { flex: 2; background: #b58d4a; }
.s5 { flex: 2; background: #7c2d12; }
.mini-timeline-viz span { font-size: 11px; color: #94a3b8; }

/* 查询栏样式 */
.search-bar-card {
  padding: 18px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.4);
}

/* 列表区 */
.list-container {
  flex: 1;
  overflow-y: auto;
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
}

.dynasty-header {
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: 700;
}
.d-label { font-size: 17px; color: #2f6f84; }
.d-time { font-size: 12px; color: #94a3b8; font-weight: 400; }

.emperor-collapse-wrapper { padding: 0 20px 10px; }
.emperor-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-right: 24px;
}
.e-name { font-weight: 600; color: #475569; }
.e-period { font-size: 11px; color: #94a3b8; }

.era-detail-block {
  margin-top: 15px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}
.era-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 800;
  color: #9a7a40;
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid #9a7a40;
}

/* 序数网格优化 */
.year-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
}
.year-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: border-color 0.2s;
}
.year-card:hover { border-color: #2f6f84; }
.y-ord { font-size: 12px; font-weight: 700; color: #334155; }
.y-ad { font-size: 10px; color: #94a3b8; margin-top: 2px; }

.module-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #f1f5f9;
  border-radius: 10px;
  font-size: 13px;
  color: #64748b;
}

/* 去除 Element 折叠面板动画卡顿 */
:deep(.el-collapse) { border: none; }
:deep(.el-collapse-item__header) { 
  background: transparent !important; 
  height: 60px; 
}
:deep(.el-collapse-item__wrap) { background: transparent !important; }
</style>