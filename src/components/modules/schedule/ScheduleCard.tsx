/* eslint-disable react/jsx-props-no-spreading */

import {
  CSSProperties,
  MouseEvent,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { format, parse } from 'date-fns';
import chroma from 'chroma-js';
import {
  ButtonBase,
  Card,
  CardContent,
  CardHeader,
  createStyles,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Popover,
  Typography,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { useDndContext, useDndMonitor, useDraggable } from '@dnd-kit/core';

import DocketContext from 'src/DocketContext';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { deleteEvent, Event, updateEvent } from '../../../redux/eventSlice';
import { selectTagByName } from '../../../redux/tagSlice';

const snapToClosest = (num: number, snapTo: number) =>
  Math.round(num / snapTo) * snapTo;

export interface PropTypes {
  thisID: string;
  event: Event;
  hourHeight: number;
  scrollRef: MutableRefObject<HTMLElement | null>;
  thisDropID: string;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      width: 'calc(100% - 0.5rem)',
      borderRadius: '0.5rem',
      backgroundColor: 'white',
      transition: '0.3s',
      overflow: 'hidden',
    },
    tag: {
      fontSize: '0.8rem',
      fontWeight: 'bold',
    },
    body: {
      display: 'flex',
      flexGrow: 1,
      alignItems: 'center',
      padding: '1rem',
    },
    title: {
      color: 'white',
      margin: '0',
      padding: '0',
      cursor: 'grab',
    },
    buttonBase: {
      flexGrow: 1,
      justifyContent: 'start',
      alignItems: 'start',
      minHeight: 0,
    },
    cardContent: {
      padding: 0,
    },
  }),
);

export default function ScheduleCard({
  thisID,
  event,
  hourHeight,
  scrollRef,
  thisDropID,
}: PropTypes) {
  // const { dropID, dragData, setDragData } = useContext(GripsContext);
  const dndContext = useDndContext();
  const { dragSource, setScheduleDragData } = useContext(DocketContext);
  const dispatch = useAppDispatch();

  const start = parse(event.start, 'T', new Date());
  const end = parse(event.end, 'T', new Date());

  const minHeight = hourHeight / 4;

  const [ty, setTy] = useState(0);
  const [topState, setTopState] = useState(0);
  const [heightState, setHeightState] = useState(0);

  const tag = useAppSelector(selectTagByName(event.tagName || ''));
  const c = tag.color;
  const cs = tag.gradient;
  // const cs = chroma.scale([
  //   chroma(c).set('hsl.h', chroma(c).get('hsl.h') - 15),
  //   chroma(c).brighten(0.5),
  // ]);

  const onResizeEnd = useCallback(() => {
    if (
      dragSource === 'schedule-resize' &&
      dndContext.over?.id === thisDropID
    ) {
      const absolutePosY = topState + ty;
      const hour = Math.round(~~(absolutePosY / hourHeight)); // eslint-disable-line no-bitwise
      const min = Math.round(
        ((absolutePosY - hour * hourHeight) / hourHeight) * 60,
      );

      const absolutePosYEnd = absolutePosY + heightState;
      const endHour = Math.round(~~(absolutePosYEnd / hourHeight)); // eslint-disable-line no-bitwise
      const endMin = Math.round(
        ((absolutePosYEnd - endHour * hourHeight) / hourHeight) * 60,
      );

      const newStart = new Date(start);
      newStart.setFullYear(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
      );
      newStart.setHours(hour, min, 0, 0);
      const newEnd = new Date(end);
      newEnd.setFullYear(end.getFullYear(), end.getMonth(), end.getDate());
      newEnd.setHours(endHour, endMin, 0, 0);

      dispatch(
        updateEvent({
          oldStart: event.start,
          key: event.key,
          event: {
            ...event,
            start: format(newStart, 'T'),
            end: format(newEnd, 'T'),
          },
        }),
      );
    }
  }, [dragSource, dndContext.over?.id, ty, topState, heightState]);

  const {
    isResizing: isResizingTop,
    sizeDiff: sizeDiffTop,
    resizeHandle: resizeHandleTop,
  } = ScheduleCardResizeHandle({
    dragID: thisID,
    variant: 'top',
    style: {
      backgroundColor: `${chroma(c).darken(0.4)}`,
    },
    scrollRef,
    onResizeEnd,
    thisDropID,
  });
  const {
    isResizing: isResizingBottom,
    sizeDiff: sizeDiffBottom,
    resizeHandle: resizeHandleBottom,
  } = ScheduleCardResizeHandle({
    dragID: thisID,
    variant: 'bottom',
    style: {
      backgroundColor: `${chroma(c).darken(0.4)}`,
    },
    scrollRef,
    onResizeEnd,
    thisDropID,
  });

  const ogtop =
    start.getHours() * hourHeight + (start.getMinutes() / 60) * hourHeight;
  let top = ogtop;
  if (isResizingTop) {
    top += sizeDiffTop;
    top = Math.round(top / (hourHeight / 4)) * (hourHeight / 4);
  }

  let eventHeight =
    (end.getHours() - start.getHours()) * hourHeight +
    ((end.getMinutes() - start.getMinutes()) / 60) * hourHeight;
  if (isResizingTop) {
    eventHeight -= top - ogtop;
  }
  if (isResizingBottom) {
    eventHeight += sizeDiffBottom;
    eventHeight = Math.round(eventHeight / (hourHeight / 4)) * (hourHeight / 4);
  }

  useEffect(() => {
    if (isResizingTop || isResizingBottom) {
      setTopState(() => top);
      setHeightState(() => eventHeight);
    }
  }, [isResizingTop, sizeDiffTop, isResizingBottom, sizeDiffBottom]);

  // useEffect(() => {
  //   if (isResizingBottom) setHeightState(() => eventHeight);
  // }, [isResizingBottom, sizeDiffBottom]);

  const onDragStart = useCallback(() => {
    setScheduleDragData(thisDropID, event);
  }, [thisDropID, event]);

  const onDragEnd = useCallback(() => {
    if (dndContext.over?.id === thisDropID && dragSource === 'schedule') {
      return () => {
        const absolutePosY = top + ty;
        const hour = ~~(absolutePosY / hourHeight); // eslint-disable-line no-bitwise
        const min = ((absolutePosY - hour * hourHeight) / hourHeight) * 60;
        const endHour = hour + end.getHours() - start.getHours();
        const endMin = min + end.getMinutes() - start.getMinutes();

        const newStart = new Date(start);
        newStart.setFullYear(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
        );
        newStart.setHours(hour, min, 0, 0);
        const newEnd = new Date(end);
        newEnd.setFullYear(end.getFullYear(), end.getMonth(), end.getDate());
        newEnd.setHours(endHour, endMin, 0, 0);

        dispatch(
          updateEvent({
            oldStart: event.start,
            key: event.key,
            event: {
              ...event,
              start: format(newStart, 'T'),
              end: format(newEnd, 'T'),
            },
          }),
        );
      };
    }
    return () => {};
  }, [dragSource, dndContext.over?.id, ty]);

  const {
    setNodeRef,
    listeners,
    attributes,
    isDragging,
    translateY,
  } = useDragInParent({
    dragID: thisID,
    validDropID: thisDropID,
    scrollRef,
    onDragStart,
    onDragEnd: onDragEnd(),
  });

  useEffect(() => {
    if (isDragging)
      setTy(() => snapToClosest(top + translateY, hourHeight / 4) - top);
  }, [isDragging, translateY]);

  const classes = useStyles();

  const [
    popoverAnchorEl,
    setPopoverAnchorEl,
  ] = useState<HTMLButtonElement | null>(null);
  const handlePopoverClick = (e: MouseEvent<HTMLButtonElement>) => {
    setPopoverAnchorEl(e.currentTarget);
  };
  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
  };
  const popoverOpen = Boolean(popoverAnchorEl);
  const id = popoverOpen ? 'simple-popover' : undefined;

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuClick = (e: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  const handleMenuDelete = () => {
    dispatch(deleteEvent({ oldStart: event.start, key: event.key }));
    handleMenuClose();
    handlePopoverClose();
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        className={`${classes.container}`}
        style={{
          opacity: isDragging ? '0.3' : '',
          background: cs,
          top,
          height: eventHeight,
          minHeight,
          transition:
            isDragging || sizeDiffTop !== 0 || sizeDiffBottom !== 0
              ? 'height 0.1s, top 0.1s, transform 0.1s, opacity 0.5s'
              : 'opacity 0.3s',
          transform: isDragging ? `translate(0px, ${ty}px)` : '',
          zIndex: isDragging ? 1000 : 'unset',
        }}
        elevation={2}
      >
        <ButtonBase
          className={classes.buttonBase}
          onClick={handlePopoverClick}
          disabled={isResizingTop || isResizingBottom}
        >
          <CardContent className={classes.cardContent}>
            <div className={classes.body}>
              <Typography
                {...listeners}
                {...attributes}
                className={classes.title}
                variant="subtitle2"
              >
                {event.title}
              </Typography>
            </div>
          </CardContent>
          {resizeHandleTop}
          {resizeHandleBottom}
        </ButtonBase>
      </Card>
      <Popover
        id={id}
        open={popoverOpen}
        anchorEl={popoverAnchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Card>
          <CardHeader
            title={<Typography>{event.title}</Typography>}
            action={
              <>
                <IconButton onClick={handleMenuClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="schedule-popover-menu"
                  anchorEl={menuAnchorEl}
                  keepMounted
                  open={Boolean(menuAnchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleMenuDelete}>Delete</MenuItem>
                </Menu>
              </>
            }
          />
        </Card>
      </Popover>
    </>
  );
}

ScheduleCardResizeHandle.defaultProps = { variant: 'top', style: {} };

export function ScheduleCardResizeHandle({
  dragID,
  variant,
  style,
  scrollRef,
  onResizeEnd,
  thisDropID,
}: {
  dragID: string;
  variant?: 'top' | 'bottom';
  style?: CSSProperties;
  scrollRef: MutableRefObject<HTMLElement | null>;
  onResizeEnd: () => void;
  thisDropID: string;
}) {
  const baseStyle: CSSProperties = {
    position: 'absolute',
    left: `calc(50% - 25px)`,
    height: '5px',
    width: '50px',
  };

  const topStyle = {
    ...baseStyle,
    top: '0px',
    cursor: 'n-resize',
    borderRadius: '0 0 4px 4px',
  };

  const bottomStyle = {
    ...baseStyle,
    bottom: '0px',
    cursor: 's-resize',
    borderRadius: '4px 4px 0 0',
  };

  const [sizeDiff, setSizeDiff] = useState(0);
  const { setDragSource } = useContext(DocketContext);
  // const { setDragData } = useContext(GripsContext);

  const onDragStart = () => {
    setDragSource('schedule-resize');
  };

  const onDragEnd = useCallback(() => {
    onResizeEnd();
  }, [onResizeEnd]);

  const { isDragging, translateY, setNodeRef } = useDragInParent({
    dragID: `${dragID}-handle-${variant}`,
    scrollRef,
    validDropID: thisDropID,
    onDragStart,
    onDragEnd,
    useClone: false,
  });

  useEffect(() => {
    setSizeDiff(() => translateY);
  }, [translateY]);

  return {
    sizeDiff,
    isResizing: isDragging,
    resizeHandle: (
      <div
        ref={setNodeRef}
        style={{ ...(variant === 'top' ? topStyle : bottomStyle), ...style }}
      />
    ),
  };
}

export function useDragInParent({
  dragID,
  scrollRef,
  validDropID,
  onDragStart,
  onDragEnd,
  useClone = true,
}: {
  dragID: string;
  scrollRef: MutableRefObject<HTMLElement | null>;
  validDropID: string;
  onDragStart: () => void;
  onDragEnd: () => void;
  useClone?: boolean;
}) {
  // const { dropID } = useContext(GripsContext);
  const { over } = useDndContext();
  const [startScroll, setStartScroll] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const thisOnDragStart = useCallback(() => {
    onDragStart();
    setStartScroll(
      () => scrollRef.current?.parentElement?.parentElement?.scrollTop || 0,
    );
  }, [onDragStart, scrollRef.current]);

  const thisOnDragEnd = useCallback(() => {
    onDragEnd();
    setTranslateY(() => 0);
  }, [onDragEnd]);

  // const { draggableRef, handleRef, dragState } = useDrag({
  //   onDragStart: thisOnDragStart,
  //   onDragEnd: thisOnDragEnd,
  //   useClone,
  // });

  if (useClone) {
    // things here
  }

  useDndMonitor({
    onDragStart: thisOnDragStart,
    onDragEnd: thisOnDragEnd,
  });

  const {
    setNodeRef,
    isDragging,
    transform,
    listeners,
    attributes,
  } = useDraggable({ id: dragID });

  useEffect(() => {
    if (isDragging && over?.id === validDropID && transform) {
      const num =
        (scrollRef.current?.parentElement?.parentElement?.scrollTop || 0) -
          startScroll +
          transform.y || 0;
      // num = Math.round(num / snapSize) * snapSize;
      setTranslateY(() => num);
    }

    if (isDragging && !over) {
      setTranslateY(() => 0);
    }
  }, [isDragging, over, transform?.y, scrollRef.current]);

  return {
    isDragging,
    setNodeRef,
    listeners,
    attributes,
    transform,
    translateY,
  };
}
