import { MouseEvent, useState } from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  Checkbox,
  createStyles,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from '@material-ui/core';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { useDndContext } from '@dnd-kit/core';

import { Todo } from 'types';
import { deleteTodo, toggleIsDone } from '../../../redux/todoSlice';

import { useAppDispatch } from '../../../redux/hooks';

import TagChip from '../../TagChip';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'flex',
      overflow: 'hidden',
      boxSizing: 'border-box',
      flexDirection: 'column',
      width: '100%',
      height: 'auto',
      marginBottom: '12px',
      transition: '0.3s',
      cursor: 'grab',
      '&:last-child': {
        marginBottom: 0,
      },
    },
    checked: {
      backgroundColor: '#eee',
    },
    isDragged: {
      opacity: 0.3,
    },
    '@keyframes shadow': {
      '0%': {
        // transform: 'scale(1)',
        boxShadow: theme.shadows[3],
      },
      '100%': {
        // transform: 'scale(1.1)',
        boxShadow: theme.shadows[15],
      },
    },
    isDragOverlay: {
      animation: `$shadow 0.1s ${theme.transitions.easing.easeInOut} forwards`,
    },
    tags: {
      display: 'flex',
      marginBottom: '0.25rem',
    },
    body: {
      display: 'flex',
      alignItems: 'center',
    },
    title: {
      fontSize: '1rem',
      flexGrow: 1,
      color: '#333',
      transition: '0.2s',
      justifySelf: 'center',
    },
    '@keyframes strike': {
      '0%': {
        width: 0,
      },
      '100%': {
        width: '100%',
      },
    },
    strike: {
      color: 'grey',
      position: 'relative',
      '&::after': {
        content: '" "',
        position: 'absolute',
        top: '50%',
        left: '0',
        width: '100%',
        height: '2px',
        background: 'grey',
        animation: `$strike 0.3s ${theme.transitions.easing.easeInOut}`,
      },
    },
  }),
);

TodoCard.defaultProps = {
  isDragged: false,
  isDragOverlay: null,
};

export default function TodoCard({
  todo,
  isDragged,
  isDragOverlay,
}: {
  todo: Todo;
  isDragged?: boolean;
  isDragOverlay?: boolean;
}) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const classes = useStyles();
  const dndContext = useDndContext();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
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
      className={classNames({
        noselect: true,
        grabbable: true,
        [classes.container]: true,
        [classes.checked]: todo.isDone,
        [classes.isDragged]: isDragged,
        [classes.isDragOverlay]: isDragOverlay && dndContext.active,
      })}
      elevation={2}
      onMouseDown={
        menuAnchorEl === null
          ? undefined
          : (e) => {
              e.stopPropagation();
            }
      }
      onTouchStart={
        menuAnchorEl === null
          ? undefined
          : (e) => {
              e.stopPropagation();
            }
      }
    >
      <CardContent>
        {todo.tagName && (
          <div className={classes.tags}>
            <TagChip tagName={todo.tagName} />
          </div>
        )}
        <div className={classes.body}>
          <Checkbox
            checked={todo.isDone}
            onChange={() => {
              dispatch(toggleIsDone(todo.key));
            }}
            color="default"
            style={{ padding: theme.spacing(1) }}
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<CheckCircleIcon />}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
          />
          <Typography
            className={classNames({
              [classes.title]: true,
              [classes.strike]: todo.isDone,
            })}
            variant="body1"
          >
            {todo.title}
          </Typography>
          <IconButton
            onClick={handleMenuClick}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
          >
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
