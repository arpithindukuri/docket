import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
// import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { Divider, useTheme } from '@material-ui/core';
import { DragOverlay, useDndContext } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import DocketContext from 'src/DocketContext';
import { reorder } from 'src/redux/todoSlice';
import Draggable from 'src/components/Draggable';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import Module from '../Module';
import TodoCard from './TodoCard';
import TodoInput from './TodoInput';

import styles from './TodoModule.module.scss';

export default function TodoModule() {
  const dispatch = useAppDispatch();
  const todos = useAppSelector((state) => state.todo.todos);
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [overIndex, setOverIndex] = useState(-1);

  const { setTodoDragData } = useContext(DocketContext);
  const dndContext = useDndContext();

  useEffect(() => {
    if (dndContext.active?.data.current?.sortable.index !== undefined) {
      setActiveIndex(() => dndContext.active?.data.current?.sortable.index);
    } else if (dndContext.active?.data.current?.sortable.index === undefined) {
      setActiveIndex(() => -1);
      if (activeIndex > -1 && overIndex > -1)
        dispatch(reorder({ activeIndex, overIndex }));
    }
  }, [dndContext.active, overIndex, activeIndex]);

  useEffect(() => {
    if (activeIndex > -1 && todos) setTodoDragData(todos[activeIndex]);
    // else console.log('end');
  }, [activeIndex]);

  useEffect(() => {
    if (dndContext.over?.data.current?.sortable.index !== undefined)
      setOverIndex(() => dndContext.over?.data.current?.sortable.index);
  }, [dndContext.over]);

  return (
    <Module title="TODO">
      <div
        className={styles.Container}
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper,
          height: '100%',
        }}
      >
        <SortableContext
          items={todos?.map((todo) => `todo-key-${todo.key}`) || []}
          strategy={verticalListSortingStrategy}
        >
          <div
            className={styles.Body}
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: theme.palette.background.paper,
              flexGrow: 1,
              overflowY: 'auto',
            }}
          >
            {todos
              ? todos.map((item, index) => (
                  <Draggable
                    key={`todo-key-${item.key}`}
                    id={`todo-key-${item.key}`}
                  >
                    <TodoCard todo={item} isDragged={activeIndex === index} />
                  </Draggable>
                ))
              : 'loading'}
          </div>
        </SortableContext>
        {createPortal(
          <DragOverlay
            zIndex={10000}
            dropAnimation={{
              duration: 300,
              easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
            }}
            style={{
              pointerEvents: 'none',
              touchAction: 'none',
              transition: 'opacity 0.3s',
              opacity:
                dndContext.over?.id.split('-')[0] === 'schedule' ? '0.3' : '',
            }}
          >
            {dndContext.active?.id.split('-')[0] === 'todo' && todos ? (
              <TodoCard
                todo={todos[activeIndex > -1 ? activeIndex : 0]}
                isDragOverlay
              />
            ) : null}
          </DragOverlay>,
          document.body,
        )}
      </div>
      <Divider style={{ width: '100%' }} />
      <TodoInput />
    </Module>
  );
}
