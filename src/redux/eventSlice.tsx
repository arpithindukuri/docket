import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { parse, format } from 'date-fns';
// import { v4 as uuidv4 } from 'uuid';
import { db } from 'src/firebase';
import { RootState } from './store';

export interface Event {
  key: string;
  title: string;
  tagName?: string;
  start: string;
  end: string;
  allDay: boolean;
}

// Define a type for the slice state
export interface EventState {
  events: { [key: string]: Event[] } | null;
}

export const getDate = (start: string) => {
  const date = parse(start, 'T', new Date());

  const resultDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );

  const result = format(resultDate, 'T');

  return result;
};

// Define the initial state using that type
const initialState: EventState = {
  events: null,
  // events: [
  //   {
  //     key: uuidv4(),
  //     title: 'last minute assignment',
  //     tagName: 'school',
  //     start: format(new Date(2021, 3, 10, 2, 30, 0), 'T'),
  //     end: format(new Date(2021, 3, 10, 4, 35, 0), 'T'),
  //     allDay: false,
  //   },
  //   {
  //     key: uuidv4(),
  //     title: 'another event',
  //     tagName: 'work',
  //     start: format(new Date(2021, 3, 10, 5, 0, 0), 'T'),
  //     end: format(new Date(2021, 3, 10, 6, 15, 0), 'T'),
  //     allDay: false,
  //   },
  //   {
  //     key: uuidv4(),
  //     title: 'thing',
  //     tagName: 'sports',
  //     start: format(new Date(2021, 3, 10, 8, 0, 0), 'T'),
  //     end: format(new Date(2021, 3, 10, 9, 15, 0), 'T'),
  //     allDay: false,
  //   },
  // ],
};

export const fetchEvents = createAsyncThunk(
  'todo/fetchEvents',
  async (arg, thunkAPI) => {
    const { me } = (thunkAPI.getState() as RootState).user;
    const result: Event[] = [];

    await db
      .collection('users')
      .doc(me.id)
      .collection('events')
      .get()
      .then((data) => {
        data.forEach((doc) => {
          result.push({
            key: doc.id,
            title: doc.data().title,
            tagName: doc.data().tagName,
            end: doc.data().end,
            start: doc.data().start,
            allDay: doc.data().allDay,
          });
        });
      })
      .catch((err) => {
        console.error(err);
      });

    return result;
  },
);

export const fetchEventsByDates = createAsyncThunk<
  {
    events: Event[];
  },
  { start: string; end: string },
  {}
>(
  'todo/fetchEventsByDates',
  async ({ start, end }: { start: string; end: string }, thunkAPI) => {
    const { me } = (thunkAPI.getState() as RootState).user;
    const result: Event[] = [];

    await db
      .collection('users')
      .doc(me.id)
      .collection('events')
      .where('start', '>=', start)
      .where('start', '<', end)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          result.push({
            key: doc.id,
            title: doc.data().title,
            tagName: doc.data().tagName,
            end: doc.data().end,
            start: doc.data().start,
            allDay: doc.data().allDay,
          });
        });
      })
      .catch((err) => {
        console.error(err);
      });

    return { events: result };
  },
);

export const addEvent = createAsyncThunk(
  'todo/addEvent',
  async (
    arg: {
      title: string;
      tagName?: string;
      end: string;
      start: string;
      allDay: boolean;
    },
    thunkAPI,
  ) => {
    const { me } = (thunkAPI.getState() as RootState).user;

    const eventRef = db
      .collection('users')
      .doc(me.id)
      .collection('events')
      .doc();

    const newEvent: Event = {
      key: eventRef.id,
      title: arg.title,
      tagName: arg.tagName,
      end: arg.end,
      start: arg.start,
      allDay: arg.allDay,
    };
    const date = getDate(newEvent.start);

    thunkAPI.dispatch(
      add({
        date,
        event: newEvent,
      }),
    );

    await eventRef.set({
      allDay: arg.allDay,
      title: arg.title,
      tagName: arg.tagName,
      end: arg.end,
      start: arg.start,
    });
  },
);

export const updateEvent = createAsyncThunk(
  'todo/updateEvent',
  async (
    { oldStart, key, event }: { oldStart: string; key: string; event: Event },
    thunkAPI,
  ) => {
    const { me } = (thunkAPI.getState() as RootState).user;
    const date = getDate(oldStart);

    const index =
      (thunkAPI.getState() as RootState).event.events?.[date].findIndex(
        (e) => e.key === key,
      ) || -1;
    const oldEvent =
      ((thunkAPI.getState() as RootState).event.events?.[date] as Event[])[
        index
      ] || null;

    thunkAPI.dispatch(update({ date, key, event }));

    await db
      .collection('users')
      .doc(me.id)
      .collection('events')
      .doc(key)
      .update({
        allDay: event.allDay,
        title: event.title,
        tagName: event.tagName,
        end: event.end,
        start: event.start,
      })
      .then(() => {})
      .catch((err) => {
        console.error(err);
        thunkAPI.dispatch(
          update({
            date,
            key: oldEvent.key,
            event: {
              key: oldEvent.key,
              allDay: oldEvent.allDay,
              title: oldEvent.title,
              tagName: oldEvent.tagName,
              end: oldEvent.end,
              start: oldEvent.start,
            },
          }),
        );
      });
  },
);

export const deleteEvent = createAsyncThunk(
  'todo/deleteEvent',
  async ({ oldStart, key }: { oldStart: string; key: string }, thunkAPI) => {
    const { me } = (thunkAPI.getState() as RootState).user;
    const date = getDate(oldStart);

    const doomedIndex =
      (thunkAPI.getState() as RootState).event.events?.[date].findIndex(
        (event) => event.key === key,
      ) || -1;
    const doomedEvent =
      ((thunkAPI.getState() as RootState).event.events?.[date] as Event[])[
        doomedIndex
      ] || null;

    thunkAPI.dispatch(remove({ date, key }));

    await db
      .collection('users')
      .doc(me.id)
      .collection('events')
      .doc(key)
      .delete()
      .then(() => {})
      .catch((err) => {
        console.error(err);
        thunkAPI.dispatch(
          add({
            date: '',
            event: {
              key: doomedEvent.key,
              allDay: doomedEvent.allDay,
              title: doomedEvent.title,
              tagName: doomedEvent.tagName,
              end: doomedEvent.end,
              start: doomedEvent.start,
            },
          }),
        );
      });
  },
);

export const eventSlice = createSlice({
  name: 'event',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    add: (state, action: PayloadAction<{ date: string; event: Event }>) => {
      if (state.events) {
        state.events[action.payload.date] = state.events[action.payload.date]
          ? state.events[action.payload.date]
          : [];
        state.events[action.payload.date].push(action.payload.event);
      } else {
        state.events = {};
        state.events[action.payload.date] = [];
        state.events[action.payload.date].push(action.payload.event);
      }
    },
    remove: (state, action: PayloadAction<{ date: string; key: string }>) => {
      if (state.events) {
        const index = state.events[action.payload.date]
          .map((e) => e.key)
          .indexOf(action.payload.key);
        state.events[action.payload.date].splice(index, 1);
      }
    },
    update: (
      state,
      action: PayloadAction<{ date: string; key: string; event: Event }>,
    ) => {
      if (state.events) {
        if (getDate(action.payload.event.start) === action.payload.date) {
          const index = state.events[action.payload.date]
            .map((e) => e.key)
            .indexOf(action.payload.key);
          state.events[action.payload.date].splice(
            index,
            1,
            action.payload.event,
          );
        } else {
          const index = state.events[action.payload.date]
            .map((e) => e.key)
            .indexOf(action.payload.key);
          state.events[action.payload.date].splice(index, 1);

          state.events[getDate(action.payload.event.start)] = state.events[
            getDate(action.payload.event.start)
          ]
            ? state.events[getDate(action.payload.event.start)]
            : [];
          state.events[getDate(action.payload.event.start)].push(
            action.payload.event,
          );
        }
      } else {
        state.events = {};
        state.events[getDate(action.payload.event.start)] = [];
        state.events[getDate(action.payload.event.start)].push(
          action.payload.event,
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchEventsByDates.rejected, (state) => {
      state.events = {};
    });
    builder.addCase(fetchEventsByDates.pending, () => {});
    builder.addCase(fetchEventsByDates.fulfilled, (state, action) => {
      const result: { [key: string]: Event[] } = {};

      action.payload.events.forEach((item) => {
        const date = getDate(item.start);
        result[date] = result[date] ? result[date] : [];
        result[date].push(item);
      });

      state.events = {
        ...state.events,
        ...result,
      };
    });

    builder.addCase(addEvent.rejected, () => {});
    builder.addCase(addEvent.pending, () => {});
    builder.addCase(addEvent.fulfilled, () => {});

    builder.addCase(deleteEvent.fulfilled, () => {});
    builder.addCase(deleteEvent.pending, () => {});
    builder.addCase(deleteEvent.rejected, () => {});
  },
});

export const { add, remove, update } = eventSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectEvents = (state: RootState) => state.event.events;

export const selectEventsByDate = (date: Date) =>
  createSelector(
    selectEvents,
    (events) => events?.[getDate(format(date, 'T'))],
  );

export default eventSlice.reducer;
