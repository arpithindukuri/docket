import * as functions from 'firebase-functions';
import { adminAuth, adminDB, auth } from '../firebase';
import { Request, Response } from 'express';

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

export const updateFirestoreUsersFromAuth = functions.https.onRequest(
  (request, response) => {
    const batch = adminDB.batch();

    const iterateThroughUsers = (nextPageToken?: string): Promise<void> => {
      return adminAuth
        .listUsers(1, nextPageToken)
        .then((listUsersResult) => {
          listUsersResult.users.forEach((userRecord) => {
            const userRef = adminDB.collection('users').doc(userRecord.uid);
            batch.set(
              userRef,
              {
                email: userRecord.email,
                name: userRecord.displayName,
                photoURL: userRecord.photoURL,
              },
              { merge: true },
            );
          });
          if (listUsersResult.pageToken) {
            return iterateThroughUsers(
              listUsersResult.pageToken,
            ).then(() => {});
          }
          return Promise.resolve();
        })
        .catch((error) => {
          console.log('Error listing users:', error);
        });
    };

    return iterateThroughUsers().then(() => {
      return batch
        .commit()
        .then(() => {
          functions.logger.info('/users successfully updated!');
          response.send('Finished updating /users in Firestore from Auth');
        })
        .catch((error) => {
          functions.logger.error('Error while updating /users!', error);
        });
    });
  },
);

export const onUserCreate = functions.auth.user().onCreate((user) => {
  return adminDB
    .collection('users')
    .doc(user.uid)
    .set({
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
    })
    .then(() => {
      functions.logger.info('Added user to /users: ', user.displayName);
    })
    .catch((error) => {
      functions.logger.info(
        'Could not add user to /users: ',
        user.displayName,
        error,
      );
    });
});

export const onUserDelete = functions.auth.user().onDelete((user) => {
  return adminDB
    .collection('users')
    .doc(user.uid)
    .delete()
    .then(() => {
      functions.logger.info('Deleted user: ', user.displayName, ' from /users');
    })
    .catch((error) => {
      functions.logger.info(
        'Could not delete user: ',
        user.displayName,
        ' from /users',
        error,
      );
    });
});

const isEmpty = (string: string) => {
  if (string.trim() === '') return true;
  else return false;
};

const validateLoginData = (data: { email: string; password: string }) => {
  let errors: { email?: string; password?: string } = {};

  if (data.email && isEmpty(data.email)) errors.email = 'Must not be empty';
  if (data.password && isEmpty(data.password))
    errors.password = 'Must not be empty';

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

export const loginUser = (request: Request, response: Response) => {
  const user = {
    email: request.body.email,
    password: request.body.password,
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return response.status(400).json(errors);

  auth
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user?.getIdToken();
    })
    .then((token) => {
      return response.json({ token });
    })
    .catch((error) => {
      console.error(error);
      return response.status(403).json({
        general: 'wrong credentials, please try again',
      });
    });
  return;
};
