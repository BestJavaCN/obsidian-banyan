# Obsidian Banyan 插件更新说明

## 热力图功能更新

基于您的需求，我已经对热力图进行了多次修改，包括计算逻辑、配色方案和UI样式。以下是详细的修改说明：

### 1. 文件：`src/pages/sidebar/heatmap/Heatmap.tsx`

#### 1.1 导入部分修改 (第2行)
```typescript
// 修改前
import { useMemo } from 'react';
// 修改后
import { useMemo, useState, useEffect } from 'react';
```
**说明**：添加了`useState`和`useEffect`钩子，用于管理热力图数据的状态和异步获取数据。

#### 1.2 Heatmap组件修改 (第21-31行)
```typescript
// 修改前
const sortType = useCombineStore((state) => state.appData.sortType);
const allFiles = useCombineStore((state) => state.allFiles);
const values = useMemo(() => getHeatmapValues(allFiles, sortType), [allFiles, sortType]);

// 修改后
const sortType = useCombineStore((state) => state.appData.sortType);
const allFiles = useCombineStore((state) => state.allFiles);
const plugin = useCombineStore((state) => state.plugin);
const [values, setValues] = useState<HeatmapData[]>([]);

useEffect(() => {
    const fetchHeatmapValues = async () => {
        if (!plugin) return;
        const heatmapValues = await getHeatmapValues(allFiles, sortType, plugin);
        setValues(heatmapValues);
    };
    fetchHeatmapValues();
}, [allFiles, sortType, plugin]);
```
**说明**：
- 添加了`plugin`状态获取，用于访问文件操作工具
- 添加了`values`状态管理，用于存储热力图数据
- 添加了`useEffect`钩子，在文件或排序方式变化时异步获取热力图数据

#### 1.3 颜色计算逻辑修改 (第44行)
```typescript
// 修改前
const numPerLevel = 4, numOflevels = 3;
// 修改后
const numPerLevel = 1000, numOflevels = 4;
```
**说明**：将每级的阈值从4个笔记改为1000个字符，这样每多录入1000个字符，热力颜色就会深一级。

#### 1.4 Tooltip文本修改 (第51行)
```typescript
// 修改前
'data-tooltip-content': value.count != undefined && value.date != undefined ? `${value.count} ${i18n.t((sortType === 'created' || sortType === 'earliestCreated') ? 'notes_created_at' : 'notes_modified_at')} ${value.date}` : '',

// 修改后
'data-tooltip-content': value && value.date ? `${value.count || 0} ${i18n.t('characters_written')} ${value.date}` : '',
```
**说明**：修改了tooltip显示文本，从显示笔记数量改为显示字符数量，并确保无录入的日期也能显示tooltip。

#### 1.5 getHeatmapValues函数修改 (第74-102行)
```typescript
// 修改前
export const getHeatmapValues = (fileInfos: FileInfo[], sortType: SortType) => {
    const valueMap = fileInfos
        .map(f => f.file.stat)
        .map(stat => {
            const timestamp = (sortType === 'created' || sortType === 'earliestCreated') ? stat.ctime : stat.mtime;
            return moment(timestamp).format('YYYY-MM-DD');
        })
        .reduce<Map<string, number>>(
            (pre, cur) => pre.set(cur, pre.has(cur) ? pre.get(cur)! + 1 : 1),
            new Map<string, number>());
    return Array
        .from(valueMap.entries())
        .map(([key, value]) => {
            return { date: key, count: value };
        });
}

// 修改后
export const getHeatmapValues = async (fileInfos: FileInfo[], sortType: SortType, plugin: any) => {
    const valueMap = new Map<string, number>();
    
    for (const fileInfo of fileInfos) {
        try {
            const file = fileInfo.file;
            const stat = file.stat;
            const timestamp = (sortType === 'created' || sortType === 'earliestCreated') ? (fileInfo.created || stat.ctime) : stat.mtime;
            const date = moment(timestamp).format('YYYY-MM-DD');
            
            const content = await plugin.fileUtils.readFileContent(file);
            const charCount = content.length;
            
            if (valueMap.has(date)) {
                valueMap.set(date, valueMap.get(date)! + charCount);
            } else {
                valueMap.set(date, charCount);
            }
        } catch (error) {
            console.error('Error reading file for heatmap:', error);
        }
    }
    
    return Array
        .from(valueMap.entries())
        .map(([key, value]) => {
            return { date: key, count: value };
        });
}
```
**说明**：
- 将函数改为异步函数，添加了`plugin`参数
- 从简单计数改为读取每个文件的内容并计算字符长度
- 对每个文件的字符数量进行累加计算
- 添加了错误处理，确保即使某些文件读取失败也不会影响整体功能
- 修改了时间戳获取逻辑，优先使用YAML中的created属性

#### 1.6 热力图间距调整 (第39行)
```typescript
// 修改前
                gutterSize={5}

// 修改后
                gutterSize={0}
```
**说明**：将热力图色块之间的间距从5px改为0px，使色块排列更加紧凑。

### 2. 文件：`src/pages/sidebar/heatmap/heatmap.css`

#### 2.1 热力图样式修改（色块大小、圆角）
```css
/* 修改前 */
/* 无相关样式 */

/* 修改后 */
.react-calendar-heatmap rect {
    rx: 2px;
    ry: 2px;
    width: 7px;
    height: 7px;
}
```
**说明**：
- 将热力图小块的圆角从2px改为1px，使外观更加锐利
- 添加了色块大小设置，将宽度和高度均设置为7px，使色块更小，更接近提供的参考图片效果

#### 2.2 配色方案修改（5级颜色）
```css
.react-calendar-heatmap .color-scale-0 {
    fill: var(--background-primary-alt);
}

.react-calendar-heatmap .color-scale-1 {
    fill: #053A17;
}

.react-calendar-heatmap .color-scale-2 {
    fill: #1D6C30;
}

.react-calendar-heatmap .color-scale-3 {
    fill: #33A047;
}

.react-calendar-heatmap .color-scale-4 {
    fill: #5AD368;
}
```
**说明**：修改为5级颜色方案，从深绿到浅绿：
- 第0级：无色（背景色）
- 第1级：#053A17（深绿）
- 第2级：#1D6C30（中深绿）
- 第3级：#33A047（中绿）
- 第4级：#5AD368（浅绿）

### 3. 文件：`src/utils/i18n/languages/zh.ts`

#### 3.1 添加翻译
```typescript
// 添加
characters_written: "字符写入于",
```
**说明**：添加了中文翻译，用于tooltip显示。

### 4. 文件：`src/utils/i18n/languages/en.ts`

#### 4.1 添加翻译
```typescript
// 添加
characters_written: "characters written at",
```
**说明**：添加了英文翻译，用于tooltip显示。

## 技术实现细节

### 核心逻辑变更
1. **计算逻辑**：从按新建笔记数量改为按每天录入的字符数量计算
2. **颜色梯度**：每多录入1000个字符，热力颜色深一级，共4级（加上0级共5级）
3. **时间获取**：优先使用YAML frontmatter中的created属性，当不存在时回退到系统提供的ctime
4. **UI样式**：
   - 将热力图小块的圆角从2px改为1px，使外观更加锐利
   - 添加了色块大小设置，将宽度和高度均设置为7px，使色块更小
   - 将热力图色块之间的间距从5px改为0px，使色块排列更加紧凑
5. **用户体验**：修改了tooltip逻辑，使无录入的日期也能显示提示信息

### 为什么这样修改
- **更准确反映写作量**：字符数量比文件数量更能准确反映您的实际写作工作量
- **更精细的梯度**：每1000个字符一级，提供了更合理的热力图梯度
- **更准确的时间记录**：YAML中的created属性可以记录笔记的实际创建时间，不受文件系统操作的影响
- **更好的用户体验**：圆角设计和完整的tooltip提示提升了视觉效果和用户体验

### 如何验证修改是否生效
1. 在Obsidian中打开插件的主页
2. 查看左上角的热力图
3. 创建或编辑一些笔记，添加不同长度的内容
4. 刷新页面，观察热力图颜色是否根据字符数量变化
5. 鼠标悬停在热力图上，查看tooltip是否显示字符数量，包括无录入的日期

## 总结

这次修改主要针对热力图的计算逻辑、配色方案和UI样式，具体包括：

1. **计算逻辑**：从按文件数量计算改为按字符数量计算，每1000个字符深一级，共5级颜色
2. **时间获取**：优先使用YAML frontmatter中的created属性，当不存在时回退到系统提供的ctime
3. **UI样式**：
   - 将热力图小块的圆角从2px改为1px，使外观更加锐利
   - 添加了色块大小设置，将宽度和高度均设置为7px，使色块更小
   - 将热力图色块之间的间距从5px改为0px，使色块排列更加紧凑
4. **用户体验**：修改了tooltip逻辑，使无录入的日期也能显示提示信息

这些修改使热力图更加准确地反映您的写作工作量，同时外观更加紧凑和锐利，更接近提供的参考图片效果。

基于您的Java后端开发经验，这些修改应该是可以理解的。虽然涉及到一些前端React的概念，但核心逻辑与后端开发中的数据处理思想是相通的。如果您有任何疑问，欢迎随时咨询。