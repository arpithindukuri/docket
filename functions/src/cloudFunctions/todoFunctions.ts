import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import { db } from '../firebase';
import { Todo } from 'types';

export const moveTodos = functions.https.onRequest((request, response) => {
  db.collection('todos')
    .get()
    .then((data) => {
      data.forEach((doc) => {
        console.log(doc.id, doc.data());
        db.collection('users')
          .doc(doc.data().userID)
          .collection('todos')
          .doc(doc.id)
          .set({
            dueDate: doc.data().dueDate,
            isDone: doc.data().isDone,
            tagName: doc.data().tagName,
            title: doc.data().title,
          })
          .then(() => {
            response.send('moved!');
          });
      });
    });
});

export const getMyTodos = (request: Request, response: Response) => {
  if (request.query.userID === undefined) {
    response.status(403).json({ error: 'need userID in params' });
    return;
  }

  const userID = request.query.userID as string;

  let todos: Todo[] = [];
  db.collection('users')
    .doc(userID)
    .collection('todos')
    .get()
    .then((data) => {
      data.forEach((doc) => {
        todos.push({
          key: doc.id,
          title: doc.data().title,
          isDone: doc.data().isDone,
          tagName: doc.data().tagName,
          dueDate: doc.data().dueDate,
        });
      });
      return response.json(todos);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });

  return;
};

export const addTodo = (request: Request, response: Response) => {
  if (request.body.userID === undefined) {
    response.status(403).json({ error: 'need userID in body' });
    return;
  }
  if (request.body.title === undefined) {
    response.status(403).json({ error: 'need userID in body' });
    return;
  }

  db.collection('users')
    .doc(request.body.userID)
    .collection('todos')
    .add({
      dueDate: request.body.dueDate ? request.body.dueDate : '',
      isDone: false,
      tagName: request.body.tagName ? request.body.tagName : '',
      title: request.body.title,
    });

  return;
};
