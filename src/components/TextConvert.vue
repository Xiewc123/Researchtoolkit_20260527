<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Picture, Delete, Setting, CopyDocument, MagicStick,
  CircleClose, RefreshRight, UploadFilled, Reading, Position, Cpu
} from '@element-plus/icons-vue'
import { fetch } from '@tauri-apps/plugin-http'

// --- 1. 状态数据 ---
const inputText = ref('')
const outputText = ref('')
const dialogVisible = ref(false)
const isLoading = ref(false)
const imageBase64 = ref('')

const settings = ref({
  apiProvider: 'qwen',
  apiUrl: 'https://api.deepseek.com',
  apiKey: '',
  modelName: 'qwen-vl-max'
})

const providerList = [
  { label: 'OpenAI', value: 'openai', baseUrl: 'https://api.openai.com' },
  { label: 'DeepSeek', value: 'deepseek', baseUrl: 'https://api.deepseek.com' },
  { label: '千问 (阿里云)', value: 'qwen', baseUrl: 'https://dashscope.aliyuncs.com' },
  { label: 'Kimi (Moonshot)', value: 'kimi', baseUrl: 'https://api.moonshot.cn' },
  { label: 'ChatAnywhere', value: 'chatanywhere', baseUrl: 'https://api.chatanywhere.tech' }
]

const modelsByProvider: Record<string, Array<{ label: string; value: string }>> = {
  openai: [{ label: 'GPT-4o', value: 'gpt-4o' }, { label: 'GPT-4o Mini', value: 'gpt-4o-mini' }],
  deepseek: [{ label: 'DeepSeek-v4-flash', value: 'deepseek-v4-flash' }, { label: 'DeepSeek-v4-pro', value: 'deepseek-v4-pro' }],
  qwen: [{ label: '通义千问VL Max', value: 'qwen-vl-max' }, { label: '通义千问VL Plus', value: 'qwen-vl-plus' }, { label: '通义千问Max', value: 'qwen-max' }],
  kimi: [{ label: 'Moonshot v1-32k', value: 'moonshot-v1-32k' }],
  chatanywhere: [{ label: 'GPT-4o', value: 'gpt-4o' }]
}

// --- 2. 逻辑函数 ---
const getModelsForProvider = (provider: string) => modelsByProvider[provider] || []

const handleProviderChange = (provider: string) => {
  const providerInfo = providerList.find(p => p.value === provider)
  if (providerInfo) {
    settings.value.apiUrl = providerInfo.baseUrl
    const models = getModelsForProvider(provider)
    if (models.length > 0) settings.value.modelName = models[0].value
  }
}

onMounted(() => {
  const savedProvider = localStorage.getItem('apiProvider')
  const savedUrl = localStorage.getItem('apiUrl')
  const savedKey = localStorage.getItem('apiKey')
  const savedModel = localStorage.getItem('modelName')
  if (savedProvider) settings.value.apiProvider = savedProvider
  if (savedUrl) settings.value.apiUrl = savedUrl
  if (savedKey) settings.value.apiKey = savedKey
  if (savedModel) settings.value.modelName = savedModel
})

const handleImageChange = (file: any) => {
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    imageBase64.value = reader.result as string
    ElMessage.success('图片已加载')
  }
}

const removeImage = () => { imageBase64.value = '' }

const removeSpaces = () => {
  if (inputText.value) inputText.value = inputText.value.replace(/\s+/g, '')
  if (outputText.value) outputText.value = outputText.value.replace(/\s+/g, '')
  ElMessage.success('已清除空格')
}

const clearText = () => { inputText.value = ''; outputText.value = ''; imageBase64.value = ''; }

const copyResult = async () => {
  if (!outputText.value) return ElMessage.warning('没有可复制的内容')
  await navigator.clipboard.writeText(outputText.value)
  ElMessage.success('复制成功')
}

const saveSettings = () => {
  localStorage.setItem('apiProvider', settings.value.apiProvider);
  localStorage.setItem('apiUrl', settings.value.apiUrl);
  localStorage.setItem('apiKey', settings.value.apiKey);
  localStorage.setItem('modelName', settings.value.modelName);
  dialogVisible.value = false;
  ElMessage.success('配置已保存');
}

const startConvert = async () => {
  if (!settings.value.apiKey) { dialogVisible.value = true; return ElMessage.error('请先配置 API Key'); }
  if (!inputText.value && !imageBase64.value) return ElMessage.warning('请提供文字或图片');

  isLoading.value = true
  outputText.value = '正在处理中...'

  let apiUrl = settings.value.apiUrl.trim()
  if (!apiUrl.endsWith('/chat/completions')) {
    apiUrl += (settings.value.apiProvider === 'qwen' ? '/compatible-mode/v1/chat/completions' : '/v1/chat/completions')
  }

  let messages: any[] = [
    { role: 'system', content: '你是一个专业的古籍整理专家。请将输入内容直接转换为现代标准简体中文输出，不要包含解释或Markdown。' }
  ]

  if (imageBase64.value) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: inputText.value || '请识别此图片并输出简体中文。' },
        { type: 'image_url', image_url: { url: imageBase64.value } }
      ]
    })
  } else {
    messages.push({ role: 'user', content: inputText.value })
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.value.apiKey}` },
      body: JSON.stringify({ model: settings.value.modelName, messages, temperature: 0.1 })
    })
    const data = await response.json()
    outputText.value = data.choices[0].message.content
    ElMessage.success('处理完成')
  } catch (error: any) {
    outputText.value = `出错：${error.message}`
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="ocr-module">
    <!-- 1. 顶部标题栏 (视觉对齐朝代年号页) -->
    <div class="module-header">
      <div class="header-content">
        <div class="title-box">
          <el-icon class="title-icon"><MagicStick /></el-icon>
          <div>
            <h2>繁简转换 & 文本 OCR</h2>
            <p>TEXT AND OCR PROCESSING / 文本与图像处理</p>
          </div>
        </div>
        <!-- 右侧：当前模型状态展示 -->
        <div class="mini-status-viz">
          <div class="status-badge">
            <el-icon><Cpu /></el-icon>
            <span>{{ settings.modelName }}</span>
          </div>
          <span class="provider-label">引擎: {{ settings.apiProvider.toUpperCase() }}</span>
        </div>
      </div>
    </div>

    <!-- 2. 操作栏 (视觉对齐查询栏) -->
    <div class="control-bar-card">
      <el-row align="middle" :gutter="20">
        <el-col :span="14">
          <div class="info-guide">
            <el-icon><Reading /></el-icon>
            <span>支持拖拽上传识别图片，或粘贴文本进行繁简转化。</span>
          </div>
        </el-col>
        <el-col :span="10" class="text-right">
          <div class="button-group">
            <el-button 
              type="primary" 
              size="large" 
              :loading="isLoading" 
              @click="startConvert" 
              class="btn-run"
            >
              <el-icon><Position /></el-icon>
              <span>运行转换</span>
            </el-button>
            <el-button 
              size="large" 
              :icon="Setting" 
              @click="dialogVisible = true" 
              class="btn-config"
            >
              配置
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 3. 内容工作区 (对齐列表容器风格) -->
    <div class="list-container workspace-container">
      <el-row :gutter="24" style="height: 100%">
        <!-- 输入面板 -->
        <el-col :xs="24" :sm="12" class="workspace-col">
          <div class="panel-inner">
            <div class="panel-sub-header">
              <span class="panel-label"><el-icon><UploadFilled /></el-icon> 输入源</span>
              <el-button link type="danger" :icon="Delete" @click="clearText">清空</el-button>
            </div>
            
            <div class="input-content-box">
              <div class="upload-wrapper" v-if="!imageBase64">
                <el-upload
                  drag
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleImageChange"
                  accept="image/*"
                  class="mini-drag"
                >
                  <el-icon class="el-icon--upload"><Picture /></el-icon>
                  <div class="el-upload__text">拖拽扫描件或 <em>点击上传</em></div>
                </el-upload>
              </div>
              
              <div class="preview-wrapper" v-else>
                <img :src="imageBase64" class="img-preview" />
                <el-button 
                  class="remove-img-btn" 
                  type="danger" 
                  :icon="CircleClose" 
                  circle 
                  @click="removeImage" 
                />
              </div>

              <el-input
                v-model="inputText"
                type="textarea"
                placeholder="在此粘贴繁体文本或输入图像处理备注..."
                class="main-editor"
                resize="none"
              />
            </div>
          </div>
        </el-col>

        <!-- 输出面板 -->
        <el-col :xs="24" :sm="12" class="workspace-col">
          <div class="panel-inner">
            <div class="panel-sub-header">
              <span class="panel-label"><el-icon><Reading /></el-icon> 处理结果</span>
              <div class="ops-group">
                <el-button link :icon="RefreshRight" @click="removeSpaces">去空格</el-button>
                <el-button type="primary" link :icon="CopyDocument" @click="copyResult">复制</el-button>
              </div>
            </div>

            <div class="input-content-box">
              <el-input
                v-model="outputText"
                type="textarea"
                readonly
                placeholder="转换后的简体中文结果将在此显示..."
                class="main-editor result-editor"
                resize="none"
              />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 4. 配置弹窗 -->
    <el-dialog v-model="dialogVisible" title="API 参数配置" width="450px" align-center class="custom-dialog">
      <el-form :model="settings" label-width="100px" label-position="left">
        <el-form-item label="API 提供商">
          <el-select v-model="settings.apiProvider" @change="handleProviderChange" class="w-full">
            <el-option v-for="p in providerList" :key="p.value" :label="p.label" :value="p.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型名称">
          <el-select v-model="settings.modelName" class="w-full">
            <el-option v-for="m in getModelsForProvider(settings.apiProvider)" :key="m.value" :label="m.label" :value="m.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="接口地址">
          <el-input v-model="settings.apiUrl" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="settings.apiKey" type="password" show-password placeholder="请输入有效的 API Key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.ocr-module {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 1. Header 样式完全复刻索引表 */
.module-header {
  padding: 24px;
  background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5));
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
}
.header-content { display: flex; justify-content: space-between; align-items: center; }
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

/* 右侧状态展示 */
.mini-status-viz { text-align: right; }
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #2f6f84;
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}
.provider-label { display: block; font-size: 11px; color: #94a3b8; }

/* 2. 操作栏复刻查询栏 */
.control-bar-card {
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.4);
}
.info-guide { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; }
.text-right { text-align: right; }
.button-group { display: inline-flex; gap: 12px; }
.btn-run { background-color: #2f6f84 !important; border: none; padding: 0 24px; border-radius: 10px; font-weight: 600; }
.btn-config { border-radius: 10px; border-color: #e2e8f0; color: #475569; }

/* 3. 工作区复刻列表容器 */
.workspace-container {
  flex: 1;
  overflow: hidden;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
}
.workspace-col { height: 100%; display: flex; flex-direction: column; }
.panel-inner { height: 100%; display: flex; flex-direction: column; gap: 12px; }
.panel-sub-header { display: flex; justify-content: space-between; align-items: center; }
.panel-label { font-weight: 700; color: #2f6f84; font-size: 15px; display: flex; align-items: center; gap: 8px; }

/* 输入输出框逻辑区域 */
.input-content-box { flex: 1; display: flex; flex-direction: column; gap: 12px; min-height: 0; }
.upload-wrapper { flex-shrink: 0; }
.mini-drag :deep(.el-upload-dragger) {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}
.mini-drag .el-icon--upload { font-size: 32px; color: #94a3b8; margin-bottom: 8px; }

.preview-wrapper {
  position: relative;
  height: 160px;
  background: #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.img-preview { width: 100%; height: 100%; object-fit: contain; }
.remove-img-btn { position: absolute; top: 8px; right: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }

.main-editor { flex: 1; }
.main-editor :deep(.el-textarea__inner) {
  height: 100%;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 14px;
  font-family: "Microsoft YaHei", sans-serif;
  line-height: 1.6;
}
.result-editor :deep(.el-textarea__inner) {
  background: #fcfdfe;
  border-color: #2f6f8440;
}

/* 4. 弹窗适配 */
.w-full { width: 100%; }
:deep(.el-dialog.custom-dialog) { border-radius: 16px; overflow: hidden; }
</style>