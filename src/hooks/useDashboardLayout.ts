import { useState, useCallback, useEffect, RefObject } from 'react';
import { Platform } from 'obsidian';
import { useCombineStore } from 'src/store';

export const useDashboardLayout = <T extends HTMLElement | null>(containerRef: RefObject<T>) => {
    const cardsColumns = useCombineStore((state) => state.settings.cardsColumns);
    const [showSidebar, setShowSidebar] = useState<'normal' | 'hide' | 'show'>(Platform.isMobile ? 'hide' : 'normal');
    const [colCount, setColCount] = useState(1);

    const updateLayout = useCallback((width?: number) => {
        if (Platform.isMobile) {
            setShowSidebar('hide');
            setColCount(1);
            return;
        }

        const containerWidth = width ?? containerRef.current?.clientWidth ?? 0;
        if (containerWidth === 0) return;

        const _showSidebar = containerWidth >= 920 ? 'normal' : 'hide'; // 920 是试验效果得来的
        setShowSidebar(_showSidebar);

        if (cardsColumns == 1) {
            setColCount(1);
            return;
        }

        const mainWidth = containerWidth - (_showSidebar == 'normal' ? 400 : 0);
        const cardWidth = 620;
        const cardsPadding = 24;
        const widthFor2Cols = cardWidth + cardsPadding + cardWidth;
        const cnt = mainWidth >= widthFor2Cols ? 2 : 1;
        setColCount(cnt);
    }, [cardsColumns, containerRef]);

    useEffect(() => {
        // 初始计算
        requestAnimationFrame(() => updateLayout());

        const resizeObserver = new ResizeObserver((entries) => {
            if (!Array.isArray(entries) || !entries.length) return;
            const entry = entries[0];
            const containerWidth = entry.contentRect.width;

            requestAnimationFrame(() => updateLayout(containerWidth));
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [updateLayout, containerRef]);

    return {
        showSidebar,
        setShowSidebar,
        colCount
    };
};
