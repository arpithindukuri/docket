import { useState } from 'react';
import classNames from 'classnames';

import { useAppSelector } from '../../../redux/hooks';
import Module from '../Module';

import ChatList from './ChatList';
import ChatScreen from './ChatScreen';
import { selectChatsOverview } from '../../../redux/chatSlice';
import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      height: '100%',
      width: '100%',
      boxSizing: 'border-box',
      paddingTop: '0',
      position: 'relative',
    },
  }),
);

export default function ChatModule() {
  const classes = useStyles();
  const [selectedChatID, setSelectedChatID] = useState('');
  const chatsOverview = useAppSelector(selectChatsOverview());

  return (
    <Module title="CHAT">
      <div
        className={classNames({
          [classes.container]: true,
        })}
        id="drawer-container"
      >
        <ChatList
          chatsOverview={chatsOverview}
          selectedChatID={selectedChatID}
          setSelectedChatID={setSelectedChatID}
        />
        <ChatScreen selectedChatID={selectedChatID} />
      </div>
    </Module>
  );
}
