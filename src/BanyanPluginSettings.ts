import { CardContentMaxHeightType, TitleDisplayMode, FontTheme, NewNoteLocationMode } from "./models/Enum";

export interface BanyanPluginSettings {
	// basic
	settingsVersion: number;
	openWhenStartObsidian: boolean;
	cardsDirectory: string;
	cardsColumns: number;
	fontTheme: FontTheme;

	// card note
	titleDisplayMode: TitleDisplayMode;
	cardContentMaxHeight?: CardContentMaxHeightType;
	showBacklinksInCardNote?: boolean;
	useCardNote2?: boolean;

	// add note 
	useZkPrefixerFormat?: boolean;
	showAddNoteRibbonIcon?: boolean;
	newNoteLocationMode?: NewNoteLocationMode;
	customNewNoteLocation?: string;

	// 热力图设置
	heatmapCalculationStandard?: 'fileCount' | 'charCount';
	heatmapFileCountStep?: number;
	heatmapCharCountStep?: number;
	heatmapColorScheme?: string; // 配色方案名称
	heatmapWeeks?: number; // 显示的周数
	heatmapCellRadius?: number;
	heatmapCellSize?: number;
	heatmapCellGutter?: number;

}

export const CUR_SETTINGS_VERSION = 8;



export const DEFAULT_SETTINGS: BanyanPluginSettings = {
	// basic
	settingsVersion: CUR_SETTINGS_VERSION,
	openWhenStartObsidian: true,
	cardsDirectory: 'cards',
	cardsColumns: 1,

	// card note 
	titleDisplayMode: 'fileOnly',
	fontTheme: 'normal',
	cardContentMaxHeight: 'normal',
	showBacklinksInCardNote: false,
	useCardNote2: false,

	// add note
	useZkPrefixerFormat: false,
	showAddNoteRibbonIcon: true,
	newNoteLocationMode: 'current',
	customNewNoteLocation: '',

	// heatmap
	heatmapCalculationStandard: 'charCount',
	heatmapFileCountStep: 1,
	heatmapCharCountStep: 1000,
	heatmapColorScheme: 'github',
	heatmapWeeks: 20, // 默认显示20周
	heatmapCellRadius: 2,
	heatmapCellSize: 7,
	heatmapCellGutter: 0,

}