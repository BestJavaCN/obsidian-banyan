# Obsidian Banyan 插件更新说明

## 文件创建时间获取方式更新

基于您的需求，我已经将插件获取文件创建时间的方式从系统提供的创建时间改为从YAML文件中的created属性读取。以下是详细的修改说明：

### 1. 文件：`src/models/FileInfo.ts`

#### 1.1 FileInfo接口修改 (第4-8行)
```typescript
// 修改前
export interface FileInfo {
  file: TFile;
  tags: string[];
}

// 修改后
export interface FileInfo {
  file: TFile;
  tags: string[];
  created?: number;
}
```
**说明**：在FileInfo接口中添加了`created`可选属性，用于存储从YAML frontmatter中读取的创建时间。

#### 1.2 createFileInfo函数修改 (第10-27行)
```typescript
// 修改前
export const createFileInfo = (file: TFile, app: App): FileInfo | null => {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache) return null;
  const fileTags = getAllTags(cache)?.map((tag) => tag.slice(1)) ?? [];
  const tags = Array.from(new Set(fileTags));
  return { file, tags };
}

// 修改后
export const createFileInfo = (file: TFile, app: App): FileInfo | null => {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache) return null;
  const fileTags = getAllTags(cache)?.map((tag) => tag.slice(1)) ?? [];
  const tags = Array.from(new Set(fileTags));
  
  let created: number | undefined;
  if (cache.frontmatter?.created) {
    const createdValue = cache.frontmatter.created;
    if (typeof createdValue === 'string') {
      created = new Date(createdValue).getTime();
    } else if (typeof createdValue === 'number') {
      created = createdValue;
    }
  }
  
  return { file, tags, created };
}
```
**说明**：
- 添加了从YAML frontmatter中读取created属性的逻辑
- 支持字符串和数字两种格式的created值
- 将读取到的时间转换为时间戳格式存储

### 2. 文件：`src/pages/sidebar/heatmap/Heatmap.tsx`

#### 2.1 热力图时间戳计算修改 (第81行)
```typescript
// 修改前
const timestamp = (sortType === 'created' || sortType === 'earliestCreated') ? stat.ctime : stat.mtime;

// 修改后
const timestamp = (sortType === 'created' || sortType === 'earliestCreated') ? (fileInfo.created || stat.ctime) : stat.mtime;
```
**说明**：修改热力图中文件创建时间的获取方式，优先使用YAML中的created属性，当不存在时回退到系统提供的ctime。

### 3. 文件：`src/store/useDashBoardStore.ts`

#### 3.1 日期范围过滤修改 (第53-55行)
```typescript
// 修改前
filtered = filtered.filter(({ file }) => {
    const timeToCheck = (sortType === 'created' || sortType === 'earliestCreated') ? file.stat.ctime : file.stat.mtime;
    return withinDateRange(timeToCheck, curScheme.dateRange);
});

// 修改后
filtered = filtered.filter(({ file, created }) => {
    const timeToCheck = (sortType === 'created' || sortType === 'earliestCreated') ? (created || file.stat.ctime) : file.stat.mtime;
    return withinDateRange(timeToCheck, curScheme.dateRange);
});
```
**说明**：修改日期范围过滤中创建时间的获取方式。

#### 3.2 排序逻辑修改 (第86-96行)
```typescript
// 修改前
switch (sortType) {
    case 'created':
        return b.file.stat.ctime - a.file.stat.ctime; // 最近创建
    case 'modified':
        return b.file.stat.mtime - a.file.stat.mtime; // 最近更新
    case 'earliestCreated':
        return a.file.stat.ctime - b.file.stat.ctime; // 最早创建
    case 'earliestModified':
        return a.file.stat.mtime - b.file.stat.mtime; // 最早更新
    default:
        return b.file.stat.ctime - a.file.stat.ctime;
}

// 修改后
switch (sortType) {
    case 'created':
        return (b.created || b.file.stat.ctime) - (a.created || a.file.stat.ctime); // 最近创建
    case 'modified':
        return b.file.stat.mtime - a.file.stat.mtime; // 最近更新
    case 'earliestCreated':
        return (a.created || a.file.stat.ctime) - (b.created || b.file.stat.ctime); // 最早创建
    case 'earliestModified':
        return a.file.stat.mtime - b.file.stat.mtime; // 最早更新
    default:
        return (b.created || b.file.stat.ctime) - (a.created || a.file.stat.ctime);
}
```
**说明**：修改排序逻辑中创建时间的获取方式。

### 4. 文件：`src/pages/cards/CardNote.tsx`

#### 4.1 创建时间显示修改 (第138行)
```typescript
// 修改前
<div className="card-note-time">{isPinned ? `${i18n.t('general_pin')} · ` : ""}{isCreated ? i18n.t('created_at') : i18n.t('updated_at')} {new Date(isCreated ? fileInfo.file.stat.ctime : fileInfo.file.stat.mtime).toLocaleString()}</div>

// 修改后
<div className="card-note-time">{isPinned ? `${i18n.t('general_pin')} · ` : ""}{isCreated ? i18n.t('created_at') : i18n.t('updated_at')} {new Date(isCreated ? (fileInfo.created || fileInfo.file.stat.ctime) : fileInfo.file.stat.mtime).toLocaleString()}</div>
```
**说明**：修改卡片中创建时间的显示方式。

### 5. 文件：`src/pages/cards/CardNote2.tsx`

#### 5.1 创建时间显示修改 (第171行)
```typescript
// 修改前
<div className="card-note-time">{isPinned ? `${i18n.t('general_pin')} · ` : ""}{isCreated ? i18n.t('created_at') : i18n.t('updated_at')} {new Date(isCreated ? fileInfo.file.stat.ctime : fileInfo.file.stat.mtime).toLocaleString()}</div>

// 修改后
<div className="card-note-time">{isPinned ? `${i18n.t('general_pin')} · ` : ""}{isCreated ? i18n.t('created_at') : i18n.t('updated_at')} {new Date(isCreated ? (fileInfo.created || fileInfo.file.stat.ctime) : fileInfo.file.stat.mtime).toLocaleString()}</div>
```
**说明**：修改CardNote2组件中创建时间的显示方式。

### 6. 文件：`src/pages/cards/CardNoteMenu.tsx`

#### 6.1 创建时间信息修改 (第106行)
```typescript
// 修改前
item.setTitle(`${i18n.t('general_create')}: ${new Date(fileInfo.file.stat.ctime).toLocaleString()}`);

// 修改后
item.setTitle(`${i18n.t('general_create')}: ${new Date(fileInfo.created || fileInfo.file.stat.ctime).toLocaleString()}`);
```
**说明**：修改右键菜单中创建时间的显示方式。

## 技术实现细节

### 核心逻辑变更
1. **数据结构扩展**：在FileInfo接口中添加了created可选属性，用于存储从YAML中读取的创建时间
2. **数据读取**：在createFileInfo函数中添加了从YAML frontmatter读取created属性的逻辑
3. **数据使用**：在所有需要使用文件创建时间的地方，优先使用YAML中的created属性，当不存在时回退到系统提供的ctime
4. **类型处理**：支持字符串和数字两种格式的created值，统一转换为时间戳存储

### 为什么这样修改
- **更准确的时间记录**：YAML中的created属性可以记录笔记的实际创建时间，不受文件系统操作的影响
- **更好的兼容性**：当YAML中没有created属性时，会自动回退到系统提供的创建时间，确保所有笔记都能正常显示
- **一致性**：所有使用创建时间的地方（热力图、排序、卡片显示、菜单）都使用统一的时间获取方式

### 如何验证修改是否生效
1. **准备测试笔记**：
   - 创建一个新笔记，在YAML frontmatter中添加created属性，设置一个过去的日期
   - 例如：
     ```yaml
     ---
     created: 2023-01-01T12:00:00
     ---\n     ```

2. **构建并安装插件**：
   - 运行 `npm run build` 构建插件
   - 将dist目录中的文件复制到Obsidian插件目录的banyan文件夹中
   - 重启Obsidian

3. **验证热力图**：
   - 打开插件主页，查看左上角的热力图
   - 确认新创建的笔记是否显示在YAML中指定的日期位置

4. **验证排序**：
   - 按创建时间排序笔记
   - 确认带有created属性的笔记是否按YAML中指定的时间排序

5. **验证卡片显示**：
   - 查看笔记卡片上显示的创建时间
   - 确认显示的是YAML中指定的时间，而不是系统创建时间

6. **验证右键菜单**：
   - 右键点击笔记卡片，查看菜单中的创建时间
   - 确认显示的是YAML中指定的时间

## 总结

这次修改主要针对插件获取文件创建时间的方式，将其从系统提供的创建时间改为从YAML文件中的created属性读取。修改涉及到数据结构、数据读取逻辑和多个组件的时间显示逻辑，技术实现上使用了Obsidian的metadataCache来读取YAML frontmatter数据。

基于您的Java后端开发经验，这些修改应该是可以理解的。虽然涉及到一些前端React的概念，但核心逻辑与后端开发中的数据处理思想是相通的。如果您有任何疑问，欢迎随时咨询。