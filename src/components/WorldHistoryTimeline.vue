<template>
  <div class="history-module">
    <div class="module-header">
      <div class="header-content">
        <div class="title-box">
          <el-icon class="title-icon"><Timer /></el-icon>
          <div>
            <h2>世界历史年代图表</h2>
            <p>World history timeline / 中国、草原与中亚、西亚、欧洲、南亚、北非并行纵览</p>
          </div>
        </div>
        <div class="jump-tools">
          <el-select v-model="jumpRange" size="small" placeholder="定位到时间段" @change="jumpToRange">
            <el-option v-for="range in ranges" :key="range.value" :label="range.label" :value="range.value" />
          </el-select>
        </div>
      </div>
    </div>

    <div ref="timelineShell" class="timeline-shell">
      <div class="timeline-canvas" :style="{ height: `${canvasHeight}px` }">
        <div class="year-axis">
          <span
            v-for="tick in ticks"
            :key="tick.year"
            class="year-tick"
            :style="{ top: `${yearToY(tick.year)}px` }"
          >
            {{ tick.label }}
          </span>
        </div>

        <div class="region-grid">
          <div v-for="region in regions" :key="region" class="region-col">
            <div class="region-head">{{ region }}</div>
            <div class="region-track">
              <div
                v-for="item in itemsByRegion(region)"
                :key="`${item.region}-${item.name}-${item.start}`"
                class="era-block"
                :class="[item.tone, { compact: blockHeight(item) < 30 }]"
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

const START_YEAR = -1200
const END_YEAR = 1949
const PX_PER_YEAR = 1.15
const TOP_PAD = 58

const timelineShell = ref<HTMLElement | null>(null)
const jumpRange = ref('')
const regions = ['中国', '草原与中亚', '西亚', '欧洲', '南亚', '北非']
const ranges = [
  { label: '公元前1200-前500', value: '-1200:-500' },
  { label: '公元前500-1', value: '-500:1' },
  { label: '1-500', value: '1:500' },
  { label: '500-1000', value: '500:1000' },
  { label: '1000-1500', value: '1000:1500' },
  { label: '1500-1949', value: '1500:1949' },
]

const items: TimelineItem[] = [
  { region: '中国', name: '西周', start: -1046, end: -771, lane: 0, tone: 'china' },
  { region: '中国', name: '东周・春秋', start: -770, end: -476, lane: 1, tone: 'china' },
  { region: '中国', name: '东周・战国', start: -475, end: -221, lane: 2, tone: 'china' },
  { region: '中国', name: '秦', start: -221, end: -206, lane: 0, tone: 'china-strong' },
  { region: '中国', name: '西汉', start: -202, end: 8, lane: 1, tone: 'china-strong' },
  { region: '中国', name: '新', start: 9, end: 23, lane: 2, tone: 'china' },
  { region: '中国', name: '东汉', start: 25, end: 220, lane: 0, tone: 'china-strong' },
  { region: '中国', name: '三国', start: 220, end: 280, lane: 1, tone: 'china' },
  { region: '中国', name: '西晋', start: 266, end: 316, lane: 2, tone: 'china' },
  { region: '中国', name: '东晋', start: 317, end: 420, lane: 0, tone: 'china' },
  { region: '中国', name: '十六国', start: 304, end: 439, lane: 1, tone: 'steppe' },
  { region: '中国', name: '南朝', start: 420, end: 589, lane: 2, tone: 'china' },
  { region: '中国', name: '北朝', start: 386, end: 581, lane: 3, tone: 'china' },
  { region: '中国', name: '隋', start: 581, end: 618, lane: 0, tone: 'china-strong' },
  { region: '中国', name: '唐', start: 618, end: 907, lane: 1, tone: 'china-strong' },
  { region: '中国', name: '五代十国', start: 907, end: 979, lane: 2, tone: 'china' },
  { region: '中国', name: '北宋', start: 960, end: 1127, lane: 0, tone: 'china' },
  { region: '中国', name: '辽', start: 916, end: 1125, lane: 1, tone: 'steppe' },
  { region: '中国', name: '西夏', start: 1038, end: 1227, lane: 2, tone: 'steppe' },
  { region: '中国', name: '金', start: 1115, end: 1234, lane: 3, tone: 'steppe' },
  { region: '中国', name: '南宋', start: 1127, end: 1279, lane: 0, tone: 'china' },
  { region: '中国', name: '元', start: 1271, end: 1368, lane: 1, tone: 'mongol' },
  { region: '中国', name: '明', start: 1368, end: 1644, lane: 2, tone: 'china-strong' },
  { region: '中国', name: '清', start: 1644, end: 1912, lane: 0, tone: 'china' },
  { region: '中国', name: '中华民国', start: 1912, end: 1949, lane: 1, tone: 'modern' },

  { region: '草原与中亚', name: '斯基泰/萨迦', start: -900, end: -200, lane: 0, tone: 'steppe' },
  { region: '草原与中亚', name: '匈奴', start: -209, end: 155, lane: 1, tone: 'steppe' },
  { region: '草原与中亚', name: '贵霜帝国', start: 30, end: 375, lane: 2, tone: 'india' },
  { region: '草原与中亚', name: '柔然', start: 330, end: 555, lane: 0, tone: 'steppe' },
  { region: '草原与中亚', name: '嚈哒', start: 440, end: 670, lane: 1, tone: 'steppe' },
  { region: '草原与中亚', name: '突厥汗国', start: 552, end: 744, lane: 2, tone: 'steppe' },
  { region: '草原与中亚', name: '回鹘汗国', start: 744, end: 840, lane: 0, tone: 'steppe' },
  { region: '草原与中亚', name: '喀喇汗王朝', start: 840, end: 1212, lane: 1, tone: 'steppe' },
  { region: '草原与中亚', name: '西辽', start: 1124, end: 1218, lane: 2, tone: 'steppe' },
  { region: '草原与中亚', name: '蒙古帝国', start: 1206, end: 1368, lane: 0, tone: 'mongol' },
  { region: '草原与中亚', name: '察合台汗国', start: 1225, end: 1687, lane: 1, tone: 'mongol' },
  { region: '草原与中亚', name: '帖木儿帝国', start: 1370, end: 1507, lane: 2, tone: 'steppe' },
  { region: '草原与中亚', name: '哈萨克汗国', start: 1465, end: 1847, lane: 0, tone: 'steppe' },
  { region: '草原与中亚', name: '准噶尔汗国', start: 1634, end: 1758, lane: 1, tone: 'steppe' },
  { region: '草原与中亚', name: '俄属中亚', start: 1867, end: 1917, lane: 2, tone: 'russia' },

  { region: '西亚', name: '新亚述帝国', start: -911, end: -609, lane: 0, tone: 'westasia' },
  { region: '西亚', name: '新巴比伦王国', start: -626, end: -539, lane: 1, tone: 'westasia' },
  { region: '西亚', name: '阿契美尼德波斯', start: -550, end: -330, lane: 2, tone: 'persia' },
  { region: '西亚', name: '塞琉古帝国', start: -312, end: -63, lane: 0, tone: 'persia' },
  { region: '西亚', name: '安息帝国', start: -247, end: 224, lane: 1, tone: 'persia' },
  { region: '西亚', name: '萨珊波斯', start: 224, end: 651, lane: 2, tone: 'persia' },
  { region: '西亚', name: '正统哈里发', start: 632, end: 661, lane: 0, tone: 'arab' },
  { region: '西亚', name: '倭马亚王朝', start: 661, end: 750, lane: 1, tone: 'arab' },
  { region: '西亚', name: '阿拔斯王朝', start: 750, end: 1258, lane: 2, tone: 'arab' },
  { region: '西亚', name: '塞尔柱帝国', start: 1037, end: 1194, lane: 0, tone: 'ottoman' },
  { region: '西亚', name: '伊尔汗国', start: 1256, end: 1335, lane: 1, tone: 'mongol' },
  { region: '西亚', name: '奥斯曼帝国', start: 1299, end: 1922, lane: 2, tone: 'ottoman' },
  { region: '西亚', name: '萨法维王朝', start: 1501, end: 1736, lane: 0, tone: 'persia' },
  { region: '西亚', name: '卡扎尔王朝', start: 1789, end: 1925, lane: 1, tone: 'persia' },
  { region: '西亚', name: '土耳其共和国', start: 1923, end: 1949, lane: 2, tone: 'modern' },

  { region: '欧洲', name: '古典希腊', start: -800, end: -323, lane: 0, tone: 'europe' },
  { region: '欧洲', name: '马其顿帝国', start: -336, end: -323, lane: 1, tone: 'macedon' },
  { region: '欧洲', name: '罗马共和国', start: -509, end: -27, lane: 2, tone: 'rome' },
  { region: '欧洲', name: '罗马帝国', start: -27, end: 395, lane: 0, tone: 'rome' },
  { region: '欧洲', name: '西罗马帝国', start: 395, end: 476, lane: 1, tone: 'rome' },
  { region: '欧洲', name: '拜占庭帝国', start: 330, end: 1453, lane: 2, tone: 'rome' },
  { region: '欧洲', name: '法兰克王国', start: 481, end: 843, lane: 0, tone: 'europe' },
  { region: '欧洲', name: '加洛林帝国', start: 800, end: 888, lane: 1, tone: 'europe' },
  { region: '欧洲', name: '神圣罗马帝国', start: 962, end: 1806, lane: 2, tone: 'europe' },
  { region: '欧洲', name: '基辅罗斯', start: 882, end: 1240, lane: 0, tone: 'russia' },
  { region: '欧洲', name: '莫斯科大公国', start: 1283, end: 1547, lane: 1, tone: 'russia' },
  { region: '欧洲', name: '俄罗斯沙皇国', start: 1547, end: 1721, lane: 0, tone: 'russia' },
  { region: '欧洲', name: '俄罗斯帝国', start: 1721, end: 1917, lane: 1, tone: 'russia' },
  { region: '欧洲', name: '大英帝国', start: 1707, end: 1947, lane: 2, tone: 'britain' },
  { region: '欧洲', name: '法兰西第一帝国', start: 1804, end: 1815, lane: 0, tone: 'europe' },
  { region: '欧洲', name: '德意志帝国', start: 1871, end: 1918, lane: 1, tone: 'europe' },
  { region: '欧洲', name: '苏联', start: 1922, end: 1949, lane: 2, tone: 'russia' },

  { region: '南亚', name: '吠陀晚期/列国', start: -1200, end: -322, lane: 0, tone: 'india' },
  { region: '南亚', name: '孔雀王朝', start: -322, end: -185, lane: 1, tone: 'india-strong' },
  { region: '南亚', name: '巽伽王朝', start: -185, end: -73, lane: 2, tone: 'india' },
  { region: '南亚', name: '萨塔瓦哈纳', start: -100, end: 225, lane: 0, tone: 'india' },
  { region: '南亚', name: '笈多王朝', start: 320, end: 550, lane: 1, tone: 'india-strong' },
  { region: '南亚', name: '戒日王朝', start: 606, end: 647, lane: 2, tone: 'india' },
  { region: '南亚', name: '帕拉王朝', start: 750, end: 1161, lane: 0, tone: 'india' },
  { region: '南亚', name: '朱罗王朝', start: 848, end: 1279, lane: 1, tone: 'india' },
  { region: '南亚', name: '德里苏丹国', start: 1206, end: 1526, lane: 2, tone: 'india-strong' },
  { region: '南亚', name: '毗奢耶那伽罗', start: 1336, end: 1646, lane: 0, tone: 'india' },
  { region: '南亚', name: '莫卧儿帝国', start: 1526, end: 1857, lane: 1, tone: 'india-strong' },
  { region: '南亚', name: '马拉塔联盟', start: 1674, end: 1818, lane: 2, tone: 'india' },
  { region: '南亚', name: '英属印度', start: 1858, end: 1947, lane: 0, tone: 'britain' },
  { region: '南亚', name: '印度/巴基斯坦独立', start: 1947, end: 1949, lane: 1, tone: 'modern' },

  { region: '北非', name: '古埃及后期', start: -664, end: -332, lane: 0, tone: 'africa' },
  { region: '北非', name: '迦太基', start: -814, end: -146, lane: 1, tone: 'africa' },
  { region: '北非', name: '托勒密埃及', start: -305, end: -30, lane: 2, tone: 'africa' },
  { region: '北非', name: '罗马埃及/阿非利加', start: -30, end: 429, lane: 0, tone: 'rome' },
  { region: '北非', name: '汪达尔王国', start: 435, end: 534, lane: 1, tone: 'africa' },
  { region: '北非', name: '拜占庭北非', start: 534, end: 698, lane: 2, tone: 'rome' },
  { region: '北非', name: '阿格拉布王朝', start: 800, end: 909, lane: 0, tone: 'arab' },
  { region: '北非', name: '法蒂玛王朝', start: 909, end: 1171, lane: 1, tone: 'arab' },
  { region: '北非', name: '阿尤布王朝', start: 1171, end: 1250, lane: 2, tone: 'arab' },
  { region: '北非', name: '马穆鲁克苏丹国', start: 1250, end: 1517, lane: 0, tone: 'arab' },
  { region: '北非', name: '哈夫斯王朝', start: 1229, end: 1574, lane: 1, tone: 'arab' },
  { region: '北非', name: '奥斯曼埃及/马格里布', start: 1517, end: 1882, lane: 2, tone: 'ottoman' },
  { region: '北非', name: '穆罕默德・阿里王朝', start: 1805, end: 1914, lane: 0, tone: 'africa' },
  { region: '北非', name: '英埃苏丹/埃及王国', start: 1882, end: 1949, lane: 1, tone: 'britain' },
]

const canvasHeight = computed(() => Math.round((END_YEAR - START_YEAR) * PX_PER_YEAR + TOP_PAD + 80))
const ticks = [
  { year: -1000, label: '1000 BC' },
  { year: -500, label: '500 BC' },
  { year: 1, label: '1 AD' },
  { year: 500, label: '500' },
  { year: 1000, label: '1000' },
  { year: 1500, label: '1500' },
  { year: 1949, label: '1949' },
]

const yearToY = (year: number) => TOP_PAD + (year - START_YEAR) * PX_PER_YEAR
const formatYear = (year: number) => year < 0 ? `${Math.abs(year)} BC` : `${year} AD`
const itemsByRegion = (region: string) => items.filter(item => item.region === region)
const blockHeight = (item: TimelineItem) => Math.max(16, (item.end - item.start) * PX_PER_YEAR)
const blockStyle = (item: TimelineItem) => ({
  top: `${yearToY(item.start)}px`,
  height: `${blockHeight(item)}px`,
  left: `${6 + item.lane * 23}%`,
  width: '21%',
})

const jumpToRange = () => {
  if (!jumpRange.value || !timelineShell.value) return
  const [start] = jumpRange.value.split(':').map(Number)
  timelineShell.value.scrollTo({ top: Math.max(0, yearToY(start) - 40), behavior: 'smooth' })
}
</script>

<style scoped>
.history-module { height: 100%; display: flex; flex-direction: column; gap: 16px; color: #1e293b; }
.module-header { padding: 24px; background: rgba(255,255,255,0.86); border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
.header-content { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.title-box { display: flex; align-items: center; gap: 16px; }
.title-icon { font-size: 32px; color: #2f6f84; background: #fff; padding: 10px; border-radius: 10px; box-shadow: 0 4px 15px rgba(47,111,132,0.15); }
.title-box h2 { margin: 0; font-size: 22px; font-weight: 700; }
.title-box p { margin: 4px 0 0; font-size: 12px; color: #64748b; }
.jump-tools { width: 190px; }
.timeline-shell { flex: 1; min-height: 0; overflow: auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
.timeline-canvas { position: relative; min-width: 1180px; padding-left: 92px; }
.year-axis { position: sticky; left: 0; z-index: 6; width: 92px; height: 100%; background: #f8fafc; border-right: 1px solid #e2e8f0; }
.year-tick { position: absolute; right: 10px; transform: translateY(-50%); color: #64748b; font-size: 12px; font-weight: 800; }
.year-tick::after { content: ""; position: absolute; left: 74px; top: 50%; width: 1088px; border-top: 1px dashed #dbe4ef; }
.region-grid { position: absolute; inset: 0 0 0 92px; display: grid; grid-template-columns: repeat(6, 1fr); }
.region-col { position: relative; border-right: 1px solid #eef2f7; min-width: 180px; }
.region-head { position: sticky; top: 0; z-index: 5; height: 46px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.96); border-bottom: 1px solid #e2e8f0; font-weight: 900; color: #2f6f84; }
.region-track { position: absolute; inset: 0; top: 0; }
.era-block { position: absolute; border-radius: 5px; padding: 3px 5px; overflow: hidden; color: #1e293b; border: 1px solid rgba(0,0,0,.08); box-shadow: 0 2px 6px rgba(15,23,42,.05); }
.era-block strong { display: block; font-size: 11px; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.era-block span { display: block; margin-top: 2px; font-size: 9px; opacity: .78; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.era-block.compact { padding-top: 1px; }
.era-block.compact span { display: none; }
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
.modern { background: #334155; color: #fff; }
@media (max-width: 800px) {
  .module-header { padding: 18px; }
}
</style>
