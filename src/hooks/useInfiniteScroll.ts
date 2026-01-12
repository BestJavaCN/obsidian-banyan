import { useRef, useCallback } from 'react';

export const useInfiniteScroll = (isLoading: boolean, onLoadMore: () => void) => {
    const observer = useRef<IntersectionObserver>(null);
    const lastElementRef = useCallback((node: HTMLElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                onLoadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, onLoadMore]);

    return lastElementRef;
};
