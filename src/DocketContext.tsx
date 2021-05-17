import { createContext, useState } from 'react';
import { Todo } from 'types';
import { Event } from './redux/eventSlice';

interface dragDataType {
  todoDragData: {
    todo: Todo | null;
  };
  scheduleDragData: {
    sourceScheduleDropID: null | string;
    event: null | Event;
  };
}

type dragSourceTypes = null | 'todo' | 'schedule' | 'schedule-resize';

export interface DocketContextType {
  setTodoDragData: (todo: Todo) => void;
  setScheduleDragData: (sourceScheduleDropID: string, event: Event) => void;
  setDragSource: (dragSource: dragSourceTypes) => void;
  dragSource: dragSourceTypes;
  dragData: dragDataType;
}

const defaultState = {
  setTodoDragData: () => {},
  setScheduleDragData: () => {},
  setDragSource: () => {},
  dragSource: null,
  dragData: {
    todoDragData: {
      todo: null,
    },
    scheduleDragData: {
      sourceScheduleDropID: null,
      event: null,
    },
  },
};

const DocketContext = createContext<DocketContextType>(defaultState);

export default DocketContext;

export const DocketProvider = ({ children }: { children: any }) => {
  const [state, setState] = useState<{
    dragSource: dragSourceTypes;
    dragData: dragDataType;
  }>({
    dragSource: null,
    dragData: {
      todoDragData: {
        todo: null,
      },
      scheduleDragData: {
        sourceScheduleDropID: null,
        event: null,
      },
    },
  });

  return (
    <DocketContext.Provider
      value={{
        dragSource: state.dragSource,
        dragData: state.dragData,
        setTodoDragData: (todo) => {
          setState((prev) => ({
            ...prev,
            dragSource: 'todo',
            dragData: {
              ...prev.dragData,
              todoDragData: { ...prev.dragData.todoDragData, todo },
            },
          }));
        },
        setScheduleDragData: (sourceScheduleDropID, event) => {
          setState((prev) => ({
            ...prev,
            dragSource: 'schedule',
            dragData: {
              ...prev.dragData,
              scheduleDragData: {
                ...prev.dragData.scheduleDragData,
                sourceScheduleDropID,
                event,
              },
            },
          }));
        },
        setDragSource: (dragSource) => {
          setState((prev) => ({
            ...prev,
            dragSource,
          }));
        },
      }}
    >
      {children}
    </DocketContext.Provider>
  );
};
