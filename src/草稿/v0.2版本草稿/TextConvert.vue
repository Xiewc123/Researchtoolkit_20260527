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
  RefreshRight
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
  outputText.value = "正在处理中..."

  let apiUrl = settings.value.apiUrl.trim()
  if (!apiUrl.endsWith('/chat/completions')) {
    apiUrl += (settings.value.apiProvider === 'qwen' ? '/compatible-mode/v1/chat/completions' : '/v1/chat/completions')
  }

  let messages: any[] = [
    { role: "system", content: "你是一个专业的古籍整理专家。请将输入内容直接转换为现代标准简体中文输出，不要包含解释或Markdown。" }
  ]

  if (imageBase64.value) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: inputText.value || "请识别此图片并输出简体中文。" },
        { type: "image_url", image_url: { url: imageBase64.value } }
      ]
    })
  } else {
    messages.push({ role: "user", content: inputText.value })
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
    <!-- 顶部动作条 -->
    <div class="action-bar">
      <div class="title-section">
        <h2>繁简转换 & 文本 OCR</h2>
        <p>基于多模态大模型的古籍识别与转换系统</p>
      </div>
      <div class="button-group">
        <el-button type="primary" size="large" :loading="isLoading" @click="startConvert" class="btn-primary">
          <el-icon><MagicStick /></el-icon> &nbsp; 运行转换
        </el-button>
        <el-button size="large" circle :icon="Setting" @click="dialogVisible = true" />
      </div>
    </div>

    <el-row :gutter="30" class="workspace">
      <!-- 输入端 -->
      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>数据输入源</span>
            <el-button link :icon="Delete" @click="clearText">清空</el-button>
          </div>
          
          <div class="upload-container" v-if="!imageBase64">
            <el-upload
              drag
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleImageChange"
              accept="image/*"
            >
              <el-icon class="upload-icon"><Picture /></el-icon>
              <div class="upload-text">拖拽扫描件至此，或 <em>点击上传</em></div>
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
            class="custom-textarea"
            resize="none"
          />
        </div>
      </el-col>

      <!-- 输出端 -->
      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>处理结果</span>
            <div class="header-ops">
               <el-button link :icon="RefreshRight" @click="removeSpaces">去空格</el-button>
               <el-button type="primary" link :icon="CopyDocument" @click="copyResult">复制</el-button>
            </div>
          </div>
          <el-input
            v-model="outputText"
            type="textarea"
            readonly
            placeholder="转换结果将在此实时呈现..."
            class="custom-textarea result-area"
            resize="none"
          />
        </div>
      </el-col>
    </el-row>

    <!-- 设置弹窗 -->
    <el-dialog v-model="dialogVisible" title="API 参数配置" width="450px" align-center>
      <el-form :model="settings" label-width="100px" label-position="left">
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
.tool-view { display: flex; flex-direction: column; height: 100%; }
.action-bar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; }
.title-section h2 { margin: 0; font-size: 1.4rem; color: #1e293b; font-family: "Noto Serif SC", serif; }
.title-section p { margin: 4px 0 0; color: #94a3b8; font-size: 0.85rem; }
.workspace { flex: 1; min-height: 0; }
.panel { display: flex; flex-direction: column; gap: 12px; height: 100%; }
.panel-header { display: flex; justify-content: space-between; align-items: center; color: #64748b; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
:deep(.custom-textarea .el-textarea__inner) { border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc; padding: 12px; line-height: 1.6; color: #334155; font-size: 0.9rem; }
.result-area :deep(.el-textarea__inner) { background-color: #f1f5f9; color: #1e293b; border-color: transparent; height: 100% !important; min-height: 400px; }
.upload-container :deep(.el-upload-dragger) { border: 2px dashed #cbd5e1; background: #f8fafc; height: 180px; display: flex; flex-direction: column; justify-content: center; border-radius: 10px; }
.upload-icon { font-size: 32px; color: #94a3b8; margin-bottom: 8px; }
.preview-container { height: 180px; position: relative; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; background: #f1f5f9; }
.preview-container img { width: 100%; height: 100%; object-fit: contain; }
.overlay-tools { position: absolute; top: 8px; right: 8px; }
.btn-primary { background: #1e293b; border: none; padding: 0 25px; }
.btn-primary:hover { background: #334155; }
</style>