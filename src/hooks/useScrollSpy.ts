import { useEffect, useState, type RefObject } from 'react';

export function useScrollSpy(
  sectionIds: string[],
  offset = 120,
  containerRef?: RefObject<HTMLElement>
) {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? '');
  const container = containerRef?.current ?? null;

  useEffect(() => {
    if (!sectionIds.length) {
      return;
    }

    const scrollElement =
      container ?? (typeof window !== 'undefined' ? window : undefined);

    if (!scrollElement) {
      return;
    }

    const getScrollPosition = () =>
      container ? container.scrollTop : window.scrollY;

    const getElementTop = (element: HTMLElement) => {
      if (!container) {
        return element.offsetTop;
      }
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      return elementRect.top - containerRect.top + container.scrollTop;
    };

    const handleScroll = () => {
      const scrollPosition = getScrollPosition() + offset;
      const windowHeight = container ? container.clientHeight : window.innerHeight;
      const documentHeight = container 
        ? container.scrollHeight 
        : document.documentElement.scrollHeight;
      
      // Check if we're near the bottom of the page
      const isNearBottom = scrollPosition + windowHeight >= documentHeight - 50;
      
      let currentId = sectionIds[0] ?? '';

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) {
          continue;
        }
        if (getElementTop(element) <= scrollPosition) {
          currentId = id;
        }
      }

      // If we're near the bottom, activate the last section
      if (isNearBottom && sectionIds.length > 0) {
        currentId = sectionIds[sectionIds.length - 1] ?? currentId;
      }

      // Update URL hash when active section changes
      if (currentId !== activeId) {
        const currentPath = window.location.pathname;
        const newUrl = `${currentPath}#${currentId}`;
        window.history.replaceState(null, '', newUrl);
      }

      setActiveId(currentId);
    };

    handleScroll();
    const listenerTarget: HTMLElement | Window = scrollElement;
    const listenerOptions: AddEventListenerOptions = { passive: true };
    listenerTarget.addEventListener('scroll', handleScroll, listenerOptions);

    return () => {
      listenerTarget.removeEventListener('scroll', handleScroll, listenerOptions);
    };
  }, [sectionIds, offset, container]);

  return activeId;
}
