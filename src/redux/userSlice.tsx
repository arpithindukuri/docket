import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from './store';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline';
}

export interface ChatState {
  me: User;
  friends: User[];
}

export const user1ID = 'user1';
const user2ID = 'user2';
const user3ID = 'user3';
// const user4ID = 'user4';

const initialState: ChatState = {
  // me: { id: user1ID, name: 'User 1', status: 'online' },
  me: { id: '', name: '', status: 'offline' },
  friends: [
    { id: user2ID, name: 'User 2', status: 'online' },
    { id: user3ID, name: 'User 3', status: 'offline' },
  ],
};

export const userSlice = createSlice({
  name: 'user',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<{ id: string; name: string }>) => {
      if (state.me) {
        state.me.id = action.payload.id;
        state.me.name = action.payload.name;
        state.me.status = 'online';
      }
    },
    signOut: (state) => {
      if (state.me) {
        state.me.status = 'offline';
      }
    },
    addFriend: (state, action: PayloadAction<{ friendID: string }>) => {
      state.friends.push({
        id: action.payload.friendID,
        name: `${Math.random()}`,
        status: 'offline',
      });
    },
  },
});

export const { signIn, signOut, addFriend } = userSlice.actions;

export const selectFriends = (state: RootState) => state.user.friends;
export const selectMe = (state: RootState) => state.user.me;

export const selectUserByID = (key: string) =>
  createSelector(selectFriends, (friends) => friends.find((o) => o.id === key));

export default userSlice.reducer;
