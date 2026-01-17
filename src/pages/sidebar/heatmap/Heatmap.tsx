import moment from 'moment';
import { useMemo, useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip'
import { SortType } from 'src/models/Enum';
import { FileInfo } from 'src/models/FileInfo';
import { useCombineStore } from 'src/store';
import { i18n } from 'src/utils/i18n';
import { App } from 'obsidian';

export type HeatmapData = {
    date: string,
    count: number,
}

export const Heatmap = ({ onCickDate }: {
    onCickDate: (date: string) => void
}) => {
    const today = new Date();
    const sortType = useCombineStore((state) => state.appData.sortType);
    const allFiles = useCombineStore((state) => state.allFiles);
    const plugin = useCombineStore((state) => state.plugin);
    const settings = useCombineStore((state) => state.settings);
    const [values, setValues] = useState<HeatmapData[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 配色方案定义
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

    // 检测当前主题模式
    useEffect(() => {
        const checkDarkMode = () => {
            const isDark = document.body.hasClass('theme-dark');
            setIsDarkMode(isDark);
        };

        // 初始检测
        checkDarkMode();

        // 监听主题变化
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    // 根据配色方案和主题模式获取颜色
    const getColors = () => {
        const schemeName = settings.heatmapColorScheme || 'github';
        const scheme = colorSchemes[schemeName as keyof typeof colorSchemes] || colorSchemes.github;
        
        // 深色模式下反转颜色顺序
        return isDarkMode ? [...scheme.colors].reverse() : scheme.colors;
    };

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

    // 动态生成热力图样式
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
    // 自定义转换函数，用于控制色块的大小和样式
    const transformDayElement = (element: any, value: HeatmapData, index: number) => {
        if (!value) return element;
        
        // 直接修改元素的属性
        element.props.width = settings.heatmapCellSize || 6;
        element.props.height = settings.heatmapCellSize || 6;
        element.props.rx = settings.heatmapCellRadius || 2;
        element.props.ry = settings.heatmapCellRadius || 2;
        
        return element;
    };

    return (
        <div>
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
                showWeekdayLabels={false}
                monthLabels={[
                    i18n.t('month1'), i18n.t('month2'), i18n.t('month3'),
                    i18n.t('month4'), i18n.t('month5'), i18n.t('month6'),
                    i18n.t('month7'), i18n.t('month8'), i18n.t('month9'),
                    i18n.t('month10'), i18n.t('month11'), i18n.t('month12'),
                ]}
                showOutOfRangeDays={true}
            />
            <Tooltip id="my-tooltip" className="heatmap-tooltip" />
        </div>
    );
}

const shiftDate = (date: Date, numDays: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
}

export const getHeatmapValues = async (fileInfos: FileInfo[], sortType: SortType, plugin: any, standard: 'fileCount' | 'charCount' = 'charCount') => {
    const valueMap = new Map<string, number>();
    
    for (const fileInfo of fileInfos) {
        try {
            const file = fileInfo.file;
            const stat = file.stat;
            const timestamp = (sortType === 'created' || sortType === 'earliestCreated') ? (fileInfo.created || stat.ctime) : stat.mtime;
            const date = moment(timestamp).format('YYYY-MM-DD');
            
            let count = 0;
            if (standard === 'fileCount') {
                // 按文件数量计算，每个文件计数为1
                count = 1;
            } else {
                // 按字符数量计算
                const content = await plugin.fileUtils.readFileContent(file);
                count = content.length;
            }
            
            if (valueMap.has(date)) {
                valueMap.set(date, valueMap.get(date)! + count);
            } else {
                valueMap.set(date, count);
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

// 调试用
// const getRange = (count:number) => {
//     return Array.from({ length: count }, (_, i) => i);
// }

// const getRandomInt = (min: number, max: number) => {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// const randomValues = getRange(200).map(index => {
//     const today = new Date();
//     return {
//         date: shiftDate(today, -index).toISOString().slice(0, 10),
//         count: getRandomInt(1, 30),
//     };
// });