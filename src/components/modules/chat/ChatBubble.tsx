import { Card, createStyles, makeStyles, Typography } from '@material-ui/core';
import classNames from 'classnames';

import { Message } from '../../../redux/chatSlice';
import ChatEventCard from './ChatEventCard';

const useStyles = makeStyles((theme) =>
  // const br = 16; // theme.shape.borderRadius;
  createStyles({
    message: {
      width: '80%',
      padding: theme.spacing(1.5),
      marginBottom: theme.spacing(1),
      position: 'relative',
    },
    myMessage: {
      marginLeft: 'auto',
      marginRight: '0px',
      background: theme.palette.grey[200],
      // borderRadius: `${br}px 0px ${br}px ${br}px`,
    },
    otherMessage: {
      marginLeft: '0px',
      marginRight: 'auto',
      background: 'white', // `linear-gradient(-10deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
      // borderRadius: `0px ${br}px ${br}px ${br}px`,
    },
  }),
);

export default function ChatBubble({
  message,
  myUserID,
}: {
  message: Message;
  myUserID: string;
}) {
  const classes = useStyles();

  return (
    <Card
      className={classNames(
        classes.message,
        message.senderID === myUserID
          ? classes.myMessage
          : classes.otherMessage,
      )}
      elevation={2}
      variant="outlined"
    >
      <Typography variant="body2" gutterBottom={!!message.eventInvite}>
        {message.message}
      </Typography>
      {message.eventInvite && (
        <>
          <ChatEventCard eventInvite={message.eventInvite} />
        </>
      )}
    </Card>
  );
}
