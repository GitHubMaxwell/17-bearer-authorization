import Router from 'express';
const router = Router();

import Dog from '../models/dog-model.js';
// import User from '../models/user-model.js';

import auth from '../middleware/auth.js';
import noBody from '../middleware/badReq.js';
import noId from '../middleware/404.js';
import sendJSON from '../middleware/sendJSON.js';
// import badReq from '../middleware/badReq.js';

router.get('/api/v1/dogs/:id', auth, (req,res,next) => {
  if(!req.params.id) {
    noId(res);
  }
  Dog.findOne({userId:req.params.id})
    .then( data => sendJSON(res,data))
    .catch( next );
});
  
// getALL not part of the assignment
router.get('/api/v1/alldogs', auth, (req, res, next) => {
  //find all per the req.id?
  Dog.find({userId: `${req.id}`})
    .populate('dogs')
    .exec()//this quits the mongoose async / populate is async
    .then( data => {
      res.send(data);
    })
    .catch( next);
});

router.put('/api/v1/dogs/:id', auth, (req,res,next) => {
  console.log('put route');

  if(!Object.keys(req.body).length) {
    noBody(res);
  }

  if(req.id) {

    if(req.params.id) {
    // let updateTarget = { userId: `${req.params.id}` };
    //this is the dogs id and what you want is is the users id that is found byt the req.id
      let updateTarget = { userId: `${req.id}` };

      let updateContent = req.body;
      console.log('Dog route');

      //cast error when i send a simply wrong path so i have to send a correctly formatted ObjectId thats wrong in order to have it get to the correct error
      Dog.findById(req.params.id)
      //pass you the whole dog
        .then( dog => {
        // sendJSON(res,data);
        // have to stringify them
          console.log('Dog inside findById: ',dog);

          
          console.log('Dog = null: ',dog);
          //   next(404);
          
          if(dog !== null) {
            console.log('Dog = null: ',dog);

            if(JSON.stringify(dog.userId) === JSON.stringify(req.id)) {
              Dog.findOneAndUpdate(updateTarget, updateContent, {new:true})
                .then( data => {
                  sendJSON(res,data);
                })
              //   .catch(next);
                .catch(next(404));
            } else {
              console.log('401 error');
              next(401);
            }
          } else {
            ////////////
            console.log('dog = null else: error 404');
            next(404);
            ////////////
          }
        })
        // if you dont find one you should send 404
        // .catch( next );
        .catch(next(404));
    } else {
      noId(res);
    }
  } else {
    //////////// no req.id
    console.log('404 error');
    next(404);
    ////////////
  }
});


router.delete('/api/v1/dogs/:id', auth, (req,res,next) => {

  if(req.id) {

    if(req.params.id) {

      Dog.findById(req.params.id)
        .then(dog => {
          if(JSON.stringify(dog.userId) === JSON.stringify(req.id)) {
            // Dog.findByOneAndDelete({userId: `${req.id}`})
            Dog.findOneAndDelete({_id: `${req.params.id}`})

            //findOneDelete
              .then( data => sendJSON(res,data))
              .catch( next );
          } else {
            next(401);
          }
        })
        .catch( next );
    } else {
      noId(res);
    }
  }
});

router.post('/api/v1/dogs',auth, (req,res) => {
  console.log('router.post');

  if(Object.keys(req.body).length){
    if(req.id) {
      let dog = new Dog(req.body);
      // console.log('REQ.ID: ',req.id);
      dog.userId = req.id;
      //want to set before you save becasue otherwise it wouldnt save this to the user db below in dog.save
      dog.save()
        .then( dog => {
        // console.log('DOG from POST route:', dog);
          return res.send(dog);
        })
        .catch( err => {
          console.log('POST ROUTE error',err);
          //what error code goes here
        });
    } else {
      next(401);
    }
  } else {
    // console.log('POST ROUTE no body');
    noBody(res);// 400 for no body
  }
});

export default router;