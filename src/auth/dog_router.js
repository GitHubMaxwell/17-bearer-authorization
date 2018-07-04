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
  // console.log('POST REQ', req);
  if(!Object.keys(req.body).length){
    noBody(res);
  }

  let user = new DogModel(req.body);
  user.save()
    .then( user => {
      // console.log('USER from POST route:', user);
      //this returns back NOT the user but the JWT (generateToken)
      return res.send(user.generateToken());
    })
    .catch( next );
});


authRouter.get('/api/signin', auth, (req,res) => {
  res.cookie('Token', req.token);
  // console.log('REQ TOKEN from get route: ', req.token);

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
// authRouter.put('/api/update/:id', auth, (req,res) => {
//   console.log('GET PAST auth in PUT', req.params.id);
//   console.log('GET PAST auth in PUT', req.body);

//   if(!req.params.id) {
//     res.statusCode = 404;
//     res.statusMessage = 'No ID Entered';
//     res.end();
//   }

//   DogModel.update(req.params.id, req.body)
//     .then((response) => {
//       console.log('Response',response.status);//?
//     })
//     .catch(next);
//   res.send('Updated USER');

//   //what does this get back from the operations? 
//   // let update = DogModel.update(req.body);
//   // console.log('PUT UPDATE: ', update);

//   res.send(res.status);
// });

authRouter.put('/api/update/:id', auth, (req,res) => {
  // console.log(req.params.id);
  // console.log(req.body);

  // if(!req.params.id) {
  //   res.statusCode = 404;
  //   res.statusMessage = 'No ID Entered';
  //   res.end();
  // }

  DogModel.findByIdAndUpdate(req.params.id, req.body, {new : true})
    .then(dog => {
      console.log('Response: ',dog);
      res.send(dog);
    })
    .catch(() => {
      console.log('wtf!');
    });

  //what does this get back from the operations? 
  // let update = DogModel.update(req.body);
  // console.log('PUT UPDATE: ', update);

  // res.send(res.status);
});

// router.put('/:id', (req, res, next) => {
//   Band.findByIdAndUpdate(req.params.id, req.body, {new : true})
//     .then(band => res.send(band))
//     .catch(next);
// });

//pass the id of a resource though the url endpoint (using req.params) to delete a resource
authRouter.delete('/api/delete/:id', auth, (req,res) => {
  console.log('ID:', req.params.id);

  // its not user._id so what is the way to target this
  DogModel.findByIdAndRemove(req.params.id)
    .then(results => {
      console.log(results);
      res.send(results);
    })
    .catch(next);
});

// router.delete('/:id', auth, (req, res, next) => {
//   Band.findByIdAndRemove(req.params.id)
//     .then(results => res.send(results))
//     .catch(next);
// });

authRouter.delete('/api/delete/', auth, (req,res) => {
  // if(!req.params) {
  //   console.log('DIDNT GIVE ID');
  //   // badReq();
  // }
  DogModel.deleteAll()
    .then(() => {
      console.log('After deleteOne executed and in then onto next');
      res.send('DELETE SUCCESS USER');
    })
    .catch(next);
});
///////////////////////////////// end routes

export default authRouter;