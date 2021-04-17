import { ChangeEventHandler, KeyboardEventHandler, useState } from 'react';
import {
  createStyles,
  Divider,
  IconButton,
  InputBase,
  makeStyles,
  Paper,
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import { useAppDispatch, useAppSelector } from '../../../redux/hooks';

import { selectChatByID, messageToChat } from '../../../redux/chatSlice';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'flex',
      backgroundColor: 'white',
      alignItems: 'center',
      margin: theme.spacing(2),
    },
    input: {
      width: '100%',
      padding: theme.spacing(1),
    },
  }),
);

export default function ChatInput({
  selectedChatID,
}: {
  selectedChatID: string;
}) {
  const classes = useStyles();
  const selectedChat = useAppSelector(selectChatByID(selectedChatID));
  const [addState, setAddState] = useState('');
  const dispatch = useAppDispatch();

  const handleSend = () => {
    if (addState.length === 0) return;
    dispatch(
      messageToChat({ chatID: selectedChat?.id || '', message: addState }),
    );
    setAddState('');
  };

  const handleChange: ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = (event) => {
    setAddState(event.target.value);
  };

  const handleKeyDown: KeyboardEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper className={classes.container} elevation={2}>
      <IconButton>
        <AttachFileIcon />
      </IconButton>
      <Divider style={{ height: '75%' }} orientation="vertical" />
      <InputBase
        className={classes.input}
        placeholder="Send a message..."
        multiline
        rowsMax={6}
        value={addState}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <Divider style={{ height: '75%' }} orientation="vertical" />
      <IconButton onClick={handleSend}>
        <SendIcon />
      </IconButton>
    </Paper>
  );
}
