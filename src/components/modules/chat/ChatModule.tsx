import { useState } from 'react';
import classNames from 'classnames';

import { useAppSelector } from '../../../redux/hooks';
import Module from '../Module';

import styles from './ChatModule.module.scss';
import ChatList from './ChatList';
import ChatScreen from './ChatScreen';
import { selectChatsOverview } from '../../../redux/chatSlice';

export default function ChatModule() {
  const [selectedChatID, setSelectedChatID] = useState('');
  const chatsOverview = useAppSelector(selectChatsOverview());

  return (
    <Module title="CHAT">
      <div
        className={classNames({
          [styles.Container]: true,
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
