import { FilterScheme, getDefaultFilterScheme } from "./models/FilterScheme";
import { ViewScheme } from "./models/ViewScheme";
import { DefaultRandomReviewFilter, RandomReviewFilter } from "./models/RandomReviewFilters";
import { SortType } from "./models/Enum";
import { getToday } from "./utils/utils";

export const CUR_APP_DATA_VERSION = 1;

export interface BanyanAppData {
    version: number;
    // in app
    sortType: SortType;
    firstUseDate: string;
    randomBrowse: boolean;
    randomReviewFilters: RandomReviewFilter[];
    filterSchemes: FilterScheme[];
    viewSchemes: ViewScheme[];

    // UI state
    filterSchemesExpanded: boolean;
    randomReviewExpanded: boolean;
    viewSchemesExpanded: boolean;
}


export const DEFAULT_APP_DATA: BanyanAppData = {
    version: CUR_APP_DATA_VERSION,
    // in app
    sortType: 'created',
    firstUseDate: getToday(),
    randomBrowse: false,
    randomReviewFilters: [DefaultRandomReviewFilter],
    filterSchemes: [getDefaultFilterScheme([])],
    viewSchemes: [],

    // UI state
    filterSchemesExpanded: true,
    randomReviewExpanded: true,
    viewSchemesExpanded: true,
}
