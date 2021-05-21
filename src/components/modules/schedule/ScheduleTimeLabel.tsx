import { makeStyles } from '@material-ui/core';

export interface PropTypes {
  hourHeight: number;
}

const useStyles = makeStyles({
  container: {
    width: '75px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    textAlign: 'center',
  },
  hourBlock: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    width: '100%',
    borderBottom: '1px solid #ddd',
    pointerEvents: 'none',
  },
});

export default function ScheduleTimeLabel({ hourHeight }: PropTypes) {
  const classes = useStyles();
  const rows = Array.from({ length: 24 }, (item, index) => index);

  return (
    <div className={classes.container}>
      {rows.map((item) => {
        const period = item < 12 ? 'am' : 'pm';
        const time = item <= 12 ? `${item}:00` : `${item - 12}:00`;
        const text = item === 0 ? `12:00 ${period}` : `${time} ${period}`;

        return (
          <div
            key={`schedule-grid-hour-${item}`}
            className={classes.hourBlock}
            style={{ height: hourHeight }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}
