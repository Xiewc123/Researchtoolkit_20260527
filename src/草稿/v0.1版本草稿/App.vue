<script setup lang="ts">
import { ref } from 'vue'
// 导入我们即将创建的繁简转换组件
import TextConvert from './components/TextConvert.vue'

// 记录当前激活的菜单项，默认是 'convert'
const activeMenu = ref('convert')

// 菜单切换处理函数
const handleSelect = (key: string) => {
  activeMenu.value = key
}
</script>

<template>
  <el-container class="app-container">
    <!-- 左侧边栏 -->
    <el-aside width="200px" class="sidebar">
      <h3 class="logo-title">科研工具箱</h3>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        @select="handleSelect"
      >
        <el-menu-item index="convert">繁简转换 & OCR</el-menu-item>
        <el-menu-item index="dynasty">朝代年号表</el-menu-item>
        <el-menu-item index="timeline">世界历史时间轴</el-menu-item>
        <el-menu-item index="china-map">中国历史地图</el-menu-item>
        <el-menu-item index="world-map">世界历史地图</el-menu-item>
        <el-menu-item index="websites">常用网站合集</el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧内容区 -->
    <el-main class="main-content">
      <!-- 使用 v-if 根据左侧点击的菜单动态显示对应组件 -->
      <TextConvert v-if="activeMenu === 'convert'" />
      
      <!-- 其他组件占位（后续开发） -->
      <div v-else-if="activeMenu === 'dynasty'">朝代年号表开发中...</div>
      <div v-else>模块开发中...</div>
    </el-main>
  </el-container>
</template>

<style>
/* 清除浏览器默认边距 */
body { margin: 0; padding: 0; font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif; }
.app-container { height: 100vh; } /* 占满整个屏幕高度 */
.sidebar { background-color: #f5f7fa; border-right: 1px solid #dcdfe6; }
.logo-title { text-align: center; padding: 20px 0; margin: 0; color: #409EFF; border-bottom: 1px solid #dcdfe6; }
.el-menu-vertical { border-right: none; background-color: transparent; }
.main-content { background-color: #ffffff; padding: 20px; }
</style>