import mongoose from 'mongoose';
// import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/*
this resource must have a property of userID that references the _id of the user that created the resource

the userID property can only be set from an _id found using your bearer auth middleware module
*/

const dogSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  dog: {type: String},
  userId: {type: String},
  // userId has to go here???
  // type String? doestn work with type number
});

dogSchema.pre('save', function(next) {
  // console.log('dogModel PRE SAVE');
  this.userId = this._id;

  bcrypt.hash(this.password,10)
    .then( hashedPassword => {
      this.password = hashedPassword;
      // console.log('Password hashed and on to next()');
      next();
    })
    .catch( error => error );
  // console.log('PRE SAVE ERROR', error.status);

});

dogSchema.statics.authenticate = function(auth) {
  // console.log('dogModel Authenticate', auth.username);
  let query = {username:auth.username};
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    //comparePassword is below
    .catch( error => {return error;} );
  //maybe need error passed in
  // console.log('Authenticate ERROR', error.status);
};

dogSchema.statics.authorize = function(token) {
  let parsedToken = jwt.verify(token, process.env.APP_SECRET || 'changeit');
  // console.log('Authorize user parsed token: ', parsedToken);

  let query = {_id:parsedToken.id};
  return this.findOne(query)
    .then(user => {
      // console.log('Authorize user: ', user);
      return user;
    })
    .catch( error => error );
  //maybe need error passed in
  // console.log('Authorize ERROR');
};

dogSchema.methods.update = function(userId, payload) {
  // console.log('Update user userId: ', userId);
  // console.log('Update user payload: ', payload);


  // let query = {userId:payload.id};
  // let query = {_id:payload.id};
  let query = {_id:userId};
  return this.findByIdAndUpdate(query, payload)
    .then(user => {
      return user;
    })
    .catch( error => error );
};

dogSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
    .then( valid => valid ? this : null);
};

dogSchema.methods.generateToken = function() {
  return jwt.sign( {id:this._id}, process.env.APP_SECRET || 'changeit');
};

export default mongoose.model('dogs', dogSchema);