import { useEffect } from 'react';
// import axios from 'axios';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import 'overlayscrollbars/css/OverlayScrollbars.css';
import {
  createMuiTheme,
  createStyles,
  makeStyles,
  ThemeProvider,
} from '@material-ui/core';

// import { db, funcs } from './firebase';
import { setToken, clearToken } from './ServiceWorker';
import SideBar from './components/SideBar';
import Dashboard from './pages/Dashboard';
import { auth } from './firebase';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { selectMe, signIn } from './redux/userSlice';
import { initializeRedux } from './redux/store';
import { DocketProvider } from './DocketContext';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './Helper.scss';

const defaultTheme = createMuiTheme({
  shape: { borderRadius: 0 },
});

const theme = createMuiTheme({
  typography: {
    fontFamily: ['"Poppins"', defaultTheme.typography.fontFamily].join(', '),
  },
  shape: { borderRadius: defaultTheme.shape.borderRadius },
  palette: {
    primary: {
      main: '#ff8f00',
    },
  },
  overrides: {
    MuiTypography: {
      subtitle2: {
        fontWeight: 600,
        fontSize: '0.75rem',
      },
    },
    MuiCardContent: {
      root: {
        '&:last-child': {
          paddingBottom: 16,
        },
      },
    },
    MuiList: {
      padding: {
        padding: defaultTheme.spacing(1),
      },
    },
    MuiListItem: {
      root: {
        borderRadius: defaultTheme.shape.borderRadius,
        marginBottom: defaultTheme.spacing(1),
        '&:last-child': {
          marginBottom: 0,
        },
      },
      gutters: {
        paddingLeft: defaultTheme.spacing(1),
        paddingRight: defaultTheme.spacing(1),
      },
    },
    MuiListItemIcon: {
      root: {
        minWidth: 0,
      },
    },
    // MuiChip: {
    //   label: {
    //     webkitTouchCallout: 'none',
    //     webkitUserSelect: 'none',
    //     khtmlUserSelect: 'none',
    //     mozUserSelect: 'none',
    //     msUserSelect: 'none',
    //     userSelect: 'none',
    //   },
    //   labelSmall: {
    //     webkitTouchCallout: 'none',
    //     webkitUserSelect: 'none',
    //     khtmlUserSelect: 'none',
    //     mozUserSelect: 'none',
    //     msUserSelect: 'none',
    //     userSelect: 'none',
    //   },
    // },
  },
});

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '100vw',
      minHeight: '100vh',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      backgroundColor: theme.palette.grey[200],
    },
  }),
);

function App() {
  const me = useAppSelector(selectMe);
  const dispatch = useAppDispatch();
  // axios.defaults.baseURL = 'http://localhost:5001/docket-41868/us-central1/app';
  const email = 'daniel@test.com';
  const password = 'daniel';

  useEffect(() => {
    const token = localStorage.AuthToken;
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
          console.log('should be logged out');
        } else {
          console.log('should be logged in!');
          // axios.defaults.headers.common.Authorization = token;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('👾 invalid token format', error);
      }
    }

    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log(userCredential);
        console.log(userCredential.user?.getIdTokenResult());
        auth.updateCurrentUser(userCredential.user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // eslint-disable-next-line no-console
        console.error(errorCode, errorMessage);
      });

    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log(user);
        user.getIdTokenResult().then((val) => {
          setToken(val.token);
        });
        dispatch(signIn({ id: user.uid, name: user.displayName || 'USER' }));
      } else {
        clearToken();
      }
    });
  }, []);

  useEffect(() => {
    if (me.id) initializeRedux();
  }, [me]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const classes = useStyles();

  return (
    <DocketProvider>
      <DndContext sensors={sensors}>
        <ThemeProvider theme={{ ...theme }}>
          <div
            className={classes.container}
            id="grips"
          >
            <SideBar />
            <Dashboard />
          </div>
        </ThemeProvider>
      </DndContext>
    </DocketProvider>
  );
}

export default App;
