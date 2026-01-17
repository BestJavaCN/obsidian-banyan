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
    // 使用useState存储今天的日期，并在组件挂载后定期更新
    const [today, setToday] = useState(new Date());
    const sortType = useCombineStore((state) => state.appData.sortType);
    const allFiles = useCombineStore((state) => state.allFiles);
    const plugin = useCombineStore((state) => state.plugin);
    const settings = useCombineStore((state) => state.settings);
    const [values, setValues] = useState<HeatmapData[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // 定期更新today状态，确保日期始终是最新的
    useEffect(() => {
        // 初始更新
        setToday(new Date());
        
        // 每分钟检查一次日期是否变化
        const intervalId = setInterval(() => {
            setToday(new Date());
        }, 60000);
        
        // 清理函数
        return () => clearInterval(intervalId);
    }, []);

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
            const weeksToShow = settings.heatmapWeeks || 20;
            
            // 计算正确的开始日期，确保只显示指定的周数
            // 逻辑：今天是第N周的第D天，我们需要显示从第(N-19)周的第1天到今天的所有日期
            // 这样可以确保显示正好20周（20列）的数据
            const todayDayOfWeek = today.getDay(); // 0 = 周日, 1 = 周一, ..., 6 = 周六
            // 计算从今天开始回溯的天数：(weeksToShow - 1)周完整的天数 + 今天是周几 + 1
            // +1 是因为周日是0，但它是一周的第一天，需要算上今天这一天
            const daysToBacktrack = (weeksToShow - 1) * 7 + todayDayOfWeek + 1;
            
            // 根据是否显示超出范围的日期，调整数据生成范围
            const startDate = shiftDate(today, -daysToBacktrack);
            // 如果显示超出范围的日期，我们需要生成更多的数据
            // 向前多生成1周，向后多生成1周，确保覆盖热力图可能显示的所有单元格
            const extendedStartDate = shiftDate(startDate, -7); // 向前多1周
            const extendedEndDate = shiftDate(today, 7); // 向后多1周
            
            const allDates: HeatmapData[] = [];
            
            // 生成从扩展开始日期到扩展结束日期的所有日期数据
            // 这样当显示超出范围的日期时，鼠标指向这些单元格也能显示正确的数据
            const currentDate = new Date(extendedStartDate);
            while (currentDate <= extendedEndDate) {
                // 使用与getHeatmapValues相同的日期格式，确保匹配
                const dateStr = moment(currentDate).format('YYYY-MM-DD');
                allDates.push({
                    date: dateStr,
                    count: valueMap.get(dateStr) || 0
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            // 打印调试信息，确认数据生成正确
            console.log('Heatmap data generated:', {
                today: moment(today).format('YYYY-MM-DD'),
                todayDayOfWeek: todayDayOfWeek,
                daysToBacktrack: daysToBacktrack,
                startDate: moment(startDate).format('YYYY-MM-DD'),
                totalDays: allDates.length,
                expectedWeeks: weeksToShow,
                lastDate: allDates.length > 0 ? allDates[allDates.length - 1].date : 'N/A'
            });
            
            setValues(allDates);
        };
        fetchHeatmapValues();
    }, [allFiles, sortType, plugin, settings.heatmapCalculationStandard, settings.heatmapWeeks, today]);

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
                width: ${settings.heatmapCellSize || 7}px;
                height: ${settings.heatmapCellSize || 7}px;
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
        element.props.width = settings.heatmapCellSize || 7;
        element.props.height = settings.heatmapCellSize || 7;
        element.props.rx = settings.heatmapCellRadius || 2;
        element.props.ry = settings.heatmapCellRadius || 2;
        
        return element;
    };

    return (
        <div style={{position: 'relative'}}>
            {/* 热力图居中容器 */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CalendarHeatmap
                    // 计算开始日期，确保只显示指定的周数
                    // 使用与数据生成相同的开始日期计算方法
                    startDate={(() => {
                        const weeksToShow = settings.heatmapWeeks || 20;
                        const todayDayOfWeek = today.getDay();
                        // +1 是因为周日是0，但它是一周的第一天，需要算上今天这一天
                        const daysToBacktrack = (weeksToShow - 1) * 7 + todayDayOfWeek + 1;
                        return shiftDate(today, -daysToBacktrack);
                    })()}
                    // 结束日期设置为今天，确保不显示未来日期
                    endDate={today}
                    // 点击事件处理
                    onClick={(value) => value && onCickDate(value.date)}
                    // 传递数据
                    values={values}
                    // 单元格间距
                    gutterSize={settings.heatmapCellGutter || 0}
                    // 自定义单元格样式
                    transformDayElement={transformDayElement}
                    // 根据值设置样式类
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
                    // 自定义tooltip内容
                    tooltipDataAttrs={(value: HeatmapData): { [key: string]: string } => {
                        // 确保value存在且有date属性
                        if (!value || !value.date) {
                            return {
                                'data-tooltip-id': 'my-tooltip',
                                'data-tooltip-content': 'No data',
                            };
                        }
                        
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
                    showOutOfRangeDays={settings.heatmapShowOutOfRangeDays || false}
                />
            </div>
            <Tooltip id="my-tooltip" className="heatmap-tooltip" />
            
            {/* 热力图图例 */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end', 
                marginTop: '-2px',
                fontSize: '10px',
                color: 'var(--text-normal)'
            }}>
                <span style={{ marginRight: '5px' }}>less</span>
                <div style={{ 
                    display: 'flex', 
                    gap: `${(settings.heatmapCellGutter || 0) + 1.5}px`,
                    marginRight: '5px'
                }}>
                    <div style={{ 
                        width: `${(settings.heatmapCellSize || 7)}px`, 
                        height: `${(settings.heatmapCellSize || 7)}px`, 
                        borderRadius: `${settings.heatmapCellRadius || 2}px`,
                        backgroundColor: isDarkMode ? '#333333' : '#e0d2b3',
                    }} />
                    {getColors().map((color, index) => (
                        <div 
                            key={index} 
                            style={{ 
                                width: `${(settings.heatmapCellSize || 7)}px`, 
                                height: `${(settings.heatmapCellSize || 7)}px`, 
                                borderRadius: `${settings.heatmapCellRadius || 2}px`,
                                backgroundColor: color,
                            }} 
                        />
                    ))}
                </div>
                <span style={{ marginRight: '5px' }}>more</span>
            </div>
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