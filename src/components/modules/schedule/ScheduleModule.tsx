import { useEffect, useRef, useState } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { format, startOfToday, addDays, subDays } from 'date-fns';
import { IconButton, Typography } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import { useAppDispatch, useAppSelector } from 'src/redux/hooks';
import { fetchEventsByDates } from 'src/redux/eventSlice';
import { selectMe } from 'src/redux/userSlice';
import Module from '../Module';
import ScheduleDayGrid from './ScheduleDayGrid';
import ScheduleTimeLabel from './ScheduleTimeLabel';

import styles from './ScheduleModule.module.scss';

export default function ScheduleModule() {
  const hourHeight = 65;
  const ref = useRef<HTMLDivElement>(null);
  const [numDays, setNumDays] = useState(1);
  const [rows, setRows] = useState<number[]>([]);
  const [date, setDate] = useState(startOfToday());

  const dispatch = useAppDispatch();
  const me = useAppSelector(selectMe);

  useEffect(() => {
    const start = format(subDays(date, 1), 'T');
    const end = format(addDays(date, numDays + 3), 'T');
    dispatch(fetchEventsByDates({ start, end }));
  }, [me, date]);

  useEffect(() => {
    const observer = new ResizeObserver((mutationRecords) => {
      const width = mutationRecords[0].target.clientWidth;
      setNumDays(() => width / 175);
    });

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref.current, date]);

  useEffect(() => {
    setRows(Array.from({ length: numDays }, (item, index) => index));
  }, [numDays]);

  return (
    <Module title="SCHEDULE">
      <OverlayScrollbarsComponent
        style={{
          height: '100%',
          width: '100%',
          overflow: 'hidden',
        }}
        options={{ scrollbars: { autoHide: 'move', autoHideDelay: 400 } }}
      >
        <div
          style={{
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              backgroundColor: 'white',
              position: 'sticky',
              top: '0px',
              zIndex: 500,
              borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
              padding: '0 1rem',
            }}
          >
            <div
              style={{
                width: '75px',
              }}
            />
            {rows.map((item, index) => {
              const thisDate = addDays(date, index);

              return (
                <div
                  key={`schedule-day-label-${thisDate.toISOString()}`}
                  style={{
                    flexGrow: 1,
                  }}
                >
                  <Typography variant="subtitle2" align="center">
                    {format(thisDate, 'EEE')}
                  </Typography>
                  <Typography variant="h5" align="center">
                    {thisDate.getDate()}
                  </Typography>
                </div>
              );
            })}
            <div>
              <IconButton
                onClick={() => {
                  setDate((prev) => subDays(prev, 1));
                }}
                style={{ position: 'absolute', left: 0 }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <div>
              <IconButton
                onClick={() => {
                  setDate((prev) => addDays(prev, 1));
                }}
                style={{ position: 'absolute', right: 0 }}
              >
                <ChevronRightIcon />
              </IconButton>
            </div>
          </div>
          <div ref={ref} className={styles.Body}>
            <ScheduleTimeLabel hourHeight={hourHeight} />
            {rows.map((item, index) => {
              const thisDate = addDays(date, index);

              return (
                <ScheduleDayGrid
                  key={`schedule-day-grid-${thisDate.toISOString()}`}
                  hourHeight={hourHeight}
                  date={thisDate}
                />
              );
            })}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </Module>
  );
}
