<template>
  <div class="history-module">
    <div class="module-header">
      <div class="header-content">
        <div class="title-box">
          <el-icon class="title-icon"><Timer /></el-icon>
          <div>
            <h2>世界历史年代图表</h2>
            <p>World history timeline / 主要文明、帝国与政权并行概览</p>
          </div>
        </div>
        <div class="range-tools">
          <el-select v-model="regionFilter" clearable placeholder="筛选区域" size="small">
            <el-option label="全部区域" value="" />
            <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
          </el-select>
        </div>
      </div>
    </div>

    <div class="timeline-shell">
      <div class="timeline-canvas" :style="{ width: `${canvasWidth}px` }">
        <div class="axis">
          <span
            v-for="tick in ticks"
            :key="tick.year"
            class="tick"
            :style="{ left: `${yearToX(tick.year)}px` }"
          >
            {{ tick.label }}
          </span>
        </div>

        <div class="rows">
          <div v-for="region in visibleRegions" :key="region" class="region-row">
            <div class="region-name">{{ region }}</div>
            <div class="region-track">
              <div
                v-for="item in itemsByRegion(region)"
                :key="item.name"
                class="era-block"
                :class="item.tone"
                :style="blockStyle(item)"
                :title="`${item.name}：${formatYear(item.start)} - ${formatYear(item.end)}`"
              >
                <strong>{{ item.name }}</strong>
                <span>{{ formatYear(item.start) }} - {{ formatYear(item.end) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Timer } from '@element-plus/icons-vue'

interface TimelineItem {
  name: string
  region: string
  start: number
  end: number
  lane: number
  tone: string
}

const START_YEAR = -1600
const END_YEAR = 2025
const PX_PER_YEAR = 0.54
const LEFT_PAD = 132

const regionFilter = ref('')

const items: TimelineItem[] = [
  { name: '商朝', region: '中国', start: -1600, end: -1046, lane: 0, tone: 'china' },
  { name: '周朝', region: '中国', start: -1046, end: -256, lane: 1, tone: 'china' },
  { name: '秦汉', region: '中国', start: -221, end: 220, lane: 0, tone: 'china-strong' },
  { name: '隋唐', region: '中国', start: 581, end: 907, lane: 1, tone: 'china-strong' },
  { name: '宋辽金西夏', region: '中国', start: 960, end: 1279, lane: 0, tone: 'china' },
  { name: '元朝', region: '中国', start: 1271, end: 1368, lane: 1, tone: 'steppe' },
  { name: '明朝', region: '中国', start: 1368, end: 1644, lane: 0, tone: 'china-strong' },
  { name: '清朝', region: '中国', start: 1644, end: 1912, lane: 1, tone: 'china' },
  { name: '中华民国', region: '中国', start: 1912, end: 1949, lane: 0, tone: 'modern' },
  { name: '中华人民共和国', region: '中国', start: 1949, end: 2025, lane: 1, tone: 'modern' },

  { name: '古埃及新王国', region: '北非', start: -1550, end: -1070, lane: 0, tone: 'africa' },
  { name: '迦太基', region: '北非', start: -814, end: -146, lane: 1, tone: 'africa' },
  { name: '法蒂玛王朝', region: '北非', start: 909, end: 1171, lane: 0, tone: 'arab' },
  { name: '马穆鲁克苏丹国', region: '北非', start: 1250, end: 1517, lane: 1, tone: 'arab' },

  { name: '赫梯', region: '西亚', start: -1650, end: -1180, lane: 0, tone: 'westasia' },
  { name: '亚述帝国', region: '西亚', start: -911, end: -609, lane: 1, tone: 'westasia' },
  { name: '新巴比伦王国', region: '西亚', start: -626, end: -539, lane: 2, tone: 'westasia' },
  { name: '阿契美尼德波斯', region: '西亚', start: -550, end: -330, lane: 0, tone: 'persia' },
  { name: '安息帝国', region: '西亚', start: -247, end: 224, lane: 1, tone: 'persia' },
  { name: '萨珊波斯', region: '西亚', start: 224, end: 651, lane: 0, tone: 'persia' },
  { name: '阿拉伯帝国', region: '西亚', start: 632, end: 1258, lane: 1, tone: 'arab' },
  { name: '奥斯曼帝国', region: '西亚', start: 1299, end: 1922, lane: 0, tone: 'ottoman' },

  { name: '迈锡尼文明', region: '欧洲', start: -1600, end: -1100, lane: 0, tone: 'europe' },
  { name: '古典希腊', region: '欧洲', start: -800, end: -323, lane: 1, tone: 'europe' },
  { name: '马其顿帝国', region: '欧洲', start: -336, end: -323, lane: 0, tone: 'macedon' },
  { name: '罗马共和国/帝国', region: '欧洲', start: -509, end: 476, lane: 2, tone: 'rome' },
  { name: '拜占庭帝国', region: '欧洲', start: 330, end: 1453, lane: 0, tone: 'rome' },
  { name: '法兰克王国', region: '欧洲', start: 481, end: 843, lane: 1, tone: 'europe' },
  { name: '神圣罗马帝国', region: '欧洲', start: 962, end: 1806, lane: 2, tone: 'europe' },
  { name: '俄罗斯帝国/苏联/俄联邦', region: '欧洲', start: 1721, end: 2025, lane: 0, tone: 'russia' },
  { name: '大英帝国', region: '欧洲', start: 1707, end: 1947, lane: 1, tone: 'britain' },

  { name: '孔雀王朝', region: '南亚', start: -322, end: -185, lane: 0, tone: 'india' },
  { name: '贵霜帝国', region: '南亚', start: 30, end: 375, lane: 1, tone: 'india' },
  { name: '笈多王朝', region: '南亚', start: 320, end: 550, lane: 0, tone: 'india' },
  { name: '德里苏丹国', region: '南亚', start: 1206, end: 1526, lane: 1, tone: 'india' },
  { name: '莫卧儿帝国', region: '南亚', start: 1526, end: 1857, lane: 0, tone: 'india-strong' },
  { name: '英属印度', region: '南亚', start: 1858, end: 1947, lane: 1, tone: 'britain' },

  { name: '匈奴', region: '草原与中亚', start: -209, end: 460, lane: 0, tone: 'steppe' },
  { name: '突厥汗国', region: '草原与中亚', start: 552, end: 744, lane: 1, tone: 'steppe' },
  { name: '蒙古帝国', region: '草原与中亚', start: 1206, end: 1368, lane: 0, tone: 'mongol' },
  { name: '帖木儿帝国', region: '草原与中亚', start: 1370, end: 1507, lane: 1, tone: 'steppe' },

  { name: '奥尔梅克文明', region: '美洲', start: -1500, end: -400, lane: 0, tone: 'america' },
  { name: '玛雅城邦', region: '美洲', start: -250, end: 900, lane: 1, tone: 'america' },
  { name: '阿兹特克帝国', region: '美洲', start: 1428, end: 1521, lane: 0, tone: 'america-strong' },
  { name: '印加帝国', region: '美洲', start: 1438, end: 1533, lane: 1, tone: 'america-strong' },
  { name: '美国', region: '美洲', start: 1776, end: 2025, lane: 0, tone: 'modern' },
]

const regions = [...new Set(items.map(item => item.region))]
const visibleRegions = computed(() => regionFilter.value ? [regionFilter.value] : regions)
const canvasWidth = Math.round((END_YEAR - START_YEAR) * PX_PER_YEAR + LEFT_PAD + 80)
const ticks = [
  { year: -1500, label: '1500 BC' },
  { year: -1000, label: '1000 BC' },
  { year: -500, label: '500 BC' },
  { year: 1, label: '1 AD' },
  { year: 500, label: '500' },
  { year: 1000, label: '1000' },
  { year: 1500, label: '1500' },
  { year: 2000, label: '2000' },
]

const yearToX = (year: number) => LEFT_PAD + (year - START_YEAR) * PX_PER_YEAR
const formatYear = (year: number) => year < 0 ? `${Math.abs(year)} BC` : `${year} AD`
const itemsByRegion = (region: string) => items.filter(item => item.region === region)
const blockStyle = (item: TimelineItem) => ({
  left: `${yearToX(item.start)}px`,
  width: `${Math.max(18, (item.end - item.start) * PX_PER_YEAR)}px`,
  top: `${12 + item.lane * 32}px`,
})
</script>

<style scoped>
.history-module { height: 100%; display: flex; flex-direction: column; gap: 16px; color: #1e293b; }
.module-header { padding: 24px; background: rgba(255,255,255,0.86); border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
.header-content { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.title-box { display: flex; align-items: center; gap: 16px; }
.title-icon { font-size: 32px; color: #2f6f84; background: #fff; padding: 10px; border-radius: 10px; box-shadow: 0 4px 15px rgba(47,111,132,0.15); }
.title-box h2 { margin: 0; font-size: 22px; font-weight: 700; }
.title-box p { margin: 4px 0 0; font-size: 12px; color: #64748b; }
.range-tools { min-width: 180px; }
.timeline-shell { flex: 1; min-height: 0; overflow: auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
.timeline-canvas { position: relative; min-height: 100%; padding: 0 0 24px; }
.axis { position: sticky; top: 0; z-index: 5; height: 44px; background: rgba(255,255,255,.96); border-bottom: 1px solid #e2e8f0; }
.tick { position: absolute; top: 13px; transform: translateX(-50%); color: #64748b; font-size: 12px; font-weight: 700; }
.tick::before { content: ""; position: absolute; left: 50%; top: 24px; height: calc(100vh - 160px); border-left: 1px dashed #dbe4ef; }
.rows { display: flex; flex-direction: column; }
.region-row { position: relative; height: 126px; border-bottom: 1px solid #eef2f7; }
.region-name { position: sticky; left: 0; z-index: 4; width: 120px; height: 100%; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-right: 1px solid #e2e8f0; font-weight: 800; color: #2f6f84; }
.region-track { position: absolute; inset: 0 0 0 0; }
.era-block { position: absolute; height: 24px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 0 8px; border-radius: 5px; overflow: hidden; white-space: nowrap; color: #1e293b; border: 1px solid rgba(0,0,0,.08); box-shadow: 0 2px 6px rgba(15,23,42,.05); }
.era-block strong { font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
.era-block span { font-size: 10px; opacity: .78; }
.china { background: #f8e7b9; }
.china-strong { background: #d48c29; color: #fff; }
.africa { background: #d6eadf; }
.westasia { background: #eadfd2; }
.persia { background: #d9c7f2; }
.arab { background: #2d6a4f; color: #fff; }
.ottoman { background: #bb3e03; color: #fff; }
.europe { background: #dbe7f5; }
.rome { background: #9b2226; color: #fff; }
.macedon { background: #005f73; color: #fff; }
.russia { background: #457b9d; color: #fff; }
.britain { background: #03045e; color: #fff; }
.india { background: #efe2c7; }
.india-strong { background: #b7791f; color: #fff; }
.steppe { background: #ca6702; color: #fff; }
.mongol { background: #8f4b12; color: #fff; }
.america { background: #d9eadf; }
.america-strong { background: #4f8a5b; color: #fff; }
.modern { background: #334155; color: #fff; }
@media (max-width: 800px) {
  .module-header { padding: 18px; }
  .era-block span { display: none; }
}
</style>
