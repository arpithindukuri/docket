import { useState, Dispatch, SetStateAction } from 'react';
import {
  createStyles,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import classNames from 'classnames';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MailIcon from '@material-ui/icons/Mail';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

import { Chat } from '../../../redux/chatSlice';

const drawerWidth = 240;

const useStyles = makeStyles((theme) =>
  createStyles({
    drawer: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      // flexShrink: 0,
      whiteSpace: 'nowrap',
      display: 'flex',
    },
    drawerOpen: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      width: drawerWidth,
      overflow: 'hidden',
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflow: 'hidden',
      width: theme.spacing(7),
      // width: theme.spacing(7) + 1,
      // [theme.breakpoints.up('sm')]: {
      //   width: theme.spacing(9) + 1,
      // },
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    drawerControl: {
      padding: theme.spacing(1),
      transition: 'transform 0.3s',
    },
    flipped180: {
      transform: 'rotate(180deg)',
    },
    listItemText: {
      marginLeft: theme.spacing(1),
    },
    listItem: {
      paddingTop: 0,
      paddingBottom: 0,
    },
  }),
);

export default function ChatList({
  chatsOverview,
  selectedChatID,
  setSelectedChatID,
}: {
  chatsOverview: Chat[];
  selectedChatID: string;
  setSelectedChatID: Dispatch<SetStateAction<string>>;
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Drawer
      variant="permanent"
      className={classNames(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        paper: classNames({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
      }}
      PaperProps={{ style: { position: 'absolute' } }}
      BackdropProps={{ style: { position: 'absolute' } }}
      ModalProps={{
        container: document.getElementById('drawer-container'),
        style: { position: 'absolute' },
      }}
    >
      <div className={classes.toolbar}>
        <IconButton
          onClick={toggleDrawer}
          className={classNames({
            [classes.drawerControl]: true,
            [classes.flipped180]: open,
          })}
        >
          <ChevronRightIcon />
        </IconButton>
      </div>
      <Divider />
      <OverlayScrollbarsComponent
        style={{ height: '100%', width: '100%' }}
        options={{ scrollbars: { autoHide: 'move', autoHideDelay: 400 } }}
      >
        <List>
          {chatsOverview.map((chat) => (
            <ListItem
              key={`message-preview-${chat.messages[0].id}`}
              className={classes.listItem}
              button
              selected={selectedChatID === chat.id}
              onClick={() => {
                setSelectedChatID(selectedChatID === chat.id ? '' : chat.id);
              }}
            >
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText
                className={classes.listItemText}
                primary={chat.title}
                primaryTypographyProps={{ noWrap: true }}
                secondary={chat.messages[0].message}
                secondaryTypographyProps={{ noWrap: true }}
              />
            </ListItem>
          ))}
        </List>
      </OverlayScrollbarsComponent>
    </Drawer>
  );
}
