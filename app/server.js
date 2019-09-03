/* @format */
import express from 'express';
import get from 'lodash.get';
import cors from 'cors';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { Promise } from 'es6-promise';
mongoose.Promise = Promise;
import morgan from 'morgan';
import { logFactory } from './helpers';

import router from './routes';

const app = express();
const logger = logFactory();

dotenv.load();

mongoose.connect(process.env.MONGO_CLIENT_SERVER);

const authenticate = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://foolord.auth0.com/.well-known/jwks.json',
  }),
  audience: 'https://voyageur-js.herokuapp.com/',
  issuer: 'https://foolord.auth0.com/',
});

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/secured', authenticate);
app.use('/admin', authenticate, (req, res, next) => {
  if (req.user.role !== 'admin') return res.sendStatus(401);
  next();
});
app.use(logger);
app.use('/', router);

app.use(function(err, req, res, next) {
  if (
    err.name === 'UnauthorizedError' &&
    get(err, 'inner.message') === 'jwt expired'
  ) {
    console.log('Expired token');
    return res.status(401).send({ error: 'Expired token' });
  } else if (err) {
    console.log('Unknown error', err);
  }
  next();
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log('listening in http://localhost:' + port);
});
