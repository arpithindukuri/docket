import {
  createStyles,
  List,
  ListItem,
  ListItemIcon,
  makeStyles,
} from '@material-ui/core';
import ChatIcon from '@material-ui/icons/Chat';
import TodayIcon from '@material-ui/icons/Today';
import ListIcon from '@material-ui/icons/List';
import ReplayIcon from '@material-ui/icons/Replay';
import { clearLS } from 'src/GridLayout';

import { DefaultIDMap } from 'src/components/modules/defaults/ModuleDefaults';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'flex',
      width: theme.spacing(7),
      backgroundColor: theme.palette.background.paper,
      borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
      boxShadow: theme.shadows[4],
      alignItems: 'space-between',
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
    optionContainer: {},
    userContainer: {},
  }),
);

export default function SideBar() {
  const classes = useStyles();

  const getListItem = (icon: any, id: string) => (
    <ListItem button>
      <ListItemIcon
      // style={{ color: 'white' }}
      >
        <div
          className="droppable-element"
          draggable
          unselectable="on"
          onDragStart={(e) => {
            e.dataTransfer.setData(
              'text/plain',
              JSON.stringify(DefaultIDMap[id]),
            );
          }}
        >
          {icon}
        </div>
      </ListItemIcon>
    </ListItem>
  );
  return (
    <div className={classes.container}>
      <div className={classes.optionContainer}>
        <List>
          {getListItem(<ChatIcon />, 'dashboard-chat')}
          {getListItem(<TodayIcon />, 'dashboard-schedule')}
          {getListItem(<ListIcon />, 'dashboard-todo')}
          <ListItem
            button
            onClick={() => {
              clearLS();
            }}
          >
            <ListItemIcon
            // style={{ color: 'white' }}
            >
              <ReplayIcon />
            </ListItemIcon>
          </ListItem>
        </List>
      </div>
      <div className={classes.userContainer} />
    </div>
  );
}
