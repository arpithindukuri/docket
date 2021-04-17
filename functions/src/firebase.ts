import * as admin from 'firebase-admin';
import firebase from 'firebase';

const useEmulator = true;

if (useEmulator) {
  process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
  process.env['AUTH_EMULATOR_HOST'] = 'localhost:9099';
}

admin.initializeApp();
const adminDB = admin.firestore();
const adminAuth = admin.auth();

export { adminDB, adminAuth };

firebase.initializeApp({
  apiKey: 'AIzaSyA3qRRt5AAtUJfmASVCbE0hzdNDqWl43ko',
  authDomain: 'docket-41868.firebaseapp.com',
  projectId: 'docket-41868',
  storageBucket: 'docket-41868.appspot.com',
  messagingSenderId: '38728438564',
  appId: '1:38728438564:web:38c18256db9edcc8b8d9b1',
  measurementId: 'G-0MNZCQ01QZ',
});

const auth = firebase.auth();
const db = firebase.firestore();
const funcs = firebase.functions();

// if (window.location.hostname === 'localhost') {
  auth.useEmulator('http://localhost:9099');
  db.useEmulator('localhost', 8080);
  funcs.useEmulator('localhost', 5001);
// }

export default firebase;
export { auth, db, funcs };
