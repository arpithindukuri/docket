import { useCallback, useContext, useEffect, useRef } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import {
  Card,
  Collapse,
  createStyles,
  makeStyles,
  Typography,
} from '@material-ui/core';
import classNames from 'classnames';

import { useAppDispatch, useAppSelector } from '../../../redux/hooks';

import { messageToChat, selectChatByID } from '../../../redux/chatSlice';
import ChatInput from './ChatInput';
import useDrop from '../../../react-grips/hooks/useDrop';
import GripsContext from '../../../react-grips/context/GripsContext';
import { selectTagByName } from '../../../redux/tagSlice';
import ChatBubble from './ChatBubble';
import { selectMe } from '../../../redux/userSlice';

const useStyles = makeStyles((theme) => {
  const br = theme.shape.borderRadius;
  return createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: theme.palette.background.default,
      // alignItems: 'center',
      // justifyContent: 'center',
    },
    chat: {
      minHeight: `calc(100% - ${2 * theme.spacing(2)}px)`,
      position: 'relative',
      padding: theme.spacing(2),
    },
    placeholder: {
      width: '70%',
      marginLeft: 'auto',
      marginRight: '0px',
      // borderRadius: `${br}px 0px ${br}px ${br}px`,
      borderRadius: br,
      color: 'white',
      padding: theme.spacing(3),
      textAlign: 'center',
    },
  });
});

export default function ChatScreen({
  selectedChatID,
}: {
  selectedChatID: string;
}) {
  const thisDropID = `chat-${selectedChatID}`;
  const classes = useStyles();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const selectedChat = useAppSelector(selectChatByID(selectedChatID));
  const myUser = useAppSelector(selectMe);
  const { dropID, dragData } = useContext(GripsContext);

  const scrollToBottom = (smooth: boolean = false) => {
    messagesEndRef.current?.parentElement?.parentElement?.parentElement?.scroll(
      {
        behavior: smooth ? 'smooth' : 'auto',
        top:
          messagesEndRef.current?.parentElement?.parentElement?.parentElement
            ?.scrollHeight,
      },
    );
  };
  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);
  useEffect(() => {
    if (dropID === thisDropID) {
      setTimeout(() => {
        scrollToBottom(true);
      }, 300);
    }
  }, [dropID]);

  const dispatch = useAppDispatch();

  const dropHandler = useCallback(() => {
    if (dropID === thisDropID && dragData.dragSource === 'schedule') {
      dispatch(
        messageToChat({
          chatID: selectedChat?.id || '',
          message: '',
          event: dragData.schedulePayload.event,
        }),
      );
    }
  }, [dropID, dragData]);

  useDrop({ thisDropID, dropHandler });

  const tagName =
    dragData.schedulePayload && dragData.schedulePayload.event.tagName
      ? dragData.schedulePayload.event.tagName
      : '';
  const tag = useAppSelector(selectTagByName(tagName));
  const c = tag ? tag.color : 'grey';

  return (
    <div className={classes.container}>
      {selectedChat ? (
        <>
          <OverlayScrollbarsComponent
            style={{ height: '100%', width: '100%' }}
            options={{ scrollbars: { autoHide: 'move', autoHideDelay: 400 } }}
          >
            <div
              className={classNames({
                [classes.chat]: true,
              })}
              data-dropid={thisDropID}
            >
              {selectedChat?.messages.map((message) => (
                <ChatBubble
                  key={`chat-message-${message.id}`}
                  message={message}
                  myUserID={myUser.id}
                />
              ))}

              <Collapse
                in={
                  dropID === thisDropID &&
                  (dragData.dragSource === 'todo' ||
                    dragData.dragSource === 'schedule')
                }
              >
                <Card
                  className={classes.placeholder}
                  style={{
                    transition: '0.3s',
                    background: c,
                  }}
                  variant="outlined"
                >
                  Send to {selectedChat.title}
                </Card>
              </Collapse>

              <div ref={messagesEndRef} />
            </div>
          </OverlayScrollbarsComponent>

          <ChatInput selectedChatID={selectedChatID} />
        </>
      ) : (
        <>
          <Typography
            style={{
              textAlign: 'center',
              marginTop: 'auto',
              marginBottom: 'auto',
            }}
            variant="subtitle2"
          >
            No chat selected
          </Typography>
        </>
      )}
    </div>
  );
}
