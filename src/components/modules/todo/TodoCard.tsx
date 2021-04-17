import { MouseEvent, useCallback, useContext, useState } from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from '@material-ui/core';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { Todo } from 'types';
import { deleteTodo, toggleIsDone } from '../../../redux/todoSlice';

import { useAppDispatch } from '../../../redux/hooks';
import useDrag from '../../../react-grips/hooks/useDrag';
import GripsContext from '../../../react-grips/context/GripsContext';

import styles from './TodoCard.module.scss';
import TagChip from '../../TagChip';

export default function TodoCard({ todo }: { todo: Todo }) {
  const dispatch = useAppDispatch();

  const { setDragData } = useContext(GripsContext);
  const onDragStart = useCallback(() => {
    setDragData((prev) => ({
      ...prev,
      dragSource: 'todo',
      todoPayload: { todo },
    }));
  }, [setDragData]);

  const { draggableRef, handleRef, dragState } = useDrag({ onDragStart });
  const theme = useTheme();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  const handleMenuDelete = () => {
    handleMenuClose();
    dispatch(deleteTodo(todo.key));
  };

  return (
    <Card
      ref={draggableRef}
      className={classNames({
        [styles.checked]: todo.isDone,
        [styles.Container]: true,
      })}
      style={{
        transition: '0.3s',
        opacity: dragState.isDragging ? '0.3' : '',
        overflow: 'visible',
      }}
      elevation={2}
    >
      <CardContent>
        {todo.tagName && (
          <div className={styles.Tags}>
            <TagChip tagName={todo.tagName} />
          </div>
        )}
        <div className={styles.Body}>
          <Checkbox
            checked={todo.isDone}
            onChange={() => {
              dispatch(toggleIsDone(todo.key));
            }}
            color="default"
            style={{ padding: theme.spacing(1) }}
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<CheckCircleIcon />}
          />
          <Typography
            className={classNames({
              [styles.Title]: true,
              [styles.strike]: todo.isDone,
            })}
            variant="body1"
            ref={handleRef}
          >
            {todo.title}
          </Typography>
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="todo-menu"
            anchorEl={menuAnchorEl}
            keepMounted
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuDelete}>Delete</MenuItem>
          </Menu>
        </div>
        {todo.dueDate && (
          <Typography variant="subtitle2" style={{ color: 'grey' }}>
            {`due ${format(Number(todo.dueDate), 'hh:mm aaa, MMM do')}`}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// import React, { cloneElement } from 'react';
// import classNames from 'classnames';
// import { Checkbox } from '@material-ui/core';

// import { toggle } from '../../../redux/todoSlice';

// import styles from './TodoCard.module.scss';
// import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
// import useDrag from '../../../react-grips/hooks/useDrag';

// export interface PropTypes {
//   index: number;
// }

// export default function TodoCard({ index }: PropTypes) {
//   const todos = useAppSelector((state) => state.todo.todos);
//   const todo = todos[index];

//   const tags = useAppSelector((state) => state.tag.tags);
//   const tag = tags[todo.tagName || ''];

//   const dispatch = useAppDispatch();

//   const { draggableRef, handleRef, dragState } = useDrag({});

//   const card = (
//     <div
//       ref={draggableRef}
//       className={classNames({
//         [styles.Container]: true,
//         [styles.checked]: todo.isDone,
//       })}
//       style={{
//         opacity: dragState.isDragging ? '0.3' : '',
//         boxShadow: `inset 0.5rem 0 0 0 ${tag.color}`,
//       }}
//     >
//       <div className={styles.Tag} style={{ color: tag.color }}>
//         {todo.tagName}
//       </div>
//       <div className={styles.Body}>
//         <Checkbox
//           checked={todo.isDone}
//           onChange={() => {
//             dispatch(toggle(index));
//           }}
//           color="default"
//         />
//         <div
//           className={classNames({
//             [styles.Title]: true,
//             [styles.strike]: todo.isDone,
//           })}
//           ref={handleRef}
//         >
//           {todo.title}
//         </div>
//       </div>
//       <div className={styles.Tag} style={{ color: 'grey' }}>
//         {todo.dueDate && `due ${todo.dueDate.toLocaleDateString()}`}
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {dragState.isDragging
//         ? cloneElement(card, {
//             ref: {},
//             style: {
//               boxShadow: `inset 0.5rem 0 0 0 ${tag.color}`,
//               position: 'absolute',
//               height: draggableRef.current?.clientHeight,
//               width: draggableRef.current?.clientWidth,
//               transform:
// `translate(${dragState.deltaX}px, ${dragState.deltaY}px)`,
//               transition: 'transform 0s',
//               zIndex: 5000,
//             },
//           })
//         : ''}
//       {card}
//     </>
//   );
// }
