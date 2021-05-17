import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
// import axios from 'axios';
// import { format } from 'date-fns';
// import { v4 as uuidv4 } from 'uuid';

import { arrayMove } from '@dnd-kit/sortable';
import { Todo } from 'types';
import { db } from 'src/firebase';
import { RootState } from './store';

// Define a type for the slice state
export interface TodoState {
  todos: Todo[] | null;
}

// Define the initial state using that type
const initialState: TodoState = {
  todos: null,
  // todos: [
  //   {
  //     key: uuidv4(),
  //     title: 'ENTI A3',
  //     isDone: false,
  //     tagName: 'school',
  //     dueDate: format(new Date(2021, 3, 10, 3, 30, 0), 'T'),
  //   },
  //   { key: uuidv4(), title: 'Review Stuff', isDone: false },
  //   {
  //     key: uuidv4(),
  //     title: 'Edit video',
  //     isDone: false,
  //     tagName: 'work',
  //     dueDate: format(new Date(2021, 3, 10, 3, 30, 0), 'T'),
  //   },
  //   {
  //     key: uuidv4(),
  //     title: 'CPSC Report',
  //     isDone: true,
  //     tagName: 'school',
  //     dueDate: format(new Date(2021, 3, 10, 3, 30, 0), 'T'),
  //   },
  //   { key: uuidv4(), title: 'Leg day', isDone: false, tagName: 'sports' },
  // ],
};

export const fetchTodos = createAsyncThunk(
  'todo/fetchTodos',
  async (arg, thunkAPI) => {
    const { me } = (thunkAPI.getState() as RootState).user;
    const result: Todo[] = [];

    await db
      .collection('users')
      .doc(me.id)
      .collection('todos')
      .get()
      .then((data) => {
        data.forEach((doc) => {
          result.push({
            key: doc.id,
            title: doc.data().title,
            isDone: doc.data().isDone,
            tagName: doc.data().tagName,
            dueDate: doc.data().dueDate,
          });
        });
      })
      .catch((err) => {
        console.error(err);
      });

    return result;
  },
);

export const addTodo = createAsyncThunk(
  'todo/addTodo',
  async (
    arg: {
      title: string;
      tagName?: string;
      dueDate?: string;
    },
    thunkAPI,
  ) => {
    const { me } = (thunkAPI.getState() as RootState).user;
    // let result: boolean = false;

    const todoRef = db.collection('users').doc(me.id).collection('todos').doc();

    thunkAPI.dispatch(
      add({
        key: todoRef.id,
        title: arg.title,
        isDone: false,
        tagName: arg.tagName,
        dueDate: arg.dueDate,
      }),
    );

    await todoRef.set({
      dueDate: arg.dueDate ? arg.dueDate : '',
      isDone: false,
      tagName: arg.tagName ? arg.tagName : '',
      title: arg.title,
    });
  },
);

export const deleteTodo = createAsyncThunk(
  'todo/deleteTodo',
  async (key: string, thunkAPI) => {
    const { me } = (thunkAPI.getState() as RootState).user;

    const doomedIndex =
      (thunkAPI.getState() as RootState).todo.todos?.findIndex(
        (todo) => todo.key === key,
      ) || -1;
    const doomedTodo =
      ((thunkAPI.getState() as RootState).todo.todos as Todo[])[doomedIndex] ||
      null;

    thunkAPI.dispatch(remove(key));

    await db
      .collection('users')
      .doc(me.id)
      .collection('todos')
      .doc(key)
      .delete()
      .then(() => {})
      .catch((err) => {
        console.error(err);
        thunkAPI.dispatch(
          add({
            key: doomedTodo.key,
            title: doomedTodo.title,
            isDone: doomedTodo.isDone,
            tagName: doomedTodo.tagName,
            dueDate: doomedTodo.dueDate,
          }),
        );
      });
  },
);

export const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    add: (
      state,
      action: PayloadAction<{
        key: string;
        title: string;
        isDone: boolean;
        tagName?: string;
        dueDate?: string;
      }>,
    ) => {
      const todo: Todo = {
        key: action.payload.key,
        title: action.payload.title,
        isDone: action.payload.isDone,
        tagName: action.payload.tagName,
        dueDate: action.payload.dueDate,
      };
      if (state.todos) state.todos.push(todo);
      else {
        state.todos = [todo];
      }
    },
    remove: (state, action: PayloadAction<string>) => {
      if (state.todos) {
        const index = state.todos.findIndex(
          (todo) => todo.key === action.payload,
        );
        state.todos.splice(index, 1);
      }
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    toggleIsDone: (state, action: PayloadAction<string>) => {
      if (state.todos) {
        const index = state.todos.map((e) => e.key).indexOf(action.payload);
        state.todos[index].isDone = !state.todos[index].isDone;
      }
    },
    reorder: (
      state,
      action: PayloadAction<{ activeIndex: number; overIndex: number }>,
    ) => {
      if (state.todos && state.todos.length > 0) {
        state.todos = arrayMove(
          state.todos,
          action.payload.activeIndex,
          action.payload.overIndex,
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTodos.rejected, (state) => {
      state.todos = [];
    });
    builder.addCase(fetchTodos.pending, (state) => {
      state.todos = null;
    });
    builder.addCase(fetchTodos.fulfilled, (state, action) => {
      state.todos = action.payload;
    });

    builder.addCase(addTodo.rejected, () => {});
    builder.addCase(addTodo.pending, () => {});
    builder.addCase(addTodo.fulfilled, () => {});

    builder.addCase(deleteTodo.fulfilled, () => {});
    builder.addCase(deleteTodo.pending, () => {});
    builder.addCase(deleteTodo.rejected, () => {});
  },
});

export const { add, remove, toggleIsDone, reorder } = todoSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectTodos = (state: RootState) => state.todo.todos;

export default todoSlice.reducer;
