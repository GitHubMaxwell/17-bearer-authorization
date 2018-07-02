// can we do this syntax?
import {Router} from 'express';
const authRouter = Router();

// import express from 'express';
// const authRouter = express.Router();

import DogModel from '../models/dog-model.js';
import auth from '../middleware/auth.js';
import noBody from '../middleware/badReq.js';

///////////////////////////////// start routes

authRouter.post('/api/signup', (req,res,next) => {
  //maybe since now this has auth middleware move this error handling there or have the getAuth() function handle it???

  if(!Object.keys(req.body).length){
    noBody(res);
  }

  let user = new DogModel(req.body);
  user.save()
    .then( user => {
      console.log('USER from POST route:', user);
      //this returns back NOT the user but the JWT (generateToken)
      return res.send(user.generateToken());
    })
    .catch( next );
});


////////////////////// special post route for PUT expecting _id as params

authRouter.post('/api/special', (req,res,next) => {

  if(!Object.keys(req.body).length){
    noBody(res);
  }
  let user = new DogModel(req.body);
  user.save()
    .then( user => {
      console.log('USER from SPECIAL POST route:', user.userId);

      // let userToken = user.generateToken();
      // async problems? by putting the user.generateToken in the array its not waiting for it to complete?
      return [user.userId, user.generateToken()];
      // return user.generateToken();

    })
    .catch( next );
});

////////////////////////////////////////////////////////////////////////


authRouter.get('/api/signin', auth, (req,res) => {
  res.cookie('Token', req.token);
  console.log('REQ TOKEN from get route: ', req.token);

  // why is res.cookie a function???
  // console.log('REQ COOKIE from get route: ', res.cookie);

  res.send(req.token);
});

/*
pass the id of a resource though the url endpoint to req.params to fetch a resource
authRouter.get('/api/signin/:id', auth, (req,res) => {
  res.cookie('Token', req.token);
  res.send(req.token);
});
*/

// pass data as stringifed JSON in the body of a put request to update a resource
authRouter.put('/api/update/:id', auth, (req,res) => {
  console.log('GET PAST auth in PUT');
  if(!req.params) {
    res.statusCode = 404;
    res.statusMessage = 'No ID Entered';
    res.end();
  }
  //what does this get back from the operations? 
  // let update = DogModel.update(req.body);
  // console.log('PUT UPDATE: ', update);

  res.send(res.status);
});

//pass the id of a resource though the url endpoint (using req.params) to delete a resource
authRouter.delete('/api/delete/:id', auth, (req,res) => {
  if(!req.params) {
    badReq();
  }


  res.send();
});

///////////////////////////////// end routes

export default authRouter;