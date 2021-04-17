import {
  MouseEvent,
  // TouchEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { format, parse } from 'date-fns';
import { Card, CardContent, makeStyles } from '@material-ui/core';

import GripsContext from '../../../react-grips/context/GripsContext';
import useDrop from '../../../react-grips/hooks/useDrop';
import ScheduleCard from './ScheduleCard';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';

import styles from './ScheduleDayGrid.module.scss';
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
  const ref = useRef<HTMLDivElement | null>(null);
  const timeBarRef = useRef<HTMLDivElement | null>(null);

  const { dropID, dragData } = useContext(GripsContext);
  const [startScroll, setStartScroll] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const now = new Date();
  const timeBarTop =
    now.getHours() * hourHeight + (now.getMinutes() / 60) * hourHeight;

  useEffect(() => {
    setTimeout(() => {
      ref.current?.parentElement?.parentElement?.parentElement?.parentElement?.scroll(
        { top: timeBarTop - hourHeight * 2 },
      );
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
    if (dropID === thisDropID) {
      setStartScroll(
        () =>
          // eslint-disable-next-line max-len
          ref.current?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.getBoundingClientRect()
            .y || 0,
      );
    }
  }, [dropID]);

  const handleMove = useCallback(
    (e) => {
      if (!dropID || dropID !== thisDropID) return;
      if (
        (dragData.dragSource === 'todo' ||
          dragData.dragSource === 'schedule') &&
        e
      ) {
        let num =
          (ref.current?.parentElement?.parentElement?.parentElement
            ?.parentElement?.scrollTop || 0) +
          e.pageY -
          startScroll -
          48;
        num = Math.round(num / (hourHeight / 4)) * (hourHeight / 4);

        setTranslateY(() => num);
      }
    },
    [startScroll, dropID],
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
    if (dropID === thisDropID && dragData.dragSource === 'todo') {
      document.addEventListener('touchmove', handleTouchMove);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [dropID, handleTouchMove]);

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

    if (dragData.dragSource === 'todo') {
      dispatch(
        addEvent({
          title: dragData.todoPayload.todo.title,
          tagName: dragData.todoPayload.todo.tagName,
          start: format(newStart, 'T'),
          end: format(newEnd, 'T'),
          allDay: false,
        }),
      );
      setTranslateY(() => 0);
    } else if (
      dragData.dragSource === 'schedule' &&
      dragData.schedulePayload.sourceScheduleDropID !== thisDropID
    ) {
      const start = parse(dragData.schedulePayload.event.start, 'T', date);
      const end = parse(dragData.schedulePayload.event.end, 'T', date);
      newEnd.setHours(
        hour + (end.getHours() - start.getHours()),
        min + (end.getMinutes() - start.getMinutes()),
        0,
        0,
      );

      dispatch(
        updateEvent({
          oldStart: dragData.schedulePayload.event.start,
          key: dragData.schedulePayload.event.key,
          event: {
            key: dragData.schedulePayload.event.key,
            title: dragData.schedulePayload.event.title,
            tagName: dragData.schedulePayload.event.tagName,
            start: format(newStart, 'T'),
            end: format(newEnd, 'T'),
            allDay: dragData.schedulePayload.event.allDay,
          },
        }),
      );
      setTranslateY(() => 0);
    }
  }, [dragData, translateY]);

  useDrop({ thisDropID, dropHandler });

  const tagName =
    dragData.todoPayload && dragData.todoPayload.todo.tagName
      ? dragData.todoPayload.todo.tagName
      : '';
  const tag = useAppSelector(selectTagByName(tagName));
  const c = tag ? tag.color : 'grey';

  return (
    <div
      ref={ref}
      className={styles.Container}
      data-dropid={thisDropID}
      onMouseMove={handleMouseMove}
    >
      {rows.map((item) => (
        <div
          key={`${thisDropID}-hour-${item}`}
          className={styles.HourBlock}
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
          key={item.key}
          event={item}
          hourHeight={hourHeight}
          scrollRef={ref}
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
      {dropID === thisDropID &&
        (dragData.dragSource === 'todo' ||
          (dragData.dragSource === 'schedule' &&
            dragData.schedulePayload.sourceScheduleDropID !== thisDropID)) && (
          <Card
            className={styles.Placeholder}
            style={{
              height: hourHeight,
              transition: 'transform 0.1s',
              transform: `translate(0px, ${translateY}px)`,
              background: c,
            }}
          >
            <CardContent style={{ color: 'white' }}>+</CardContent>
          </Card>
        )}
    </div>
  );
}
