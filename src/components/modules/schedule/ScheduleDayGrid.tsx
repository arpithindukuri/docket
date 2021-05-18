import { createPortal } from 'react-dom';
import {
  // MouseEvent,
  // TouchEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { format, parse } from 'date-fns';
import { Card, CardContent, makeStyles } from '@material-ui/core';
import {
  DragOverlay,
  useDndContext,
  useDndMonitor,
  useDroppable,
} from '@dnd-kit/core';

import DocketContext from 'src/DocketContext';
import ScheduleCard from './ScheduleCard';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  addEvent,
  Event,
  selectEventsByDate,
  updateEvent,
} from '../../../redux/eventSlice';
import { selectTagByName } from '../../../redux/tagSlice';

export interface PropTypes {
  hourHeight: number;
  date: Date;
}

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  hourBlock: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    width: '100%',
    borderBottom: '1px solid #ddd',
    pointerEvents: 'none',
  },
  placeholder: {
    position: 'absolute',
    width: 'calc(100% - 0.5rem)',
    borderRadius: '4px',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontWeight: 'bolder',
    fontSize: '2rem',
    color: 'white',
    WebkitAnimation: 'fadein 0.2s',
    MozAnimation: 'fadein 0.2s',
    MsAnimation: 'fadein 0.2s',
    OAnimation: 'fadein 0.2s',
    animation: 'fadein 0.2s',
  },
  timeBar: {
    position: 'absolute',
    width: '100%',
    transform: `translateY(-${theme.spacing(0.5)}px)`,
  },
  bar: {
    position: 'absolute',
    width: '100%',
    borderBottom: `2px dashed ${theme.palette.primary.main}`,
    boxSizing: 'content-box',
    top: `calc(${theme.spacing(0.5)}px - 1px)`,
  },
  leftCircle: {
    position: 'absolute',
    height: `${theme.spacing(1)}px`,
    width: `${theme.spacing(1)}px`,
    borderRadius: '50%',
    left: 0,
    backgroundColor: theme.palette.primary.main,
  },
  rightCircle: {
    position: 'absolute',
    height: `${theme.spacing(1)}px`,
    width: `${theme.spacing(1)}px`,
    borderRadius: '50%',
    right: 0,
    backgroundColor: theme.palette.primary.main,
  },
}));

export default function ScheduleDayGrid({ hourHeight, date }: PropTypes) {
  const classes = useStyles();

  const thisDropID = `schedule-day-${date.toISOString()}`;

  const dispatch = useAppDispatch();

  const rawEvents = useAppSelector(selectEventsByDate(date));
  const [events, setEvents] = useState<Event[]>([]);

  const rows = Array.from({ length: 24 }, (item, index) => index);
  const timeBarRef = useRef<HTMLDivElement | null>(null);

  const { isOver, setNodeRef, node } = useDroppable({ id: thisDropID });
  const { dragSource, dragData } = useContext(DocketContext);
  const { active, over } = useDndContext();

  const [activeIndex, setActiveIndex] = useState(-1);
  const [startScroll, setStartScroll] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    if (active?.data.current?.sortable.index !== undefined) {
      setActiveIndex(() => active?.data.current?.sortable.index);
    } else if (active?.data.current?.sortable.index === undefined) {
      setActiveIndex(() => -1);
    }
  }, [active, activeIndex]);

  const now = new Date();
  const timeBarTop =
    now.getHours() * hourHeight + (now.getMinutes() / 60) * hourHeight;

  const isValidSource =
    dragSource === 'todo' ||
    dragSource === 'schedule' ||
    dragData.scheduleDragData.sourceScheduleDropID !== thisDropID;

  useEffect(() => {
    setTimeout(() => {
      node.current?.parentElement?.parentElement?.scroll({
        top: timeBarTop - hourHeight * 2,
      });
    }, 0);
  }, [timeBarRef.current]);

  useEffect(() => {
    const sorted = rawEvents?.slice().sort((a, b) => {
      if (a.start < b.start) return -1;
      if (a.start > b.start) return 1;
      return 0;
    });
    setEvents(sorted || []);
  }, [rawEvents]);

  useEffect(() => {
    if (isOver) {
      setStartScroll(
        () =>
          // eslint-disable-next-line max-len
          node.current?.parentElement?.parentElement?.parentElement?.getBoundingClientRect()
            .y || 0,
      );
    }
  }, [isOver]);

  const handleMove = useCallback(
    (e) => {
      if (!isOver) return;
      if (isValidSource && e) {
        let num =
          (node.current?.parentElement?.parentElement?.scrollTop || 0) +
          e.pageY -
          startScroll -
          48;
        num = Math.round(num / (hourHeight / 4)) * (hourHeight / 4);

        setTranslateY(() => num);
      }
    },
    [startScroll, isOver],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e);
    },
    [handleMove],
  );
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      handleMove(e.touches[0]);
    },
    [handleMove],
  );

  useEffect(() => {
    if (isOver && isValidSource) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOver, isValidSource, handleTouchMove, handleMouseMove]);

  const dropHandler = useCallback(() => {
    const hour = ~~(translateY / hourHeight); // eslint-disable-line no-bitwise
    const min = ((translateY - hour * hourHeight) / hourHeight) * 60;
    const endHour = hour + 1;
    const endMin = min;
    const newStart = new Date(date);
    newStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    newStart.setHours(hour, min, 0, 0);
    const newEnd = new Date(date);
    newStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    newEnd.setHours(endHour, endMin, 0, 0);

    if (dragSource === 'todo' && dragData.todoDragData.todo) {
      dispatch(
        addEvent({
          title: dragData.todoDragData.todo.title,
          tagName: dragData.todoDragData.todo.tagName,
          start: format(newStart, 'T'),
          end: format(newEnd, 'T'),
          allDay: false,
        }),
      );
      setTranslateY(() => 0);
    } else if (
      dragSource === 'schedule' &&
      dragData.scheduleDragData.sourceScheduleDropID !== thisDropID &&
      dragData.scheduleDragData.event
    ) {
      const start = parse(dragData.scheduleDragData.event.start, 'T', date);
      const end = parse(dragData.scheduleDragData.event.end, 'T', date);
      newEnd.setHours(
        hour + (end.getHours() - start.getHours()),
        min + (end.getMinutes() - start.getMinutes()),
        0,
        0,
      );

      dispatch(
        updateEvent({
          oldStart: dragData.scheduleDragData.event.start,
          key: dragData.scheduleDragData.event.key,
          event: {
            key: dragData.scheduleDragData.event.key,
            title: dragData.scheduleDragData.event.title,
            tagName: dragData.scheduleDragData.event.tagName,
            start: format(newStart, 'T'),
            end: format(newEnd, 'T'),
            allDay: dragData.scheduleDragData.event.allDay,
          },
        }),
      );
      setTranslateY(() => 0);
    }
  }, [isOver, dragData, translateY]);

  const tagName =
    dragData.todoDragData.todo && dragData.todoDragData.todo.tagName
      ? dragData.todoDragData.todo.tagName
      : '';
  const tag = useAppSelector(selectTagByName(tagName));
  const c = tag ? tag.color : 'grey';

  useDndMonitor({
    onDragEnd: (dropEvent) => {
      if (dropEvent.over?.id === thisDropID) dropHandler();
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={classes.container}
      data-dropid={thisDropID}
      style={{ backgroundColor: isOver ? '#d4d4d4' : '' }}
    >
      {rows.map((item) => (
        <div
          key={`${thisDropID}-hour-${item}`}
          className={classes.hourBlock}
          style={{ height: hourHeight }}
        >
          <div
            style={{
              flexGrow: 1,
              borderBottom: '1px dashed #f2f2f2',
            }}
          />
          <div
            style={{
              flexGrow: 1,
              borderBottom: '1px dashed #f2f2f2',
            }}
          />
          <div
            style={{
              flexGrow: 1,
              borderBottom: '1px dashed #f2f2f2',
            }}
          />
          <div
            style={{
              flexGrow: 1,
            }}
          />
        </div>
      ))}
      {events?.map((item) => (
        <ScheduleCard
          key={`schedule-key-${item.key}`}
          thisID={`schedule-key-${item.key}`}
          event={item}
          hourHeight={hourHeight}
          scrollRef={node}
          thisDropID={thisDropID}
        />
      ))}
      {date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate() && (
          <div
            ref={timeBarRef}
            className={classes.timeBar}
            style={{ top: timeBarTop }}
          >
            <div className={classes.bar} />
            <div className={classes.rightCircle} />
            <div className={classes.leftCircle} />
          </div>
        )}
      {isOver && isValidSource && (
        <Card
          className={classes.placeholder}
          style={{
            height: hourHeight,
            // transition: 'transform 0.1s',
            transform: `translate(0px, ${translateY}px)`,
            background: c,
          }}
        >
          <CardContent style={{ color: 'white' }}>+</CardContent>
        </Card>
      )}
      {createPortal(
        <DragOverlay
          zIndex={10000}
          dropAnimation={{
            duration: 300,
            easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
          }}
          style={{
            pointerEvents: 'none',
            touchAction: 'none',
            transition: 'opacity 0.3s',
            opacity: over?.id.split('-')[0] === 'schedule' ? '0.3' : '',
          }}
        >
          {active?.id.split('-')[0] === 'schedule' && events.length > 0 ? (
            <ScheduleCard
              thisID={`schedule-key-${
                events[activeIndex > -1 ? activeIndex : 0].key
              }`}
              event={events[activeIndex > -1 ? activeIndex : 0]}
              hourHeight={hourHeight}
              scrollRef={node}
              thisDropID={thisDropID}
            />
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </div>
  );
}
