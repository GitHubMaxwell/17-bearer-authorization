// can we do this syntax?
import {Router} from 'express';
const authRouter = Router();

// import express from 'express';
// const authRouter = express.Router();

import DogModel from '../models/dog-model.js';
import auth from '../middleware/auth.js';
import noBody from '../middleware/badReq.js';

///////////////////////////////// start routes
authRouter.post('/api/signup', (req,res) => {

  if(!Object.keys(req.body).length){
    noBody(res);
    //put this as a next
  }

  let user = new DogModel(req.body);
  user.save()
    .then( user => {
      // console.log('USER from POST route:', user);
      //this returns back NOT the user but the JWT (generateToken)
      return res.send(user.generateToken());
    })
    .catch( err => {
      console.log('POST ROUTE error',err);
      // next();
      // where is this catch going to
    });

  // the hope is that with a bad bearer token 
  //but its skipping out of the dog-model and going back to app.js

});

// authRouter.get('/api/signin', auth, (req,res) => {
//   console.log('REQ PARAMS ID: ', req.params.id);
//   res.cookie('Token', req.token);
//   res.send(req.token);
// });

authRouter.get('/api/signin', auth, (req, res, next) => {
  if (req.id) {

    DogModel.find({ userID: req.id })
      .then(response => {
        res.send(response);
      })
      .catch(next);

  } else {
    next(401);
  }
});

authRouter.get('/api/signin/:id', auth, (req,res) => {
  console.log('REQ PARAMS ID: ', req.params.id);

  // if(!Object.keys(req.params.id).length){
  //   noBody(res);
  //   // next(400);
  // }
  res.cookie('Token', req.token);
  // console.log('REQ TOKEN from get route: ', req.token);
  // let creds = [req.id,req.token];
  // why is res.cookie a function???
  // console.log('REQ COOKIE from get route: ', res.cookie);
  // console.log(creds);
  // res.send(req.id);
  res.send(req.token);

});

// authRouter.put('/api/update', auth, (req,res,next) => {
authRouter.put('/api/update/:id', auth, (req,res,next) => {

  // console.log(req.params.id);
  // console.log(req.body);
  // console.log(Object.keys(req.body).length);

  if(Object.keys(req.body).length === 0 || Object.keys(req.body)[0] !== 'dog') {
    // console.log('INSIDE no object keys');
    // res.statusCode = 400;
    // res.statusMessage = 'Invalid Body';
    // res.send('Invalid Body');
    next(400);
  }
  // if(req.params.id) {
  if(req.params.id) {

    // console.log('INSIDE before update PUT', req.id);

    DogModel.findOneAndUpdate(req.params.id, req.body, {new : true})
    // this then and catch ONLY apply to the action DogModel.find...
      .then(dog => {
        res.send(dog);
      })
      .catch(err => {
        console.log('ERROR: ',err);
        next(err);
      });
  }
});

// router.put('/:id', (req, res, next) => {
//   Band.findByIdAndUpdate(req.params.id, req.body, {new : true})
//     .then(band => res.send(band))
//     .catch(next);
// });

//pass the id of a resource though the url endpoint (using req.params) to delete a resource
authRouter.delete('/api/delete/:id', auth, (req,res,next) => {
  console.log('ID:', req.params.id);

  // its not user._id so what is the way to target this
  // DogModel.findByIdAndRemove(req.params.id)
  if(req.params.id) {
    DogModel.remove({_id:req.params.id})
      .then(results => {
        console.log(results);
        res.send(results);
      })
      .catch(next);
  }
});


// router.delete('/:id', auth, (req, res, next) => {
//   Band.findByIdAndRemove(req.params.id)
//     .then(results => res.send(results))
//     .catch(next);
// });


export default authRouter;