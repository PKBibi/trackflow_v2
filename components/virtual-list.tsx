import { log } from '@/lib/logger';
'use client';

import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { throttle } from '@/lib/performance';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  containerHeight?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
  containerHeight = '500px',
  onEndReached,
  endReachedThreshold = 0.8,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeightValue, setContainerHeightValue] = useState(0);
  
  // Calculate item heights
  const getItemHeight = useCallback(
    (index: number) => {
      return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
    },
    [itemHeight]
  );
  
  // Calculate total height
  const getTotalHeight = useCallback(() => {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      total += getItemHeight(i);
    }
    return total;
  }, [items.length, getItemHeight]);
  
  // Calculate visible range
  const getVisibleRange = useCallback(() => {
    if (!containerHeightValue) return { start: 0, end: 0 };
    
    let accumulatedHeight = 0;
    let start = 0;
    let end = items.length - 1;
    
    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      if (accumulatedHeight + height > scrollTop) {
        start = Math.max(0, i - overscan);
        break;
      }
      accumulatedHeight += height;
    }
    
    // Find end index
    accumulatedHeight = 0;
    for (let i = start; i < items.length; i++) {
      if (accumulatedHeight > scrollTop + containerHeightValue) {
        end = Math.min(items.length - 1, i + overscan);
        break;
      }
      accumulatedHeight += getItemHeight(i);
    }
    
    return { start, end };
  }, [items.length, scrollTop, containerHeightValue, getItemHeight, overscan]);
  
  // Handle scroll with throttling
  const handleScroll = useMemo(
    () =>
      throttle(() => {
        if (!scrollElementRef.current) return;
        
        const newScrollTop = scrollElementRef.current.scrollTop;
        setScrollTop(newScrollTop);
        
        // Check if end reached
        if (onEndReached) {
          const scrollHeight = scrollElementRef.current.scrollHeight;
          const scrollPosition = newScrollTop + containerHeightValue;
          const threshold = scrollHeight * endReachedThreshold;
          
          if (scrollPosition >= threshold) {
            onEndReached();
          }
        }
      }, 16), // ~60fps
    [containerHeightValue, endReachedThreshold, onEndReached]
  );
  
  // Update container height on mount and resize
  useEffect(() => {
    const updateContainerHeight = () => {
      if (containerRef.current) {
        setContainerHeightValue(containerRef.current.clientHeight);
      }
    };
    
    updateContainerHeight();
    window.addEventListener('resize', updateContainerHeight);
    
    return () => {
      window.removeEventListener('resize', updateContainerHeight);
    };
  }, []);
  
  // Calculate what to render
  const { start, end } = getVisibleRange();
  const visibleItems: { item: T; index: number; top: number }[] = [];
  
  let top = 0;
  for (let i = 0; i < start; i++) {
    top += getItemHeight(i);
  }
  
  for (let i = start; i <= end; i++) {
    if (i < items.length) {
      visibleItems.push({
        item: items[i],
        index: i,
        top,
      });
      top += getItemHeight(i);
    }
  }
  
  const totalHeight = getTotalHeight();
  
  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: containerHeight }}
    >
      <div
        ref={scrollElementRef}
        className="overflow-auto h-full"
        onScroll={handleScroll}
      >
        {/* Virtual spacer to maintain scrollbar */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Rendered items */}
          {visibleItems.map(({ item, index, top }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top,
                left: 0,
                right: 0,
                height: getItemHeight(index),
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Example usage component
export function VirtualTimeEntryList({ entries }: { entries: any[] }) {
  return (
    <VirtualList
      items={entries}
      itemHeight={80} // Fixed height for each item
      containerHeight="600px"
      overscan={5}
      renderItem={(entry, index) => (
        <div className="p-4 border-b">
          <div className="font-medium">{entry.activity}</div>
          <div className="text-sm text-muted-foreground">
            {entry.client} • {entry.duration} minutes
          </div>
        </div>
      )}
      onEndReached={() => {
        log.debug('Load more entries');
        // Load more entries
      }}
    />
  );
}


