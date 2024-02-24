import express, { Request, Response } from 'express';
import cors from 'cors';
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import serviceAccount from '../permissions';

// type Product = {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
// };

// import {onRequest} from "firebase-functions/v2/https";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});
const db = admin.firestore();

let app = express();

app.use(cors({ origin: true }));

app.get('/products', async (req: Request, res: Response) => {
  try {
    const productsCollectionRef = db.collection('products');
    const snapshot = await productsCollectionRef.get();
    const products: any[] = [];

    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).send(products);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

app.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const productsCollectionRef = db.collection('products').doc(req.params.id);
    const product = (await productsCollectionRef.get()).data();

    return res.status(200).send(product);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

app.post('/products', async (req: Request, res: Response) => {
  console.log('start POST request');
  try {
    await db.collection('products').doc(req.body.id).create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
    });
    return res.status(201).send(`product wit id: ${req.body.id} was creates`);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

app.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const snapshot = db.collection('products').doc(req.params.id);
    const product = (await snapshot.get()).data();
    if (!product) {
      return res
        .status(400)
        .send(`product wit id: ${req.params.id} was not updated, check request`);
    }

    await snapshot.update({
      name: req.body.name || product.name,
      description: req.body.description || product.description,
      price: req.body.price || product.price,
    });

    return res.status(200).send(`product with id: ${req.params.id} was updated`);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

app.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const snapshot = db.collection('products').doc(req.params.id);

    await snapshot.delete();

    return res.status(200).send(`product wit id: ${req.params.id} was deleted`);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

const api = functions.https.onRequest(app);

export { api };
