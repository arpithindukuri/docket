// import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// const userFunctions = require("./userFunctions");
// exports.helloWorld = userFunctions.helloWorld;

import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
// import { loginUser } from './cloudFunctions/userFunctions';
// import { addTodo, getMyTodos } from './cloudFunctions/todoFunctions';

const app = express();
app.use(cors());

export {
  helloWorld,
  updateFirestoreUsersFromAuth,
  onUserCreate,
  onUserDelete,
} from './cloudFunctions/userFunctions';

export { moveTodos } from './cloudFunctions/todoFunctions';

// app.post('/login', loginUser);
// app.get('/getMyTodos', getMyTodos);
// app.post('/addTodo', addTodo);

exports.app = functions.https.onRequest(app);
