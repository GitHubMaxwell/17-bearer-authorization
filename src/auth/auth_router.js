// can we do this syntax?
import Router from 'express';
const authRouter = Router();

// import express from 'express';
// const authRouter = express.Router();

import UserModel from '../models/user-model.js';
import auth from '../middleware/auth.js';
import noBody from '../middleware/badReq.js';

///////////////////////////////// start routes
//adding next in parameters and in catch
authRouter.post('/api/signup', (req,res) => {

  if(!Object.keys(req.body).length){
    noBody(res);
    //put this as a next
  }

  let user = new UserModel(req.body);
  // console.log('REQ.BODY: ',req.body);
  user.save()
    .then( user => {
      console.log('USER from POST route:', user);
      //this returns back NOT the user but the JWT (generateToken)
      return res.send(user.generateToken());
    })
    .catch( err => {
      console.log('POST ROUTE error',err);
      // next();
      // where is this catch going to
    });
  // .catch(next);
    
});
//point of signing in is only to get the token to carry around the site with
authRouter.get('/api/signin', auth, (req,res) => {
  console.log('REQ PARAMS ID: ', req.params.id);
  res.cookie('Token', req.token);
  res.send(req.token);
});

export default authRouter;


// authRouter.put('/api/update/:id', auth, (req,res,next) => {

//   if(Object.keys(req.body).length === 0 || Object.keys(req.body)[0] !== 'dog') {
//     // console.log('INSIDE no object keys');
//     // res.statusCode = 400;
//     // res.statusMessage = 'Invalid Body';
//     // res.send('Invalid Body');
//     next(400);
//   }
//   // if(req.params.id) {
//   if(req.params.id) {
//     UserModel.findOneAndUpdate(req.params.id, req.body, {new : true})
//     // this then and catch ONLY apply to the action DogModel.find...
//       .then(dog => {
//         res.send(dog);
//       })
//       .catch(err => {
//         console.log('ERROR: ',err);
//         next(err);
//       });
//   }
// });
// //pass the id of a resource though the url endpoint (using req.params) to delete a resource

// authRouter.delete('/api/delete/:id', auth, (req,res,next) => {
//   console.log('ID:', req.params.id);

//   // its not user._id so what is the way to target this
//   // DogModel.findByIdAndRemove(req.params.id)
//   if(req.params.id) {
//     UserModel.remove({_id:req.params.id})
//       .then(results => {
//         console.log(results);
//         res.send(results);
//       })
//       .catch(next);
//   }
// });

// authRouter.get('/api/signin/:id', auth, (req, res, next) => {

//   if (req.id) {
//     //auth.js authorize success assigns req.id the id of the user profile

//     UserModel.findById(req.params.id)
//       .then(response => {
//         if(response === null) {
//           next();
//         }
//         if (JSON.stringify(response.userID) === JSON.stringify(req.id)) {
//           res.send(response);
//         } else {
//           next(401);
//         }
//       })
//       .catch(() =>{
//         //if cant find by req.params.id
//         next();
//       });
//   } else {
//     //if no req.id
//     next(401);
//   }
// });