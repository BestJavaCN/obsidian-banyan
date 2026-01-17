# 热力图功能更新说明文档

## 概述

本文档详细记录了 2026 年 1 月 17 日对 Banyan 插件热力图功能的所有修改。这些修改包括配色方案实现、设置项调整、显示周数控制、悬停提示优化等多项功能改进。

## 修改的文件

1. `src/BanyanPluginSettings.ts` - 插件设置结构定义
2. `src/store/useSettingsStore.ts` - 状态管理和设置更新方法
3. `src/pages/sidebar/heatmap/Heatmap.tsx` - 热力图核心组件
4. `src/BanyanSettingTab.tsx` - 设置页面组件

## 详细修改内容

### 1. 实现热力图配色方案和自动反色功能

**文件**: `src/pages/sidebar/heatmap/Heatmap.tsx`

**修改内容**:

```typescript
// 新增：配色方案定义
const colorSchemes = {
    github: {
        name: "GitHub",
        description: "GitHub风格的绿色系",
        colors: ["#5AD368", "#33A047", "#1D6C30", "#053A17"] // 浅色模式顺序
    },
    ocean: {
        name: "Ocean",
        description: "海洋风格的蓝色系",
        colors: ["#8dd1e2", "#63a1be", "#376d93", "#012f60"] // 浅色模式顺序
    },
    halloween: {
        name: "Halloween",
        description: "万圣节风格的橙色系",
        colors: ["#fdd577", "#faaa53", "#f07c44", "#d94e49"] // 浅色模式顺序
    },
    lovely: {
        name: "Lovely",
        description: "可爱风格的粉色系",
        colors: ["#fedcdc", "#fdb8bf", "#f892a9", "#ec6a97"] // 浅色模式顺序
    },
    wine: {
        name: "Wine",
        description: "葡萄酒风格的红色系",
        colors: ["#d8b0b3", "#c78089", "#ac4c61", "#830738"] // 浅色模式顺序
    }
};

// 新增：主题检测
useEffect(() => {
    const checkDarkMode = () => {
        const isDark = document.body.hasClass('theme-dark');
        setIsDarkMode(isDark);
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
}, []);

// 新增：根据配色方案和主题模式获取颜色
const getColors = () => {
    const schemeName = settings.heatmapColorScheme || 'github';
    const scheme = colorSchemes[schemeName as keyof typeof colorSchemes] || colorSchemes.github;
    
    // 深色模式下反转颜色顺序
    return isDarkMode ? [...scheme.colors].reverse() : scheme.colors;
};

// 修改：动态生成热力图样式
useEffect(() => {
    // 移除旧的样式标签
    const oldStyle = document.getElementById('heatmap-dynamic-styles');
    if (oldStyle) {
        oldStyle.remove();
    }

    // 获取当前配色方案的颜色
    const colors = getColors();

    // 创建新的样式标签
    const style = document.createElement('style');
    style.id = 'heatmap-dynamic-styles';
    style.textContent = `
        /* 重置默认样式，确保没有额外间距 */
        .react-calendar-heatmap rect {
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            rx: ${settings.heatmapCellRadius || 2}px;
            ry: ${settings.heatmapCellRadius || 2}px;
            width: ${settings.heatmapCellSize || 6}px;
            height: ${settings.heatmapCellSize || 6}px;
        }
        
        /* 确保SVG容器没有额外的间距 */
        .react-calendar-heatmap svg {
            display: block;
            margin: 0;
            padding: 0;
        }
        
        /* 颜色样式 */
        .react-calendar-heatmap .color-scale-0 {
            fill: --background-primary-alt;
        }
        
        .react-calendar-heatmap .color-scale-1 {
            fill: ${colors[0]};
        }
        
        .react-calendar-heatmap .color-scale-2 {
            fill: ${colors[1]};
        }
        
        .react-calendar-heatmap .color-scale-3 {
            fill: ${colors[2]};
        }
        
        .react-calendar-heatmap .color-scale-4 {
            fill: ${colors[3]};
        }
    `;

    // 添加到文档头部
    document.head.appendChild(style);

    // 清理函数
    return () => {
        const styleToRemove = document.getElementById('heatmap-dynamic-styles');
        if (styleToRemove) {
            styleToRemove.remove();
        }
    };
}, [
    settings.heatmapCellRadius,
    settings.heatmapCellSize,
    settings.heatmapColorScheme,
    isDarkMode
]);
```

**修改原因**:
- 实现配色方案切换功能，让用户可以选择不同风格的热力图
- 实现自动反色功能，确保在深色模式下热力图颜色也能清晰显示
- 动态生成样式，确保配色方案和主题变化时能实时更新

### 2. 移除热力图颜色设置项

**文件**: `src/BanyanPluginSettings.ts`

**修改内容**:

```typescript
// 修改前
// 热力图设置
heatmapCalculationStandard?: 'fileCount' | 'charCount';
heatmapFileCountStep?: number;
heatmapCharCountStep?: number;
heatmapColorScheme?: string; // 配色方案名称
heatmapColorLevel0?: string;
heatmapColorLevel1?: string;
heatmapColorLevel2?: string;
heatmapColorLevel3?: string;
heatmapColorLevel4?: string;
heatmapCellRadius?: number;
heatmapCellSize?: number;
heatmapCellGutter?: number;

// 修改后
// 热力图设置
heatmapCalculationStandard?: 'fileCount' | 'charCount';
heatmapFileCountStep?: number;
heatmapCharCountStep?: number;
heatmapColorScheme?: string; // 配色方案名称
heatmapCellRadius?: number;
heatmapCellSize?: number;
heatmapCellGutter?: number;

// 修改前（默认设置）
// heatmap
heatmapCalculationStandard: 'charCount',
heatmapFileCountStep: 1,
heatmapCharCountStep: 1000,
heatmapColorScheme: 'github',
heatmapColorLevel0: '--background-primary-alt',
heatmapColorLevel1: '#5AD368',
heatmapColorLevel2: '#33A047',
heatmapColorLevel3: '#1D6C30',
heatmapColorLevel4: '#053A17',
heatmapCellRadius: 2,
heatmapCellSize: 6,
heatmapCellGutter: 0,

// 修改后（默认设置）
// heatmap
heatmapCalculationStandard: 'charCount',
heatmapFileCountStep: 1,
heatmapCharCountStep: 1000,
heatmapColorScheme: 'github',
heatmapCellRadius: 2,
heatmapCellSize: 6,
heatmapCellGutter: 0,
```

**文件**: `src/store/useSettingsStore.ts`

**修改内容**:

```typescript
// 修改前
// heatmap settings
updateHeatmapCalculationStandard: (standard: 'fileCount' | 'charCount') => void;
updateHeatmapFileCountStep: (step: number) => void;
updateHeatmapCharCountStep: (step: number) => void;
updateHeatmapColorLevel0: (color: string) => void;
updateHeatmapColorLevel1: (color: string) => void;
updateHeatmapColorLevel2: (color: string) => void;
updateHeatmapColorLevel3: (color: string) => void;
updateHeatmapColorLevel4: (color: string) => void;
updateHeatmapCellRadius: (radius: number) => void;
updateHeatmapCellSize: (size: number) => void;
updateHeatmapCellGutter: (gutter: number) => void;
updateHeatmapColorScheme: (scheme: string) => void;

// 修改后
// heatmap settings
updateHeatmapCalculationStandard: (standard: 'fileCount' | 'charCount') => void;
updateHeatmapFileCountStep: (step: number) => void;
updateHeatmapCharCountStep: (step: number) => void;
updateHeatmapCellRadius: (radius: number) => void;
updateHeatmapCellSize: (size: number) => void;
updateHeatmapCellGutter: (gutter: number) => void;
updateHeatmapColorScheme: (scheme: string) => void;

// 修改前（实现部分）
updateHeatmapCalculationStandard: (standard: 'fileCount' | 'charCount') => {
    get().updateSettings({ heatmapCalculationStandard: standard });
},
updateHeatmapFileCountStep: (step: number) => {
    get().updateSettings({ heatmapFileCountStep: step });
},
updateHeatmapCharCountStep: (step: number) => {
    get().updateSettings({ heatmapCharCountStep: step });
},
updateHeatmapColorLevel0: (color: string) => {
    get().updateSettings({ heatmapColorLevel0: color });
},
updateHeatmapColorLevel1: (color: string) => {
    get().updateSettings({ heatmapColorLevel1: color });
},
updateHeatmapColorLevel2: (color: string) => {
    get().updateSettings({ heatmapColorLevel2: color });
},
updateHeatmapColorLevel3: (color: string) => {
    get().updateSettings({ heatmapColorLevel3: color });
},
updateHeatmapColorLevel4: (color: string) => {
    get().updateSettings({ heatmapColorLevel4: color });
},
updateHeatmapCellRadius: (radius: number) => {
    get().updateSettings({ heatmapCellRadius: radius });
},

// 修改后（实现部分）
updateHeatmapCalculationStandard: (standard: 'fileCount' | 'charCount') => {
    get().updateSettings({ heatmapCalculationStandard: standard });
},
updateHeatmapFileCountStep: (step: number) => {
    get().updateSettings({ heatmapFileCountStep: step });
},
updateHeatmapCharCountStep: (step: number) => {
    get().updateSettings({ heatmapCharCountStep: step });
},
updateHeatmapCellRadius: (radius: number) => {
    get().updateSettings({ heatmapCellRadius: radius });
},
```

**文件**: `src/BanyanSettingTab.tsx`

**修改内容**:

```typescript
// 修改前
setupHeatmapStepSettings(containerEl: HTMLElement) {
    const settings = useCombineStore.getState().settings;
    
    // 文件数量步长
    new Setting(containerEl)
        .setName('文件数量步长')
        .setDesc('以文件数量为标准时，每增加多少个文件颜色深一级 (默认: 1)')
        .addText(text => {
            text.setValue((settings.heatmapFileCountStep ?? 1).toString())
                .onChange(async (value) => {
                    const step = parseInt(value);
                    if (!isNaN(step) && step > 0) {
                        useCombineStore.getState().updateHeatmapFileCountStep(step);
                    }
                });
        });

    // 字符数步长
    new Setting(containerEl)
        .setName('字符数步长')
        .setDesc('以录入字数为标准时，每增加多少个字符颜色深一级 (默认: 1000)')
        .addText(text => {
            text.setValue((settings.heatmapCharCountStep ?? 1000).toString())
                .onChange(async (value) => {
                    const step = parseInt(value);
                    if (!isNaN(step) && step > 0) {
                        useCombineStore.getState().updateHeatmapCharCountStep(step);
                    }
                });
        });
}

setupHeatmapColorSettings(containerEl: HTMLElement) {
    const settings = useCombineStore.getState().settings;
    
    // 颜色设置
    new Setting(containerEl)
        .setName('热力图颜色')
        .setDesc('自定义热力图各级颜色');

    // 第0级颜色
    new Setting(containerEl)
        .setName('第0级颜色 (无数据)')
        .setDesc('无数据时的颜色 (默认: --background-primary-alt)')
        .addText(text => {
            text.setValue(settings.heatmapColorLevel0 ?? '--background-primary-alt')
                .onChange(async (value) => {
                    useCombineStore.getState().updateHeatmapColorLevel0(value);
                });
        });

    // 第1级颜色
    new Setting(containerEl)
        .setName('第1级颜色')
        .setDesc('最低数据量时的颜色 (默认: #053A17)')
        .addText(text => {
            text.setValue(settings.heatmapColorLevel1 ?? '#053A17')
                .onChange(async (value) => {
                    useCombineStore.getState().updateHeatmapColorLevel1(value);
                });
        });

    // 第2级颜色
    new Setting(containerEl)
        .setName('第2级颜色')
        .setDesc('较低数据量时的颜色 (默认: #1D6C30)')
        .addText(text => {
            text.setValue(settings.heatmapColorLevel2 ?? '#1D6C30')
                .onChange(async (value) => {
                    useCombineStore.getState().updateHeatmapColorLevel2(value);
                });
        });

    // 第3级颜色
    new Setting(containerEl)
        .setName('第3级颜色')
        .setDesc('较高数据量时的颜色 (默认: #33A047)')
        .addText(text => {
            text.setValue(settings.heatmapColorLevel3 ?? '#33A047')
                .onChange(async (value) => {
                    useCombineStore.getState().updateHeatmapColorLevel3(value);
                });
        });

    // 第4级颜色
    new Setting(containerEl)
        .setName('第4级颜色')
        .setDesc('最高数据量时的颜色 (默认: #5AD368)')
        .addText(text => {
            text.setValue(settings.heatmapColorLevel4 ?? '#5AD368')
                .onChange(async (value) => {
                    useCombineStore.getState().updateHeatmapColorLevel4(value);
                });
        });
}

// 修改后
setupHeatmapStepSettings(containerEl: HTMLElement) {
    const settings = useCombineStore.getState().settings;
    
    // 文件数量步长
    new Setting(containerEl)
        .setName('文件数量步长')
        .setDesc('以文件数量为标准时，每增加多少个文件颜色深一级 (默认: 1)')
        .addText(text => {
            text.setValue((settings.heatmapFileCountStep ?? 1).toString())
                .onChange(async (value) => {
                    const step = parseInt(value);
                    if (!isNaN(step) && step > 0) {
                        useCombineStore.getState().updateHeatmapFileCountStep(step);
                    }
                });
        });

    // 字符数步长
    new Setting(containerEl)
        .setName('字符数步长')
        .setDesc('以录入字数为标准时，每增加多少个字符颜色深一级 (默认: 1000)')
        .addText(text => {
            text.setValue((settings.heatmapCharCountStep ?? 1000).toString())
                .onChange(async (value) => {
                    const step = parseInt(value);
                    if (!isNaN(step) && step > 0) {
                        useCombineStore.getState().updateHeatmapCharCountStep(step);
                    }
                });
        });
}
```

**文件**: `src/pages/sidebar/heatmap/Heatmap.tsx`

**修改内容**:

```typescript
// 修改前
/* 颜色样式 */
.react-calendar-heatmap .color-scale-0 {
    fill: ${settings.heatmapColorLevel0 || '--background-primary-alt'};
}

// 修改后
/* 颜色样式 */
.react-calendar-heatmap .color-scale-0 {
    fill: --background-primary-alt;
}

// 修改前（依赖数组）
}, [
    settings.heatmapCellRadius,
    settings.heatmapCellSize,
    settings.heatmapColorLevel0,
    settings.heatmapColorScheme,
    isDarkMode
]);

// 修改后（依赖数组）
}, [
    settings.heatmapCellRadius,
    settings.heatmapCellSize,
    settings.heatmapColorScheme,
    isDarkMode
]);
```

**修改原因**:
- 由于实现了预设配色方案功能，不再需要用户手动设置每级颜色
- 简化设置界面，减少用户需要关注的设置项
- 确保配色方案在不同主题模式下能自动反色，提供更好的用户体验

### 3. 添加热力图显示周数设置项

**文件**: `src/BanyanPluginSettings.ts`

**修改内容**:

```typescript
// 修改前
// 热力图设置
heatmapCalculationStandard?: 'fileCount' | 'charCount';
heatmapFileCountStep?: number;
heatmapCharCountStep?: number;
heatmapColorScheme?: string; // 配色方案名称
heatmapCellRadius?: number;
heatmapCellSize?: number;
heatmapCellGutter?: number;

// 修改后
// 热力图设置
heatmapCalculationStandard?: 'fileCount' | 'charCount';
heatmapFileCountStep?: number;
heatmapCharCountStep?: number;
heatmapColorScheme?: string; // 配色方案名称
heatmapWeeks?: number; // 显示的周数
heatmapCellRadius?: number;
heatmapCellSize?: number;
heatmapCellGutter?: number;

// 修改前（默认设置）
// heatmap
heatmapCalculationStandard: 'charCount',
heatmapFileCountStep: 1,
heatmapCharCountStep: 1000,
heatmapColorScheme: 'github',
heatmapCellRadius: 2,
heatmapCellSize: 6,
heatmapCellGutter: 0,

// 修改后（默认设置）
// heatmap
heatmapCalculationStandard: 'charCount',
heatmapFileCountStep: 1,
heatmapCharCountStep: 1000,
heatmapColorScheme: 'github',
heatmapWeeks: 12, // 默认显示12周
heatmapCellRadius: 2,
heatmapCellSize: 6,
heatmapCellGutter: 0,
```

**文件**: `src/store/useSettingsStore.ts`

**修改内容**:

```typescript
// 修改前
// heatmap settings
updateHeatmapCalculationStandard: (standard: 'fileCount' | 'charCount') => void;
updateHeatmapFileCountStep: (step: number) => void;
updateHeatmapCharCountStep: (step: number) => void;
updateHeatmapCellRadius: (radius: number) => void;
updateHeatmapCellSize: (size: number) => void;
updateHeatmapCellGutter: (gutter: number) => void;
updateHeatmapColorScheme: (scheme: string) => void;

// 修改后
// heatmap settings
updateHeatmapCalculationStandard: (standard: 'fileCount' | 'charCount') => void;
updateHeatmapFileCountStep: (step: number) => void;
updateHeatmapCharCountStep: (step: number) => void;
updateHeatmapWeeks: (weeks: number) => void;
updateHeatmapCellRadius: (radius: number) => void;
updateHeatmapCellSize: (size: number) => void;
updateHeatmapCellGutter: (gutter: number) => void;
updateHeatmapColorScheme: (scheme: string) => void;

// 修改前（实现部分）
updateHeatmapCalculationStandard: (standard: 'fileCount' | 'charCount') => {
    get().updateSettings({ heatmapCalculationStandard: standard });
},
updateHeatmapFileCountStep: (step: number) => {
    get().updateSettings({ heatmapFileCountStep: step });
},
updateHeatmapCharCountStep: (step: number) => {
    get().updateSettings({ heatmapCharCountStep: step });
},
updateHeatmapCellRadius: (radius: number) => {
    get().updateSettings({ heatmapCellRadius: radius });
},

// 修改后（实现部分）
updateHeatmapCalculationStandard: (standard: 'fileCount' | 'charCount') => {
    get().updateSettings({ heatmapCalculationStandard: standard });
},
updateHeatmapFileCountStep: (step: number) => {
    get().updateSettings({ heatmapFileCountStep: step });
},
updateHeatmapCharCountStep: (step: number) => {
    get().updateSettings({ heatmapCharCountStep: step });
},
updateHeatmapWeeks: (weeks: number) => {
    get().updateSettings({ heatmapWeeks: weeks });
},
updateHeatmapCellRadius: (radius: number) => {
    get().updateSettings({ heatmapCellRadius: radius });
},
```

**文件**: `src/BanyanSettingTab.tsx`

**修改内容**:

```typescript
// 新增
setupHeatmapWeeksSetting(containerEl: HTMLElement) {
    const settings = useCombineStore.getState().settings;
    new Setting(containerEl)
        .setName('热力图显示周数')
        .setDesc('设置热力图显示的周数 (默认: 12)')
        .addText(text => {
            text.setValue((settings.heatmapWeeks ?? 12).toString())
                .onChange(async (value) => {
                    const weeks = parseInt(value);
                    if (!isNaN(weeks) && weeks > 0 && weeks <= 52) {
                        useCombineStore.getState().updateHeatmapWeeks(weeks);
                    }
                });
        });
}
```

**文件**: `src/pages/sidebar/heatmap/Heatmap.tsx`

**修改内容**:

```typescript
// 修改前
<CalendarHeatmap
    startDate={shiftDate(today, -12 * 7)}
    endDate={today}
    onClick={(value) => value && onCickDate(value.date)}
    values={values}
    gutterSize={settings.heatmapCellGutter || 0}
    transformDayElement={transformDayElement}
    classForValue={(value: HeatmapData) => {
        if (!value || value.count === 0) {
            return 'color-scale-0';
        }
        const standard = settings.heatmapCalculationStandard || 'charCount';
        const step = standard === 'fileCount' ? 
            (settings.heatmapFileCountStep || 1) : 
            (settings.heatmapCharCountStep || 1000);
        const numOflevels = 4;
        const cnt = Math.min(numOflevels, Math.ceil(value.count / step));
        return `color-scale-${cnt}`;
    }}

// 修改后
<CalendarHeatmap
    startDate={shiftDate(today, -(settings.heatmapWeeks || 12) * 7)}
    endDate={today}
    onClick={(value) => value && onCickDate(value.date)}
    values={values}
    gutterSize={settings.heatmapCellGutter || 0}
    transformDayElement={transformDayElement}
    classForValue={(value: HeatmapData) => {
        if (!value || value.count === 0) {
            return 'color-scale-0';
        }
        const standard = settings.heatmapCalculationStandard || 'charCount';
        const step = standard === 'fileCount' ? 
            (settings.heatmapFileCountStep || 1) : 
            (settings.heatmapCharCountStep || 1000);
        const numOflevels = 4;
        const cnt = Math.min(numOflevels, Math.ceil(value.count / step));
        return `color-scale-${cnt}`;
    }}

// 修改前（依赖数组）
}, [allFiles, sortType, plugin, settings.heatmapCalculationStandard]);

// 修改后（依赖数组）
}, [allFiles, sortType, plugin, settings.heatmapCalculationStandard, settings.heatmapWeeks]);
```

**修改原因**:
- 允许用户自定义热力图显示的时间范围，满足不同用户的需求
- 提供更灵活的热力图配置选项
- 保持向后兼容，默认值仍为12周

### 4. 优化无数据日期的悬停提示

**文件**: `src/pages/sidebar/heatmap/Heatmap.tsx`

**修改内容**:

```typescript
// 修改前
useEffect(() => {
    const fetchHeatmapValues = async () => {
        if (!plugin) return;
        const heatmapValues = await getHeatmapValues(
            allFiles, 
            sortType, 
            plugin, 
            settings.heatmapCalculationStandard || 'charCount'
        );
        setValues(heatmapValues);
    };
    fetchHeatmapValues();
}, [allFiles, sortType, plugin, settings.heatmapCalculationStandard, settings.heatmapWeeks]);

// 修改后
useEffect(() => {
    const fetchHeatmapValues = async () => {
        if (!plugin) return;
        const heatmapValues = await getHeatmapValues(
            allFiles, 
            sortType, 
            plugin, 
            settings.heatmapCalculationStandard || 'charCount'
        );
        
        // 创建日期到计数的映射
        const valueMap = new Map(heatmapValues.map(item => [item.date, item.count]));
        
        // 生成所有日期的数据
        const weeksToShow = settings.heatmapWeeks || 12;
        const startDate = shiftDate(today, -weeksToShow * 7);
        const allDates: HeatmapData[] = [];
        
        const currentDate = new Date(startDate);
        while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split('T')[0];
            allDates.push({
                date: dateStr,
                count: valueMap.get(dateStr) || 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        setValues(allDates);
    };
    fetchHeatmapValues();
}, [allFiles, sortType, plugin, settings.heatmapCalculationStandard, settings.heatmapWeeks]);

// 修改前
tooltipDataAttrs={(value: HeatmapData): { [key: string]: string } => {
    const standard = settings.heatmapCalculationStandard || 'charCount';
    const label = standard === 'fileCount' ? 
        i18n.t('notes_created_at') : 
        i18n.t('characters_written');
    return {
        'data-tooltip-id': 'my-tooltip',
        'data-tooltip-content': value && value.date ? `${value.count || 0} ${label} ${value.date}` : '',
    };
}}

// 修改后
tooltipDataAttrs={(value: HeatmapData): { [key: string]: string } => {
    const standard = settings.heatmapCalculationStandard || 'charCount';
    const label = standard === 'fileCount' ? 
        i18n.t('notes_created_at') : 
        i18n.t('characters_written');
    return {
        'data-tooltip-id': 'my-tooltip',
        'data-tooltip-content': `${value?.count || 0} ${label} ${value?.date || ''}`,
    };
}}
```

**修改原因**:
- 确保所有日期都有对应的悬停提示，包括无数据的日期
- 提供一致的用户体验，无论日期是否有数据都能显示提示信息
- 生成完整的日期数据，确保热力图能正确显示所有日期

### 5. 调整设置项顺序

**文件**: `src/BanyanSettingTab.tsx`

**修改内容**:

```typescript
// 修改前
// 热力图设置
new Setting(containerEl).setName(i18n.t('setting_header_heatmap')).setHeading();
this.setupHeatmapColorSchemeSetting(containerEl);
this.setupHeatmapCalculationStandardSetting(containerEl);
this.setupHeatmapWeeksSetting(containerEl);
this.setupHeatmapStepSettings(containerEl);
this.setupHeatmapCellSettings(containerEl);

// 修改后
// 热力图设置
new Setting(containerEl).setName(i18n.t('setting_header_heatmap')).setHeading();
this.setupHeatmapColorSchemeSetting(containerEl);
this.setupHeatmapCalculationStandardSetting(containerEl);
this.setupHeatmapStepSettings(containerEl);
this.setupHeatmapWeeksSetting(containerEl);
this.setupHeatmapCellSettings(containerEl);
```

**修改原因**:
- 调整设置项的逻辑顺序，将相关的设置项放在一起
- 按照从整体到细节的顺序排列，提高设置界面的可读性

### 6. 优化热力图无数据色块颜色和月份标签反色

**文件**: `src/pages/sidebar/heatmap/Heatmap.tsx`

**修改内容**:

```typescript
// 修改前
/* 颜色样式 */
.react-calendar-heatmap .color-scale-0 {
    fill: --background-primary-alt;
}

// 修改后
/* 颜色样式 */
.react-calendar-heatmap .color-scale-0 {
    fill: #e0d2b3;
}

/* 深色模式下的无数据色块颜色 */
.theme-dark .react-calendar-heatmap .color-scale-0 {
    fill: #333333;
}

/* 月份标签样式 */
.react-calendar-heatmap text {
    fill: currentColor;
    font-size: 10px;
}

/* 确保热力图容器继承正确的文本颜色 */
.react-calendar-heatmap {
    color: var(--text-normal);
}
```

**修改原因**:
- 解决移动端无数据色块与背景色融为一体的问题
- 选择更柔和的颜色，提高视觉体验
- 确保月份标签在深色模式下能自动反色，保持一致性

## 技术要点总结

1. **动态样式生成**：使用 `useEffect` 和动态创建的 `<style>` 标签，实现配色方案和主题的实时更新

2. **主题检测**：使用 `MutationObserver` 监听主题变化，实现自动反色功能

3. **状态管理**：使用 Zustand 管理插件设置，确保设置的持久化和实时更新

4. **数据处理**：生成完整的日期数据，确保所有日期都有对应的悬停提示

5. **响应式设计**：确保热力图在不同设备上都能正常显示，解决移动端颜色显示问题

6. **用户体验优化**：提供预设配色方案、灵活的周数设置、一致的悬停提示等功能

## 最终效果

1. **热力图配色**：支持5种预设配色方案，在浅色和深色模式下自动反色
2. **设置简化**：移除了手动颜色设置项，简化了设置界面
3. **周数控制**：用户可以自定义热力图显示的周数（1-52周）
4. **悬停提示**：所有日期（包括无数据的日期）都有悬停提示
5. **设置顺序**：优化了设置项的逻辑顺序
6. **移动端优化**：解决了移动端无数据色块不可见和月份标签不反色的问题

这些修改不仅实现了所有需求，还提高了插件的整体用户体验和稳定性。