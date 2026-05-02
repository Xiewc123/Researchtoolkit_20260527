<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Picture,
  Delete,
  Setting,
  CopyDocument,
  MagicStick,
  CircleClose,
  RefreshRight,
  UploadFilled,
  Reading,
  Operation
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
  openai: [
    { label: 'GPT-4o', value: 'gpt-4o' },
    { label: 'GPT-4o Mini', value: 'gpt-4o-mini' }
  ],
  deepseek: [
    { label: 'DeepSeek-v4-flash', value: 'deepseek-v4-flash' },
    { label: 'DeepSeek-v4-pro', value: 'deepseek-v4-pro' }
  ],
  qwen: [
    { label: '通义千问VL Max', value: 'qwen-vl-max' },
    { label: '通义千问VL Plus', value: 'qwen-vl-plus' },
    { label: '通义千问Max', value: 'qwen-max' }
  ],
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

const clearText = () => {
  inputText.value = ''
  outputText.value = ''
  imageBase64.value = ''
}

const copyResult = async () => {
  if (!outputText.value) return ElMessage.warning('没有可复制的内容')
  await navigator.clipboard.writeText(outputText.value)
  ElMessage.success('复制成功')
}

const saveSettings = () => {
  localStorage.setItem('apiProvider', settings.value.apiProvider)
  localStorage.setItem('apiUrl', settings.value.apiUrl)
  localStorage.setItem('apiKey', settings.value.apiKey)
  localStorage.setItem('modelName', settings.value.modelName)
  dialogVisible.value = false
  ElMessage.success('设置已保存')
}

const startConvert = async () => {
  if (!settings.value.apiKey) {
    dialogVisible.value = true
    return ElMessage.error('请先配置 API Key')
  }
  if (!inputText.value && !imageBase64.value) return ElMessage.warning('请提供文字或图片')

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
  <div class="tool-view">
    <div class="page-shell">
      <header class="hero-bar">
        <div class="hero-copy">
          <div class="hero-kicker">
            <span class="kicker-dot"></span>
            <span>TextConvert · 科研级文本处理</span>
          </div>
          <h2>繁简转换 & 文本 OCR</h2>
          <p>基于多模态大模型的古籍识别与转换系统，面向学术整理、文献校勘与 OCR 复核场景。</p>
        </div>

        <div class="hero-actions">
          <div class="hero-badges">
            <span class="info-chip"><el-icon><Reading /></el-icon> 学术整理</span>
            <span class="info-chip"><el-icon><Picture /></el-icon> 图文兼容</span>
            <span class="info-chip"><el-icon><Operation /></el-icon> 双端校对</span>
          </div>
          <div class="button-group">
            <el-button type="primary" size="large" :loading="isLoading" @click="startConvert" class="btn-primary">
              <el-icon><MagicStick /></el-icon>
              <span>运行转换</span>
            </el-button>
            <el-button size="large" circle :icon="Setting" @click="dialogVisible = true" class="btn-ghost" />
          </div>
        </div>
      </header>

      <el-row :gutter="24" class="workspace" align="stretch">
        <el-col :xs="24" :lg="12" class="workspace-col">
          <section class="panel card-surface">
            <div class="panel-header">
              <div class="panel-title">
                <span class="panel-icon"><el-icon><UploadFilled /></el-icon></span>
                <div>
                  <h3>数据输入源</h3>
                  <p>图片或文本均可作为输入</p>
                </div>
              </div>
              <el-button link :icon="Delete" @click="clearText">清空</el-button>
            </div>

            <div class="panel-body">
              <div class="upload-container" v-if="!imageBase64">
                <el-upload
                  drag
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleImageChange"
                  accept="image/*"
                  class="upload-card"
                >
                  <div class="upload-graphic">
                    <el-icon class="upload-icon"><Picture /></el-icon>
                  </div>
                  <div class="upload-text">拖拽扫描件至此，或 <em>点击上传</em></div>
                  <div class="upload-hint">支持常见图片格式，适合古籍、文献、截图与扫描稿</div>
                </el-upload>
              </div>

              <div class="preview-container" v-else>
                <img :src="imageBase64" />
                <div class="overlay-tools">
                  <el-button type="danger" :icon="CircleClose" circle @click="removeImage" />
                </div>
              </div>

              <el-input
                v-model="inputText"
                type="textarea"
                :rows="8"
                placeholder="在此补充备注或粘贴纯文本..."
                class="custom-textarea input-area"
                resize="none"
              />
            </div>
          </section>
        </el-col>

        <el-col :xs="24" :lg="12" class="workspace-col">
          <section class="panel card-surface">
            <div class="panel-header">
              <div class="panel-title">
                <span class="panel-icon"><el-icon><Reading /></el-icon></span>
                <div>
                  <h3>处理结果</h3>
                  <p>转换后的文本会在此展示</p>
                </div>
              </div>
              <div class="header-ops">
                <el-button link :icon="RefreshRight" @click="removeSpaces">去空格</el-button>
                <el-button type="primary" link :icon="CopyDocument" @click="copyResult">复制</el-button>
              </div>
            </div>

            <div class="panel-body result-layout">
              <el-input
                v-model="outputText"
                type="textarea"
                readonly
                placeholder="转换结果将在此实时呈现..."
                class="custom-textarea result-area"
                resize="none"
              />
            </div>
          </section>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="dialogVisible" title="API 参数配置" width="450px" align-center class="settings-dialog">
      <el-form :model="settings" label-width="100px" label-position="left" class="settings-form">
        <el-form-item label="API 提供商">
          <el-select v-model="settings.apiProvider" @change="handleProviderChange" style="width: 100%">
            <el-option v-for="p in providerList" :key="p.value" :label="p.label" :value="p.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型名称">
          <el-select v-model="settings.modelName" style="width: 100%">
            <el-option v-for="m in getModelsForProvider(settings.apiProvider)" :key="m.value" :label="m.label" :value="m.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="接口地址">
          <el-input v-model="settings.apiUrl" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="settings.apiKey" type="password" show-password />
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
.tool-view {
  height: 100%;
  background:
    radial-gradient(circle at top left, rgba(15, 23, 42, 0.05), transparent 28%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.06), transparent 24%),
    linear-gradient(180deg, #f8fafc 0%, #f5f7fb 100%);
}

.page-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  min-height: 0;
}

.hero-bar {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-end;
  padding: 22px 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

.hero-copy h2 {
  margin: 8px 0 8px;
  font-size: 1.6rem;
  line-height: 1.2;
  color: #0f172a;
  letter-spacing: 0.02em;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
}

.hero-copy p {
  margin: 0;
  max-width: 760px;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.8;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.kicker-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, #0f172a, #64748b);
  box-shadow: 0 0 0 6px rgba(15, 23, 42, 0.06);
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.info-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: #334155;
  font-size: 0.78rem;
  font-weight: 600;
}

.workspace {
  flex: 1;
  min-height: 0;
}

.workspace-col {
  display: flex;
}

.card-surface {
  height: 100%;
  min-height: 0;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-title h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
  letter-spacing: 0.02em;
}

.panel-title p {
  margin: 3px 0 0;
  color: #94a3b8;
  font-size: 0.78rem;
}

.panel-icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.08), rgba(148, 163, 184, 0.16));
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-height: 0;
}

.header-ops {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-container {
  flex: 0 0 auto;
}

.upload-card :deep(.el-upload-dragger) {
  width: 100%;
  border-radius: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.45);
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.92));
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: 0.25s ease;
}

.upload-card :deep(.el-upload-dragger:hover) {
  border-color: rgba(15, 23, 42, 0.45);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}

.upload-graphic {
  width: 62px;
  height: 62px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.2);
  margin-bottom: 10px;
}

.upload-icon {
  font-size: 28px;
  color: #334155;
}

.upload-text {
  font-size: 0.95rem;
  color: #334155;
  font-weight: 600;
  text-align: center;
}

.upload-text em {
  font-style: normal;
  color: #0f172a;
}

.upload-hint {
  margin-top: 6px;
  max-width: 340px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.8rem;
  line-height: 1.6;
}

.preview-container {
  position: relative;
  height: 210px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.preview-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: linear-gradient(180deg, #fff, #f8fafc);
}

.overlay-tools {
  position: absolute;
  top: 12px;
  right: 12px;
}

.custom-textarea :deep(.el-textarea__inner) {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(248, 250, 252, 0.92);
  padding: 16px 18px;
  line-height: 1.75;
  color: #0f172a;
  font-size: 0.94rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.custom-textarea :deep(.el-textarea__inner::placeholder) {
  color: #94a3b8;
}

.input-area :deep(.el-textarea__inner) {
  min-height: 220px;
}

.result-layout {
  flex: 1;
}

.result-area {
  height: 100%;
}

.result-area :deep(.el-textarea__inner) {
  min-height: 100%;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.96));
}

.btn-primary {
  height: 44px;
  border: none;
  padding: 0 22px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0f172a, #334155);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.16);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #111827, #475569);
}

.btn-ghost {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.8);
  color: #0f172a;
}

:deep(.settings-dialog .el-dialog) {
  border-radius: 22px;
  overflow: hidden;
}

:deep(.settings-dialog .el-dialog__header) {
  padding: 20px 22px 12px;
}

:deep(.settings-dialog .el-dialog__body) {
  padding: 8px 22px 0;
}

:deep(.settings-dialog .el-dialog__footer) {
  padding: 16px 22px 22px;
}

.settings-form :deep(.el-form-item__label) {
  color: #334155;
  font-weight: 600;
}

:deep(.el-button.is-link) {
  color: #334155;
}

:deep(.el-button.is-link:hover) {
  color: #0f172a;
}

@media (max-width: 1280px) {
  .hero-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-actions {
    align-items: flex-start;
    width: 100%;
  }

  .button-group {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .card-surface,
  .hero-bar {
    border-radius: 18px;
    padding: 16px;
  }

  .panel-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .button-group {
    display: flex;
    width: 100%;
  }

  .btn-primary {
    flex: 1;
  }
}
</style>
