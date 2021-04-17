import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// import firebase from 'firebase';

import { store } from './redux/store';
import App from './App';

// import '@fontsource/open-sans';
import './index.scss';
import '@fontsource/poppins/100.css';
import '@fontsource/poppins/200.css';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/900.css';

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: 'AIzaSyA3qRRt5AAtUJfmASVCbE0hzdNDqWl43ko',
//   authDomain: 'docket-41868.firebaseapp.com',
//   projectId: 'docket-41868',
//   storageBucket: 'docket-41868.appspot.com',
//   messagingSenderId: '38728438564',
//   appId: '1:38728438564:web:38c18256db9edcc8b8d9b1',
//   measurementId: 'G-0MNZCQ01QZ',
// };
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);
// // firebase.analytics();

// const db = firebase.firestore();

// if (window.location.hostname === 'localhost') {
//   db.useEmulator('localhost', 8080);
// }

// // eslint-disable-next-line
// export { db };

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);
