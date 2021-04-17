import {
  Box,
  Card,
  CardContent,
  createStyles,
  Divider,
  makeStyles,
  Typography,
  useTheme,
} from '@material-ui/core';
import { format } from 'date-fns';

import { useAppSelector } from '../../../redux/hooks';

// import { selectMe } from '../../../redux/userSlice';
import { EventInvite } from '../../../redux/chatSlice';
import { selectTagByName } from '../../../redux/tagSlice';

const useStyles = makeStyles((theme) =>
  createStyles({
    eventContainer: {
      display: 'flex',
      position: 'relative',
      boxSizing: 'border-box',
    },
    eventDate: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      padding: theme.spacing(1),
    },
    eventDetails: {
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(1),
    },
    tag: {
      position: 'absolute',
      height: `calc(100% - ${theme.spacing(2)}px)`,
      width: '8px',
      margin: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
    },
  }),
);

export default function ChatEventCard({
  eventInvite,
}: {
  eventInvite: EventInvite;
}) {
  const classes = useStyles();
  const theme = useTheme();
  // const myUser = useAppSelector(selectMe);

  const tagName = eventInvite.event.tagName ? eventInvite.event.tagName : '';
  const tag = useAppSelector(selectTagByName(tagName));
  const c = tag.gradient;
  // const cs = chroma.scale([
  //   chroma(c).set('hsl.h', chroma(c).get('hsl.h') - 15),
  //   chroma(c).brighten(0.6),
  // ]);

  return (
    <Card
      className={classes.eventContainer}
      // elevation={2}
      variant="outlined"
    >
      <div
        className={classes.tag}
        style={{
          background: c,
        }}
      />
      <CardContent
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        <div className={classes.eventDate}>
          <Box fontWeight={1000} color={theme.palette.text.secondary}>
            {format(Number(eventInvite.event.start), 'EEE').toUpperCase()}
          </Box>
          <Box fontSize={theme.typography.h4.fontSize}>
            {format(Number(eventInvite.event.start), 'dd')}
          </Box>
          <Box fontWeight={1000} color={theme.palette.text.secondary}>
            {format(Number(eventInvite.event.start), 'MMM').toUpperCase()}
          </Box>
        </div>
        <Divider orientation="vertical" style={{ height: '75%' }} />
        <div className={classes.eventDetails}>
          <Typography variant="body1">{eventInvite.event.title}</Typography>
          <Typography
            variant="subtitle2"
            style={{ color: theme.palette.text.secondary }}
          >
            {`${format(Number(eventInvite.event.start), 'hh:mm bbb')} - 
              ${format(Number(eventInvite.event.end), 'hh:mm bbb')}`}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
