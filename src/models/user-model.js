// import {mongoose, Schema} from 'mongoose';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import badToken from '../middleware/badToken.js';


/*
this resource must have a property of userID that references the _id of the user that created the resource

the userID property can only be set from an _id found using your bearer auth middleware module
*/

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  // username: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
});

userSchema.pre('save', function(next) {
  // this.userId = this._id;

  bcrypt.hash(this.password,10)
    .then( hashedPassword => {
      // console.log('hashedPassword: ', hashedPassword);
      this.password = hashedPassword;
      // console.log('Password hashed and on to next()');
      next();
    })
    .catch( error => {
      // console.log('PRE SAVE ERROR', error.status);
      throw error; 
    });

    
});
/*

userSchema.statics.authenticate = function(userObj) {
  return this.findOne({username: userObj.username})
    .then(user => user && user.passwordCheck(userObj.password))
    .catch(err => { throw err; });
};

*/

userSchema.statics.authenticate = function(auth) {
  console.log('userModel Authenticate', auth.username);
  let query = {username:auth.username};

  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))

    //comparePassword is below
    .catch( error => {
      // console.log('authenticate CATCH');
      throw error; 
    });
  //maybe need error passed in
  // console.log('Authenticate ERROR', error.status);
};


userSchema.statics.authorize = function(token) {
  console.log('authorize user-model.js');

  let user = jwt.verify(token, process.env.APP_SECRET || 'change');
  //if it fails in the verify it goes back to the auth.js
  
  return this.findOne({_id: user.id})
    .then(user => {
      console.log('authorize findOne SUCCESS');
      return user; 
    })
    .catch(err => {
      console.log('authorize findOne FAIL');
      throw err; } );
};

// userSchema.statics.authorize = function(token) {
//   console.log('GETTING to Authorize user-model.js: ', token);

//   //put this verify in an if?
//   // this isnt async because thers no callback = docs on npm
//   // let parsedToken = jwt.verify(token, process.env.APP_SECRET || 'changeit', 
//   jwt.verify(token, process.env.APP_SECRET || 'changeit', 
//     function(err, parsedToken) {
//       if(err) {
//         console.log('verify error',err);
//         badToken(err);
//       } else {
//         console.log('parsedToken',parsedToken);

//         return this.findOne({_id:parsedToken.id})
//           .then(user => {
//             console.log('Authorize user: ', user);
//             return user;
//           })
//         // .catch( error => error );
//           .catch( error => {
//             // console.log('Authorize Error',error);
//             throw error;
//           } );
//       }

//     });

userSchema.methods.comparePassword = function (password) {
  // console.log('Compare PLAINTEXT password: ', password);
  // console.log('Compare HASHED password: ', this.password);

  //deleted the return / need that?
  return bcrypt.compare(password, this.password)
    // .then( valid => valid ? this : null);
    .then(response => {
      // console.log('COMPARE PW THEN response',response);
      return response ? this : null;
    });
  // .catch(err => {
  //   console.log('COMPARE PW error: ',err.status);
  // });
  // no catch handling here / it goes back to auth.js getAuth 401
};

userSchema.methods.generateToken = function() {
  return jwt.sign( {id:this._id}, process.env.APP_SECRET || 'changeit');
};

export default mongoose.model('user', userSchema);