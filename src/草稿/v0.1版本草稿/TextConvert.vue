<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Picture, Delete } from '@element-plus/icons-vue'
import { fetch } from '@tauri-apps/plugin-http'

// --- 状态数据 ---
const inputText = ref('')
const outputText = ref('')
const dialogVisible = ref(false)
const isLoading = ref(false)

// 图片相关的状态
const imageBase64 = ref('')

// 设置相关 (增加了模型名称设置)
const settings = ref({
  apiProvider: 'qwen', // API提供商
  apiUrl: 'https://dashscope.aliyuncs.com', // 基础API地址
  apiKey: '',
  modelName: 'qwen-vl-max' // 支持图片的视觉大模型
})

// API 提供商列表
const providerList = [
  { label: 'OpenAI', value: 'openai', baseUrl: 'https://api.openai.com' },
  { label: 'DeepSeek', value: 'deepseek', baseUrl: 'https://api.deepseek.com' },
  { label: '千问 (阿里云)', value: 'qwen', baseUrl: 'https://dashscope.aliyuncs.com' },
  { label: 'Kimi (Moonshot)', value: 'kimi', baseUrl: 'https://api.moonshot.cn' },
  { label: 'ChatAnywhere', value: 'chatanywhere', baseUrl: 'https://api.chatanywhere.tech' }
]

// 按提供商组织的模型列表
const modelsByProvider: Record<string, Array<{ label: string; value: string }>> = {
  openai: [
    { label: 'GPT-4o', value: 'gpt-4o' },
    { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
    { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
    { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
  ],
  deepseek: [
    { label: 'DeepSeek-V4-Pro', value: 'deepseek-v4-pro' },
    { label: 'DeepSeek-V4-Flash', value: 'deepseek-v4-flash' },
    { label: 'DeepSeek-Chat', value: 'deepseek-chat' },
    { label: 'DeepSeek-Coder', value: 'deepseek-coder' }
  ],
  qwen: [
    { label: '通义千问VL Max', value: 'qwen-vl-max' },
    { label: '通义千问VL Plus', value: 'qwen-vl-plus' },
    { label: '通义千问Max', value: 'qwen-max' },
    { label: '通义千问Plus', value: 'qwen-plus' },
    { label: '通义千问Turbo', value: 'qwen-turbo' }
  ],
  kimi: [
    { label: 'Moonshot v1-32k', value: 'moonshot-v1-32k' },
    { label: 'Moonshot v1-8k', value: 'moonshot-v1-8k' },
    { label: 'Moonshot v1-20k', value: 'moonshot-v1-20k' }
  ],
  chatanywhere: [
    { label: 'GPT-5.5 Turbo', value: 'gpt-5.5-turbo' },
    { label: 'GPT-5.4', value: 'gpt-5.4' },
    { label: 'GPT-5.4-Nano', value: 'gpt-5.4-nano' },
    { label: 'GPT-5.2', value: 'gpt-5.2' }
  ]
}

// 根据提供商获取对应的模型列表
const getModelsForProvider = (provider: string) => {
  return modelsByProvider[provider] || []
}

// 当提供商改变时，更新基础URL和重置模型选择
const handleProviderChange = (provider: string) => {
  const providerInfo = providerList.find(p => p.value === provider)
  if (providerInfo) {
    settings.value.apiUrl = providerInfo.baseUrl
    // 默认选择该提供商的第一个模型
    const models = getModelsForProvider(provider)
    if (models.length > 0) {
      settings.value.modelName = models[0].value
    }
  }
}

// 组件加载时读取配置
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

// --- 功能函数 ---

// 处理图片上传：将图片转换为 Base64 编码，AI 接口需要这个格式
const handleImageChange = (file: any) => {
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    imageBase64.value = reader.result as string
    ElMessage.success('图片已加载，可点击开始转换')
  }
}

// 移除选中的图片
const removeImage = () => {
  imageBase64.value = ''
}

const removeSpaces = () => {
  if (!inputText.value && !outputText.value) return
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
  try {
    await navigator.clipboard.writeText(outputText.value)
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const saveSettings = () => {
  localStorage.setItem('apiProvider', settings.value.apiProvider)
  localStorage.setItem('apiUrl', settings.value.apiUrl)
  localStorage.setItem('apiKey', settings.value.apiKey)
  localStorage.setItem('modelName', settings.value.modelName)
  dialogVisible.value = false
  ElMessage.success('设置已保存')
}

// 核心：调用真实 AI API 进行 OCR 和 繁简转换
const startConvert = async () => {
  if (!settings.value.apiKey) {
    dialogVisible.value = true
    return ElMessage.error('请先配置 API Key')
  }
  if (!inputText.value && !imageBase64.value) {
    return ElMessage.warning('请提供需要转换的文字或图片')
  }

  isLoading.value = true
  outputText.value = "正在呼叫 AI 助手，请稍候（通常需要几秒到十几秒）...\n\n"

  // 规范化 API URL：根据不同提供商添加正确的路径
  let apiUrl = settings.value.apiUrl.trim()
  if (!apiUrl.endsWith('/chat/completions')) {
    if (settings.value.apiProvider === 'qwen' && apiUrl.includes('dashscope.aliyuncs.com')) {
      apiUrl += '/compatible-mode/v1/chat/completions'
    } else {
      apiUrl += '/v1/chat/completions'
    }
  }

  // 1. 构建给 AI 的提示词 (Prompt)
  let messages: any[] = [
    {
      role: "system",
      content: "你是一个专业的古籍整理与繁简转换专家。任务：1. 如果用户提供图片，请识别其中的文字，注意通常为竖排排版，请按正确顺序阅读。2. 请将所有内容直接转换为现代标准简体中文输出。3. 不要包含任何多余的解释、问候语或Markdown格式，只输出转换后的纯文本。"
    }
  ]

  // 2. 根据用户是上传了图片，还是纯文本，构建不同的请求体
  if (imageBase64.value) {
    // 包含图片的请求
    messages.push({
      role: "user",
      content: [
        { type: "text", text: inputText.value ? `请结合图片，处理以下文本：${inputText.value}` : "请识别这张古籍图片，并输出简体中文文本。" },
        { type: "image_url", image_url: { url: imageBase64.value } }
      ]
    })
  } else {
    // 纯文本请求
    messages.push({
      role: "user",
      content: inputText.value
    })
  }

  // 3. 发送真实的网络请求 (采用标准的兼容 OpenAI 格式)
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.value.apiKey}` 
      },
      body: JSON.stringify({
        model: settings.value.modelName,
        messages: messages,
        temperature: 0.1 
      })
    })

    // 【强力除错修改】：先强制把服务器的回复读取为纯文本，不管它是对是错
    const responseText = await response.text()

    // 检查 HTTP 状态码是否正常 (200)
    if (!response.ok) {
      throw new Error(`服务器拒绝请求 (状态码: ${response.status})\n详细原因: ${responseText}`)
    }

    // 尝试将纯文本解析为 JSON 对象
    let data;
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`无法解析服务器的回复，服务器可能出错了。\n原始回复: ${responseText}`)
    }

    // 提取 AI 返回的内容
    if (data.choices && data.choices.length > 0) {
      outputText.value = data.choices[0].message.content
      ElMessage.success('转换/识别完成！')
    } else {
      throw new Error(`API 没有返回预期的文字。\n完整数据: ${responseText}`)
    }

  } catch (error: any) {
    const errDetail = typeof error === 'string' ? error : (error.message || JSON.stringify(error))
    outputText.value = `请求中止！\n====================\n${errDetail}\n====================\n提示: 如果状态码是 401，说明 API Key 填错了；如果是 400，说明模型不支持。`
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="convert-container">
    <div class="toolbar">
      <el-button-group>
        <el-button type="primary" :loading="isLoading" @click="startConvert">
          {{ isLoading ? '处理中...' : '开始识别 / 繁简转换' }}
        </el-button>
        <el-button @click="removeSpaces">删除文本空格</el-button>
        <el-button @click="clearText">清空全部</el-button>
      </el-button-group>

      <el-button type="info" icon="Setting" plain @click="dialogVisible = true">设置 AI 接口</el-button>
    </div>

    <el-row :gutter="20" class="editor-area">
      <!-- 左侧：输入与上传区 -->
      <el-col :span="12" class="left-col">
        
        <!-- OCR 图片上传区 -->
        <div class="image-upload-area" v-if="!imageBase64">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImageChange"
            accept="image/*"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽古籍图片到此处，或 <em>点击上传</em>
            </div>
          </el-upload>
        </div>
        
        <!-- 图片预览区 -->
        <div class="image-preview" v-else>
          <img :src="imageBase64" class="preview-img" />
          <el-button type="danger" icon="Delete" circle class="remove-btn" @click="removeImage" />
        </div>

        <div class="area-header" style="margin-top: 15px;">
          <span>待转换文本（可选填补充说明）</span>
        </div>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="imageBase64 ? 6 : 12" 
          placeholder="如果是纯文本转换，请在此粘贴繁体字。如果是OCR，这里可以留空。"
          resize="none"
        />
      </el-col>

      <!-- 右侧：输出区 -->
      <el-col :span="12">
        <div class="area-header">
          <span>识别 / 转换结果</span>
          <el-button size="small" type="success" plain @click="copyResult">复制结果</el-button>
        </div>
        <el-input
          v-model="outputText"
          type="textarea"
          :rows="18"
          placeholder="AI 的识别结果将显示在这里..."
          readonly
          resize="none"
        />
      </el-col>
    </el-row>

    <!-- 设置弹窗 -->
    <el-dialog v-model="dialogVisible" title="API 设置" width="450px">
      <el-alert title="推荐deepseek用于繁简转换，openai或chatanywhere用于图像识别" type="info" show-icon style="margin-bottom: 15px;"/>
      <el-form :model="settings" label-width="90px">
        <el-form-item label="API 来源">
          <el-select v-model="settings.apiProvider" placeholder="选择 API 提供商" @change="handleProviderChange">
            <el-option
              v-for="provider in providerList"
              :key="provider.value"
              :label="provider.label"
              :value="provider.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模型名称">
          <el-select v-model="settings.modelName" placeholder="选择模型">
            <el-option
              v-for="model in getModelsForProvider(settings.apiProvider)"
              :key="model.value"
              :label="model.label"
              :value="model.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="接口地址">
          <el-input v-model="settings.apiUrl" placeholder="自动根据来源配置" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="settings.apiKey" type="password" placeholder="输入你的 API 密钥" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.convert-container { height: 100%; display: flex; flex-direction: column; }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 20px; }
.editor-area { flex: 1; }
.left-col { display: flex; flex-direction: column; }
.area-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-weight: bold; color: #606266; }

/* 上传区样式 */
.image-upload-area { margin-bottom: 10px; }
.image-preview { position: relative; width: 100%; height: 180px; border: 1px dashed #dcdfe6; border-radius: 6px; display: flex; justify-content: center; align-items: center; background-color: #f8f9fa; margin-bottom: 10px;}
.preview-img { max-width: 100%; max-height: 100%; object-fit: contain; }
.remove-btn { position: absolute; top: 10px; right: 10px; }
</style>