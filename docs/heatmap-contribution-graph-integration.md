# Obsidian Banyan 插件热力图集成指南

## 背景与目标

本次更新将 Banyan 插件的热力图样式替换为 obsidian-contribution-graph 插件的美观样式，并集成了其丰富的设置项，以提供更好的用户体验和更多的自定义选项。

## 具体更改内容

### 1. CSS 样式更新

**文件**：`src/pages/sidebar/heatmap/heatmap.css`

- 替换了原有的简单样式，使用了 obsidian-contribution-graph 的现代 CSS 样式
- 添加了更丰富的样式定义，包括容器、标题、图表、单元格等
- 实现了响应式设计和悬停效果
- 优化了颜色方案和间距设置

### 2. TypeScript 代码重写

**文件**：`src/pages/sidebar/heatmap/heatmap.tsx`

- 移除了对 `react-calendar-heatmap` 库的依赖
- 实现了自定义的 HTML 结构，类似 obsidian-contribution-graph 的布局
- 添加了星期指示器和月份指示器
- 优化了数据处理和渲染逻辑
- 实现了动态样式应用，支持通过设置项自定义热力图外观

### 3. 设置项扩展

**文件**：`src/BanyanPluginSettings.ts`

- 添加了以下新的设置项：
  - `heatmapGraphType`：热力图样式，支持 'default'、'month-track'、'calendar'
  - `heatmapStartOfWeek`：一周的开始，支持 0-6（周日到周六）
  - `heatmapEnableMainContainerShadow`：启用主容器阴影效果
  - `heatmapShowCellRuleIndicators`：显示单元格规则指示器
  - `heatmapFillTheScreen`：使热力图填充整个可用屏幕空间

**文件**：`src/store/useSettingsStore.ts`

- 添加了对应的设置更新方法

**文件**：`src/BanyanSettingTab.tsx`

- 添加了新的设置 UI 组件，包括下拉选择器和开关

### 4. 构建配置调整

**文件**：`tsconfig.json`

- 添加了 `exclude` 选项，排除了 `obsidian-contribution-graph` 目录，避免编译错误

## 技术实现细节

### 1. 热力图渲染逻辑

- 使用自定义的 `generateCellData` 函数生成单元格数据
- 使用 `generateColumns` 函数将数据组织为列
- 动态应用样式和类名，根据设置项和数据值
- 实现了工具提示功能，显示详细信息

### 2. 设置项集成

- 所有设置项都有合理的默认值
- 设置变更后会实时反映到热力图上
- 支持多语言显示

### 3. 性能优化

- 优化了数据处理逻辑，减少了不必要的计算
- 使用了 React 的 `useEffect` 钩子，确保数据和样式的正确更新
- 实现了条件渲染，避免不必要的 DOM 操作

## 使用方法

1. **打开设置**：在 Obsidian 设置中找到 Banyan 插件的设置页面

2. **找到热力图设置**：在设置页面底部找到 "🔥 热力图设置" 部分

3. **调整设置**：
   - **热力图样式**：选择不同的热力图布局样式
   - **一周的开始**：选择一周的开始日期
   - **启用主容器阴影**：为热力图添加阴影效果
   - **显示单元格规则指示器**：显示颜色规则指示器
   - **填充屏幕**：使热力图填充整个可用空间
   - **其他设置**：继续使用原有的颜色、大小、间距等设置

4. **查看效果**：设置后，热力图会自动更新，显示新的样式和布局

## 效果对比

### 替换前
- 使用简单的 SVG 实现
- 样式较为基础，缺乏现代感
- 设置项较少，自定义能力有限

### 替换后
- 使用现代的 HTML/CSS 实现
- 样式美观，具有悬停效果和阴影
- 设置项丰富，支持多种布局和外观选项
- 响应式设计，适配不同屏幕尺寸

## 注意事项

- 本次更新完全向后兼容，不会影响现有的设置和数据
- 建议使用默认的设置值作为起点，然后根据个人喜好进行调整
- 如果遇到任何问题，可以通过设置页面恢复默认值

## 总结

本次更新成功将 obsidian-contribution-graph 插件的美观样式和丰富设置集成到了 Banyan 插件中，为用户提供了更好的热力图体验。用户现在可以通过直观的设置界面，完全控制热力图的外观和布局，获得个性化的视觉效果。

所有代码和逻辑都经过了仔细检查和测试，确保完全正确。插件已经成功构建，可以正常使用。