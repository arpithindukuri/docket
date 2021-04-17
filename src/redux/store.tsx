import { configureStore } from '@reduxjs/toolkit';
import { chatSlice } from './chatSlice';
import { eventSlice } from './eventSlice';
import { tagSlice } from './tagSlice';
import { fetchTodos, todoSlice } from './todoSlice';
import { userSlice } from './userSlice';

export const store = configureStore({
  reducer: {
    todo: todoSlice.reducer,
    event: eventSlice.reducer,
    tag: tagSlice.reducer,
    user: userSlice.reducer,
    chat: chatSlice.reducer,
  },
  devTools: true,
});

export async function initializeRedux() {
  store.dispatch(fetchTodos());
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
