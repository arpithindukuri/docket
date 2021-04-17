import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { RootState } from './store';
import { user1ID } from './userSlice';
import { Event } from './eventSlice';

export interface EventInvite {
  event: Event;
  isOpen: boolean;
  acceptedIDs: string[];
  rejectedIDs: string[];
}

export interface Message {
  id: string;
  senderID: string;
  message: string;
  timestamp: string;
  eventInvite?: EventInvite;
}

export interface Chat {
  id: string;
  messengerIDs: string[];
  title: string;
  messages: Message[];
}

export interface ChatState {
  chats: Chat[];
}

const initialState: ChatState = {
  chats: [
    {
      id: uuidv4(),
      messengerIDs: ['user1, user2'],
      title: 'Chat 1',
      messages: [
        {
          id: uuidv4(),
          senderID: 'user2',
          message: 'hello from user2!',
          timestamp: format(new Date(), 'T'),
        },
        {
          id: uuidv4(),
          senderID: 'user1',
          message: 'hello from user1!',
          timestamp: format(new Date(), 'T'),
        },
        {
          id: uuidv4(),
          senderID: 'user2',
          message: '@user1 join me!',
          timestamp: format(new Date(), 'T'),
          eventInvite: {
            event: {
              key: uuidv4(),
              title: 'last minute assignment',
              tagName: 'school',
              start: format(new Date(2021, 3, 10, 2, 30, 0), 'T'),
              end: format(new Date(2021, 3, 10, 4, 35, 0), 'T'),
              allDay: false,
            },
            isOpen: true,
            acceptedIDs: [],
            rejectedIDs: [],
          },
        },
      ],
    },
    {
      id: uuidv4(),
      messengerIDs: ['user1, user2, user3'],
      title: 'Chat 2',
      messages: [
        {
          id: uuidv4(),
          senderID: 'user1',
          message: 'user1 in chat 2!',
          timestamp: format(new Date(), 'T'),
        },
        {
          id: uuidv4(),
          senderID: 'user2',
          message: 'user2 in chat 2!',
          timestamp: format(new Date(), 'T'),
        },
        {
          id: uuidv4(),
          senderID: 'user3',
          message: 'user3 in chat 2!!!!',
          timestamp: format(new Date(), 'T'),
        },
      ],
    },
  ],
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    messageToChat: (
      state,
      action: PayloadAction<{ chatID: string; message: string; event?: Event }>,
    ) => {
      const index = state.chats.findIndex(
        (o) => o.id === action.payload.chatID,
      );

      state.chats[index].messages.push({
        id: uuidv4(),
        message: action.payload.message,
        senderID: user1ID,
        timestamp: format(new Date(), 'T'),
        eventInvite: action.payload.event
          ? {
              event: action.payload.event,
              isOpen: true,
              acceptedIDs: [],
              rejectedIDs: [],
            }
          : undefined,
      });
    },
  },
});

export const { messageToChat } = chatSlice.actions;

const selectChats = (state: RootState) => state.chat.chats;

export const selectChatsOverview = () =>
  createSelector(selectChats, (chats) => {
    const result: Chat[] = [];
    chats.forEach((chat) => {
      result.push({ ...chat, messages: [chat.messages[0]] });
    });
    return result;
  });

export const selectChatByID = (key: string) =>
  createSelector(selectChats, (chats) => chats.find((o) => o.id === key));

export default chatSlice.reducer;
