import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface Tag {
  name: string;
  color: string;
  gradient: string;
}

export interface TodoState {
  default: Tag;
  tags: Tag[];
}

const initialState: TodoState = {
  default: {
    name: 'default',
    color: 'grey',
    gradient: 'linear-gradient(-30deg, #5b5869 30%, #5b6f7d 90%)',
  },
  tags: [
    {
      name: 'school',
      color: '#ff5f2e',
      gradient: `linear-gradient(-30deg, #ff5f2e 30%, #FF7E33 90%)`,
    },
    {
      name: 'work',
      color: '#714cfe',
      gradient: `linear-gradient(-30deg, #714cfe 30%, #717cfe 90%)`,
    },
    {
      name: 'sports',
      color: '#0bc047',
      gradient: `linear-gradient(-30deg, #0bc047 30%, #0bc067 90%)`,
    },
  ],
};

export const tagSlice = createSlice({
  name: 'tag',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    add: (state, action: PayloadAction<{ [key: string]: Tag }>) => {
      state.tags = { ...state.tags, ...action.payload };
    },
    remove: (state, action: PayloadAction<string>) => {
      const index = state.tags.findIndex((tag) => tag.name === action.payload);
      state.tags.splice(index, 1);
    },
  },
});

export const { add, remove } = tagSlice.actions;

export const selectTagSlice = (state: RootState) => state.tag;
export const selectTags = (state: RootState) => state.tag.tags;
export const selectDefault = (state: RootState) => state.tag.default;

export const selectTagByName = (name: string) =>
  createSelector(
    selectTagSlice,
    (tag) => tag.tags.find((t) => t.name === name) || tag.default,
  );

export default tagSlice.reducer;
