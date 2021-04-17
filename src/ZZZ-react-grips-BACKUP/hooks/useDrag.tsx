/**
 * WHAT THIS HOOK DOES:
 * 1) Adds Mouse/Touch event listeners to start the drag
 * 2) When drag is started:
 *    a) set the state as needed
 *    b) add Mouse/Touch event listeners to follow the pointer during the drag.
 *    c) create a clone to move with the pointer
 * 3) While dragging, get all the elements from the current drag point.
 *    Iterate through the above elements and check if:
 *    a) there is a element with a valid react-grips drop zone,
 *       by searching for attribute data-dropid.
 *    b) there is an element to scroll on,
 *       by checking if scrollHeight > clientHeight.
 * 4) Update the clone's position whenever dragState changes.
 */

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { debounce, throttle } from 'lodash';

import GripsContext from '../context/GripsContext';

export interface useDragPropTypes {
  useClone?: boolean;
  draggableRef?: React.MutableRefObject<HTMLDivElement | null>;
  handleRef?: React.MutableRefObject<HTMLDivElement | null>;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

/**
 * 0 = no drag,
 * 1 = mouse drag,
 * 2 = touch drag
 */
export type draggedByTypes = 0 | 1 | 2;

export interface dragStateTypes {
  isDragging: boolean;
  draggedBy: draggedByTypes;
  clickX: number;
  clickY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
}

export interface useDragReturnTypes {
  draggableRef: React.MutableRefObject<HTMLDivElement | null>;
  handleRef: React.MutableRefObject<HTMLDivElement | null>;
  dragState: dragStateTypes;
}

export default function useDrag({
  useClone = true,
  draggableRef,
  handleRef,
  onDragStart,
  onDragEnd,
}: useDragPropTypes): useDragReturnTypes {
  const hRef = useRef<HTMLDivElement | null>(null);
  const dRef = useRef<HTMLDivElement | null>(null);

  const dragClone = useRef<Node | null>(null);

  const scrollElement = useRef<HTMLDivElement | null>(null);
  const edgeSize = 50;
  const scrollSpeed = 9;
  const frameID = useRef<number | undefined>();

  const { dropID, setDropID, dropData } = useContext(GripsContext);
  const [dropParentID, setDropParentID] = useState('');

  const [dragState, setDragState] = useState<dragStateTypes>({
    isDragging: false,
    draggedBy: 0,
    clickX: 0,
    clickY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  useEffect(() => {
    let a = dRef.current as HTMLDivElement;
    const els = [];
    while (a) {
      els.unshift(a);
      a = a.parentNode as HTMLDivElement;
      if (a && a.getAttribute && a.getAttribute('data-dropid')) {
        const id = a.getAttribute('data-dropid') || '';
        setDropParentID(() => id);
        break;
      }
    }
  }, [dRef]);

  const checkHover = useCallback(
    (x: number, y: number, isDragging: boolean) => {
      const elements = document.elementsFromPoint(x, y);
      let hoveredDropID: string | undefined;
      let scroll: Element | undefined;

      // Iterate through the elements at (x, y)
      elements.forEach((el) => {
        // Check if there is a valid react-grips drop zone
        if (
          hoveredDropID === undefined &&
          el?.getAttribute('data-dropid') &&
          el !== dRef.current &&
          el !== dragClone.current
        ) {
          hoveredDropID = el?.getAttribute('data-dropid') || undefined;
        }

        // check if there is a valid scrollable element being hovered over
        if (
          !scroll &&
          el !== dRef.current &&
          el !== hRef.current &&
          el !== dragClone.current &&
          ((el as HTMLDivElement).style.overflow === 'auto' ||
            (el as HTMLDivElement).style.overflow === 'scroll' ||
            (el as HTMLDivElement).style.overflowX === 'auto' ||
            (el as HTMLDivElement).style.overflowX === 'scroll' ||
            (el as HTMLDivElement).style.overflowY === 'auto' ||
            (el as HTMLDivElement).style.overflowY === 'scroll')
        ) {
          scroll = el;
        }
      });

      // Below, we check for isDragging, because sometimes
      // this callback gets run after onStop() is called
      // resulting in incorrect state. This ensures that dropID
      // is set only if it should be, i.e. is dragging
      if (isDragging) {
        setDropID(() => hoveredDropID);
      } else if (!isDragging) {
        setDropID(() => null);
      }

      if (
        isDragging &&
        scroll &&
        scrollElement.current !== (scroll as HTMLDivElement)
      ) {
        scrollElement.current = scroll as HTMLDivElement;
      }
    },
    [],
  );

  const throttledCheckHover = useRef(throttle(checkHover, 256));
  const debouncedCheckHover = useRef(debounce(checkHover, 256));

  /**
   * The following function handleMousemove() is written by Harish Kulkarni,
   * is taken from https://github.com/07harish/React-scroll-on-edges,
   * and is used fairly under the MIT license (MIT © 07harish).
   * Find more of Harish's work at https://github.com/07harish.
   */
  function handleScroll() {
    if (scrollElement.current === null) {
      return;
    }

    // rect: element where the props is spread,
    // upon which the scrolling animation takes place
    const rect = scrollElement.current.getBoundingClientRect();
    const el = scrollElement.current;

    // Get the viewport-relative coordinates of the mousemove event.
    const viewportX = dragState.currentX - rect.left;
    const viewportY = dragState.currentY - rect.top;
    // const viewportX = event.clientX - rect.left;
    // const viewportY = event.clientY - rect.top;

    // Get the rect height and width .
    const viewportWidth = rect.width;
    const viewportHeight = rect.height;

    // Get rect edges, where top and left will be same as `edgeSize`, /
    // bottom and right will be (rectDimensions - edgeSize)
    const edgeTop = edgeSize;
    const edgeLeft = edgeSize;
    const edgeBottom = viewportHeight - edgeSize;
    const edgeRight = viewportWidth - edgeSize;

    // Check if mouse is on any of the rect's edges
    const isInLeftEdge = viewportX < edgeLeft;
    const isInRightEdge = viewportX > edgeRight;
    const isInTopEdge = viewportY < edgeTop;
    const isInBottomEdge = viewportY > edgeBottom;

    // If the mouse is not in the rect edge, stop animation.
    // Otherwise start animation
    if (!(isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge)) {
      stopAnimmation();
    } else {
      startAnimation();
    }

    // Animate scrolling when shouldScroll returns true
    function animateScrolling() {
      if (shouldScroll()) {
        frameID.current = undefined;
        startAnimation();
      } else {
        stopAnimmation();
      }
    }

    // Sets Animation ID (frameID.curent) and Initiate scrolling
    function startAnimation() {
      if (!frameID.current) {
        frameID.current = window.requestAnimationFrame(animateScrolling);
      }
    }

    // cancels scrolling of Animation ID
    function stopAnimmation() {
      if (frameID.current) {
        window.cancelAnimationFrame(frameID.current);
        frameID.current = undefined;
      }
    }

    // Measure maximum scrolling
    const maxScrollX = el.scrollWidth - el.clientWidth;
    const maxScrollY = el.scrollHeight - el.clientHeight;

    // Adjust the rect scroll based on the user's mouse position. Returns True
    // or False depending on whether or not the window scroll was changed.
    function shouldScroll() {
      // Get the current scroll position of the rect.
      const currentScrollX = el.scrollLeft;
      const currentScrollY = el.scrollTop;

      const canScrollUp = currentScrollY > 0;
      const canScrollDown = currentScrollY < maxScrollY;
      const canScrollLeft = currentScrollX > 0;
      const canScrollRight = currentScrollX < maxScrollX;

      let nextScrollX = currentScrollX;
      let nextScrollY = currentScrollY;

      // Determine next X or Y scroll depending on the edges mouse is on.
      // By adding scroll speed to next scroll gives use new scrollTo of x, y

      // Should we scroll left?
      if (isInLeftEdge && canScrollLeft) {
        nextScrollX -= scrollSpeed;

        // Should we scroll right?
      } else if (isInRightEdge && canScrollRight) {
        nextScrollX += scrollSpeed;
      }

      // Should we scroll up?
      if (isInTopEdge && canScrollUp) {
        nextScrollY -= scrollSpeed;

        // Should we scroll down?
      } else if (isInBottomEdge && canScrollDown) {
        nextScrollY += scrollSpeed;
      }

      // Sanitize invalid maximums.
      nextScrollX = Math.max(0, Math.min(maxScrollX, nextScrollX));
      nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY));

      if (nextScrollX !== currentScrollX || nextScrollY !== currentScrollY) {
        el.scrollTo(nextScrollX, nextScrollY);
        nextScrollY = 0;
        return true;
      }

      return false;
    }
  }

  useEffect(() => {
    handleScroll();
  }, [dragState.currentX, dragState.currentY, scrollElement.current]);

  // ---------- UPDATE REF IF IT CHANGES ----------//
  useEffect(() => {
    if (draggableRef && dRef.current !== draggableRef.current)
      dRef.current = draggableRef.current;
    if (handleRef && hRef.current !== handleRef.current)
      hRef.current = handleRef.current;
  }, [draggableRef, handleRef]);

  const onStart = useCallback(
    (e: MouseEvent | Touch, i: draggedByTypes) => {
      // console.log("-------onStart-------");

      if (useClone) {
        dragClone.current = dRef.current?.cloneNode(true) || null;

        (dragClone.current as HTMLDivElement).style.height = `${dRef.current?.clientHeight}px`;
        (dragClone.current as HTMLDivElement).style.width = `${dRef.current?.clientWidth}px`;
        (dragClone.current as HTMLDivElement).style.position = 'absolute';
        (dragClone.current as HTMLDivElement).style.top = `${
          e.pageY -
          (e.clientY - (dRef.current?.getBoundingClientRect().top || 0)) +
          (document.getElementById('grips')?.scrollTop || 0)
        }px`;
        (dragClone.current as HTMLDivElement).style.left = `${
          e.pageX -
          (e.clientX - (dRef.current?.getBoundingClientRect().left || 0))
        }px`;
        (dragClone.current as HTMLDivElement).classList.add(
          'fade-in-on-create',
        );
        (dragClone.current as HTMLDivElement).style.boxShadow =
          (dragClone.current as HTMLDivElement).style.boxShadow.length > 0
            ? `${
                (dragClone.current as HTMLDivElement).style.boxShadow
              }, 0px 32px 32px 0px rgba(0, 0, 0, 0.2)`
            : '0px 32px 32px 0px rgba(0, 0, 0, 0.2)';

        (dragClone.current as HTMLDivElement).style.pointerEvents = 'none';
        (dragClone.current as HTMLDivElement).style.touchAction = 'none';
        dRef.current?.style.setProperty('pointer-events', 'none');
        dRef.current?.style.setProperty('touch-action', 'none');

        if (dragClone.current) {
          document.getElementById('grips')?.appendChild(dragClone.current);
        }
        if (dragClone.current) {
          document
            .getElementById('grips')
            ?.style.setProperty('cursor', 'grabbing', 'important');
        }
      }

      throttledCheckHover.current(e.pageX, e.pageY, true);

      if (onDragStart) onDragStart();

      setDragState((prev) => ({
        ...prev,
        draggedBy: i,
        isDragging: true,
        clickX: e.pageX,
        clickY: e.pageY,
        currentX: e.pageX,
        currentY: e.pageY,
        deltaX: 0,
        deltaY: 0,
        dropID: '',
      }));
    },
    [dragClone.current],
  );

  // ---------- ADD START EVENT LISTENERS ----------//
  useEffect(() => {
    const node = hRef.current !== null ? hRef.current : dRef.current;

    function onMouseDown(e: MouseEvent) {
      // console.log("-------onMouseDown-------");
      e.preventDefault();
      if (e.button !== 0) return;
      onStart(e, 1);
    }
    function onTouchStart(e: TouchEvent) {
      // console.log("-------onTouchStart-------");
      e.preventDefault();
      onStart(e.touches[0], 2);
    }

    if (node) {
      node.addEventListener('mousedown', onMouseDown);
      // console.log("added mousedown");
      node.addEventListener('touchstart', onTouchStart);
      // console.log("added touchstart");
    }

    return () => {
      if (node) {
        node.removeEventListener('mousedown', onMouseDown);
        // console.log("removed mousedown in cleanup");
        node.removeEventListener('touchstart', onTouchStart);
        // console.log("removed touchstart in cleanup");
      }
    };
  }, [dRef, hRef, onDragStart]);

  const onMove = useCallback(
    (e: MouseEvent | Touch) => {
      // console.log("-------onMove-------");

      const X = e.pageX - dragState.clickX;
      const Y = e.pageY - dragState.clickY;

      if (dragState.draggedBy === 1)
        debouncedCheckHover.current(e.pageX, e.pageY, true);
      else if (dragState.draggedBy === 2)
        throttledCheckHover.current(e.pageX, e.pageY, true);

      setDragState((prev) => ({
        ...prev,
        currentX: e.pageX,
        currentY: e.pageY,
        deltaX: X,
        deltaY: Y,
      }));
    },
    [dragState.clickX, dragState.clickY, setDragState],
  );

  const onStop = useCallback(() => {
    // console.log("-------onStop-------");

    if (dropID && dropData.dropHandlers[dropID])
      dropData.dropHandlers[dropID](dragState);

    if (dragClone.current) {
      document.getElementById('grips')?.style.removeProperty('cursor');
    }

    if (onDragEnd) onDragEnd();

    setDragState((prev) => ({
      ...prev,
      isDragging: false,
      draggedBy: 0,
      scrollElement: undefined,
    }));

    debouncedCheckHover.current(0, 0, false);
    setDropID(() => null);
    scrollElement.current = null;
    cancelAnimationFrame(frameID.current || -1);

    if (useClone) {
      dRef.current?.style.removeProperty('pointer-events');
      dRef.current?.style.removeProperty('touch-action');
      setTimeout(() => {
        if (dragClone.current) {
          try {
            document.getElementById('grips')?.removeChild(dragClone.current);
          } catch (error) {}
        }
      }, 300);
    }
  }, [
    dropData.dropHandlers,
    dragState,
    dragClone.current,
    dRef.current,
    setDragState,
    onDragEnd,
  ]);

  // ---------- UPDATE STATE ----------//
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      // console.log("-------onMouseMove-------");
      e.preventDefault();
      onMove(e);
    }
    function onTouchMove(e: TouchEvent) {
      // console.log("-------onTouchMove-------");
      e.preventDefault();
      onMove(e.touches[0]);
    }

    function onMouseUp(e: MouseEvent) {
      // console.log("-------onMouseUp-------");
      e.preventDefault();
      onStop();
    }

    function onTouchEnd(e: TouchEvent) {
      // console.log("-------onTouchEnd-------");
      e.preventDefault();
      onStop();
    }

    function onMouseOver(e: MouseEvent) {
      checkHover(e.pageX, e.pageY, true);
    }

    if (dragState.draggedBy === 1) {
      document.addEventListener('mousemove', onMouseMove);
      // console.log("added mousemove");
      document.addEventListener('mouseup', onMouseUp);
      // console.log("added mouseup");
      document.addEventListener('mouseover', onMouseOver);
    }

    if (dragState.draggedBy === 2) {
      document.addEventListener('touchmove', onTouchMove, {
        passive: false,
      });
      // console.log("added touchmove");
      document.addEventListener('touchend', onTouchEnd, {
        passive: false,
      });
      // console.log("added touchup");
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      // console.log("removed mousemove in cleanup");
      document.removeEventListener('mouseup', onMouseUp);
      // console.log("removed mouseup in cleanup");
      document.removeEventListener('mouseover', onMouseOver);

      document.removeEventListener('touchmove', onTouchMove);
      // console.log("removed touchmove in cleanup");
      document.removeEventListener('touchend', onTouchEnd);
      // console.log("removed touchend in cleanup");
    };
  }, [onMove, onStop]);

  // ---------- UPDATE CLONE STYLES ----------//
  useEffect(() => {
    if (useClone) {
      const node = dragClone.current as HTMLDivElement;
      if (!dragState.isDragging && node) {
        node.style.setProperty('transition', '0.3s');
        node.style.setProperty('opacity', '0');
        const h =
          Math.abs(dragState.deltaX) > 40 || Math.abs(dragState.deltaY) > 40
            ? 'scale(1.05)'
            : '';
        node.style.setProperty(
          'transform',
          `translate(${dragState.deltaX}px, ${dragState.deltaY}px) ${h}`,
        );
      } else if (node) {
        node.style.setProperty(
          'transition',
          dragState.isDragging ? 'transform 0s, opacity 0.3s' : '',
        );
        node.style.setProperty(
          'transform',
          `translate(${dragState.deltaX}px, ${dragState.deltaY}px) scale(1.04)`,
        );
        node.style.setProperty('z-index', dragState.isDragging ? '5000' : '');
        node.style.opacity =
          dropID && dropID !== dropParentID && dropID !== '' ? '0.5' : '1';
      }
    }
  }, [
    useClone,
    dragState.isDragging,
    dragState.deltaX,
    dragState.deltaY,
    dropID,
    dropParentID,
  ]);

  return { draggableRef: dRef, handleRef: hRef, dragState };
}
