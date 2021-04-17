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
    gradient: `linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)`,
  },
  tags: [
    {
      name: 'school',
      color: '#ff5722',
      gradient: `linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)`,
    },
    {
      name: 'work',
      color: '#714cfe',
      gradient: `linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)`,
    },
    {
      name: 'sports',
      color: '#0bc047',
      gradient: `linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)`,
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

export const selectTags = (state: RootState) => state.tag.tags;
export const selectDefault = (state: RootState) => state.tag.default;

export const selectTagByName = (name: string) =>
  createSelector(selectTags, (tags) => tags.find((tag) => tag.name === name));

export default tagSlice.reducer;
