import firebase from 'firebase';

// TODO: Use a configuration object
firebase.initializeApp({
  apiKey: 'AIzaSyA3qRRt5AAtUJfmASVCbE0hzdNDqWl43ko',
  authDomain: 'docket-41868.firebaseapp.com',
  projectId: 'docket-41868',
  storageBucket: 'docket-41868.appspot.com',
  messagingSenderId: '38728438564',
  appId: '1:38728438564:web:38c18256db9edcc8b8d9b1',
  measurementId: 'G-0MNZCQ01QZ',
});
// firebase.initializeApp({
//   apiKey: '',
//   authDomain: '',
//   projectId: '',
//   storageBucket: '',
//   messagingSenderId: '',
//   appId: '',
//   measurementId: '',
// });

const auth = firebase.auth();
const db = firebase.firestore();
const funcs = firebase.functions();

if (
  window.location.hostname === '192.168.1.66' ||
  window.location.hostname === 'localhost'
) {
  auth.useEmulator('http://192.168.1.66:9099');
  db.useEmulator('192.168.1.66', 8080);
  funcs.useEmulator('192.168.1.66', 5001);
}

export default firebase;
export { auth, db, funcs };
