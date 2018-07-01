// can we do this syntax?
import {Router} from 'express';
const authRouter = Router();

// import express from 'express';
// const authRouter = express.Router();

import DogModel from '../models/dog-model.js';
import auth from '../middleware/auth.js';
import noBody from '../middleware/badReq.js';

///////////////////////////////// start routes

authRouter.post('/signup', auth, (req,res,next) => {
  //maybe since now this has auth middleware move this error handling there or have the getAuth() funciton handle it???
  if(!Object.keys(req.body).length){
    noBody(res);
  }
  let user = new DogModel(req.body);
  user.save()
    .then( user => res.send(user.generateToken()))
    .catch( next );
});

authRouter.get('/signin', auth, (req,res) => {
  res.cookie('Token', req.token);
  res.send(req.token);
});

authRouter.get('/test', auth, (req,res) => {
  res.send('GETTING THROUGH TEST ROUTE');
});

///////////////////////////////// end routes

export default authRouter;