import express from 'express';
import cors from 'cors';
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import serviceAccount from '../permissions';

console.log('serviceAccount',serviceAccount)
// import {onRequest} from "firebase-functions/v2/https";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});
const db = admin.firestore();

let app = express();

app.use(cors({ origin: true }));

app.get('/test', async (req, res) => {
  res.send('Function is working');
});

app.post('/create', async (req, res) => {
  console.log('start POST request')
  try {
    await db
      .collection('products')
      .doc('/' + req.body.id + '/')
      .create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      });
    return res.status(200).send('OK');
  } catch (e) {
    console.log(e);
    return res.status(500).send();
  }
});

const api = functions.https.onRequest(app);

export { api };
