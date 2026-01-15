import * as React from "react";
import { Menu } from "obsidian";
import { useCombineStore } from "src/store";
import { i18n } from "src/utils/i18n";
import { Icon } from "src/components/Icon";

export const SortFilesButton = () => {
    const sortType = useCombineStore((state) => state.appData.sortType) || 'created';
    const updateSortType = useCombineStore((state) => state.updateSortType);

    const handleSortMenu = (event: React.MouseEvent) => {
        const sortMenu = new Menu();
        sortMenu.addItem((item) => {
            item.setTitle(i18n.t('recently_created'));
            item.setChecked(sortType === 'created');
            item.onClick(() => {
                updateSortType('created');
            });
        });
        sortMenu.addItem((item) => {
            item.setTitle(i18n.t('recently_updated'));
            item.setChecked(sortType === 'modified');
            item.onClick(() => {
                updateSortType('modified');
            });
        });
        sortMenu.addItem((item) => {
            item.setTitle(i18n.t('earliest_created'));
            item.setChecked(sortType === 'earliestCreated');
            item.onClick(() => {
                updateSortType('earliestCreated');
            });
        });
        sortMenu.addItem((item) => {
            item.setTitle(i18n.t('earliest_updated'));
            item.setChecked(sortType === 'earliestModified');
            item.onClick(() => {
                updateSortType('earliestModified');
            });
        });
        sortMenu.showAtMouseEvent(event.nativeEvent);
    };

    return (
        <button
            className="clickable-icon sort-button"
            onClick={handleSortMenu}
        >
            <Icon name="arrow-down-wide-narrow" />
        </button>
    );
};
