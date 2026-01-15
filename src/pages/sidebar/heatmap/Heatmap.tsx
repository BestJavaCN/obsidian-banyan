import moment from 'moment';
import { useMemo, useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip'
import { SortType } from 'src/models/Enum';
import { FileInfo } from 'src/models/FileInfo';
import { useCombineStore } from 'src/store';
import { i18n } from 'src/utils/i18n';

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
    }, [allFiles, sortType, plugin, settings.heatmapCalculationStandard]);

    // 动态生成热力图样式
    useEffect(() => {
        // 移除旧的样式标签
        const oldStyle = document.getElementById('heatmap-dynamic-styles');
        if (oldStyle) {
            oldStyle.remove();
        }

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
                fill: ${settings.heatmapColorLevel0 || '--background-primary-alt'};
            }
            
            .react-calendar-heatmap .color-scale-1 {
                fill: ${settings.heatmapColorLevel1 || '#053A17'};
            }
            
            .react-calendar-heatmap .color-scale-2 {
                fill: ${settings.heatmapColorLevel2 || '#1D6C30'};
            }
            
            .react-calendar-heatmap .color-scale-3 {
                fill: ${settings.heatmapColorLevel3 || '#33A047'};
            }
            
            .react-calendar-heatmap .color-scale-4 {
                fill: ${settings.heatmapColorLevel4 || '#5AD368'};
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
        settings.heatmapColorLevel0,
        settings.heatmapColorLevel1,
        settings.heatmapColorLevel2,
        settings.heatmapColorLevel3,
        settings.heatmapColorLevel4
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