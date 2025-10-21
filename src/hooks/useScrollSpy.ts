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
