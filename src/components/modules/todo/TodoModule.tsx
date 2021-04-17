import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { Divider, useTheme } from '@material-ui/core';

import { useAppSelector } from '../../../redux/hooks';
import Module from '../Module';
import TodoCard from './TodoCard';

import styles from './TodoModule.module.scss';
import TodoInput from './TodoInput';

// export interface PropTypes {}

export default function TodoModule() {
  const todos = useAppSelector((state) => state.todo.todos);
  const theme = useTheme();

  return (
    <Module title="TODO">
      <div
        className={styles.Container}
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <OverlayScrollbarsComponent
          style={{ flexGrow: 1 }}
          options={{ scrollbars: { autoHide: 'move', autoHideDelay: 400 } }}
        >
          <div
            className={styles.Body}
            style={{
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {todos
              ? todos.map((item) => <TodoCard key={item.key} todo={item} />)
              : 'loading'}
          </div>
        </OverlayScrollbarsComponent>
        <Divider style={{ width: '100%' }} />
        <TodoInput />
      </div>
    </Module>
  );
}
