import { BanyanPluginSettings } from "src/BanyanPluginSettings";
import { StateCreator } from "zustand";
import { CombineState } from ".";
import { CardContentMaxHeightType, SortType, TitleDisplayMode, FontTheme } from "src/models/Enum";
import { BanyanAppData } from "src/BanyanAppData";
import moment from "moment";

export interface SettingsState {
    settings: BanyanPluginSettings;
    appData: BanyanAppData;

    // 设置更新方法
    updateSettings: (settings: Partial<BanyanPluginSettings>) => void;
    updateAppData: (appData: Partial<BanyanAppData>) => void;

    // 单个设置项的更新方法
    updateCardsDirectory: (directory: string) => void;
    updateOpenWhenStartObsidian: (open: boolean) => void;
    updateTitleDisplayMode: (mode: TitleDisplayMode) => void;
    updateCardsColumns: (columns: number) => void;
    updateSortType: (sortType: SortType) => void;
    updateFirstUseDate: (date: string) => void;
    updateShowBacklinksInCardNote: (show: boolean) => void;
    updateUseCardNote2: (use: boolean) => void; // 新增
    updateRandomBrowse: (randomBrowse: boolean) => void; // 新增：乱序浏览开关
    updateCardContentMaxHeight: (height: CardContentMaxHeightType) => void; // 新增：卡片内容最大高度
    updateFontTheme: (theme: FontTheme) => void; // 新增：字体大小主题

    // UI state updates
    updateFilterSchemesExpanded: (expanded: boolean) => void;
    updateRandomReviewExpanded: (expanded: boolean) => void;
    updateViewSchemesExpanded: (expanded: boolean) => void;

    // 业务逻辑：是否显示卡片标题（基于当前设置与文件名）
    shouldShowTitle: (basename: string) => boolean;
}

export const useSettingsStore: StateCreator<CombineState, [], [], SettingsState> = (set, get) => ({
    settings: {} as BanyanPluginSettings,
    appData: {} as BanyanAppData,

    updateSettings: (newSettings: Partial<BanyanPluginSettings>) => {
        const plugin = get().plugin;
        const updatedSettings = { ...plugin.settings, ...newSettings };
        plugin.settings = updatedSettings;
        plugin.saveSettings();
        set({ settings: updatedSettings });
    },

    updateAppData: (newAppData: Partial<BanyanAppData>) => {
        const plugin = get().plugin;
        const updatedAppData = { ...plugin.appData, ...newAppData };
        plugin.appData = updatedAppData;
        plugin.saveAppData();
        set({ appData: updatedAppData });
    },

    updateCardsDirectory: (directory: string) => {
        get().updateSettings({ cardsDirectory: directory });
    },

    updateOpenWhenStartObsidian: (open: boolean) => {
        get().updateSettings({ openWhenStartObsidian: open });
    },

    updateTitleDisplayMode: (mode: TitleDisplayMode) => {
        get().updateSettings({ titleDisplayMode: mode });
    },

    updateCardsColumns: (columns: number) => {
        get().updateSettings({ cardsColumns: columns });
    },

    updateSortType: (sortType: SortType) => {
        get().updateAppData({ sortType });
    },

    updateFirstUseDate: (date: string) => {
        get().updateAppData({ firstUseDate: date });
    },

    updateShowBacklinksInCardNote: (show: boolean) => {
        get().updateSettings({ showBacklinksInCardNote: show });
    },
    updateUseCardNote2: (use: boolean) => {
        get().updateSettings({ useCardNote2: use });
    },
    updateRandomBrowse: (randomBrowse: boolean) => {
        get().updateAppData({ randomBrowse });
    },
    updateCardContentMaxHeight: (height: CardContentMaxHeightType) => {
        get().updateSettings({ cardContentMaxHeight: height });
    },
    updateFontTheme: (theme: FontTheme) => {
        get().updateSettings({ fontTheme: theme });
    },

    // UI state updates
    updateFilterSchemesExpanded: (expanded: boolean) => {
        get().updateAppData({ filterSchemesExpanded: expanded });
    },
    updateRandomReviewExpanded: (expanded: boolean) => {
        get().updateAppData({ randomReviewExpanded: expanded });
    },
    updateViewSchemesExpanded: (expanded: boolean) => {
        get().updateAppData({ viewSchemesExpanded: expanded });
    },

    shouldShowTitle: (basename: string) => {
        const mode = get().settings.titleDisplayMode;
        if (mode === 'none') return false;
        const formatStr = get().plugin.fileUtils.getZkPrefixerFormat() || "YYYY-MM-DD HH-mm-ss";
        return !moment(basename, formatStr, true).isValid();
    },
});