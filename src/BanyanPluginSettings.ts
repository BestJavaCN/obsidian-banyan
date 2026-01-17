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
	heatmapColorLevel0?: string;
	heatmapColorLevel1?: string;
	heatmapColorLevel2?: string;
	heatmapColorLevel3?: string;
	heatmapColorLevel4?: string;
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
	heatmapColorLevel0: '--background-primary-alt',
	heatmapColorLevel1: '#5AD368',
	heatmapColorLevel2: '#33A047',
	heatmapColorLevel3: '#1D6C30',
	heatmapColorLevel4: '#053A17',
	heatmapCellRadius: 2,
	heatmapCellSize: 6,
	heatmapCellGutter: 0,

}