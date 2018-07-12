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
  // userId: {type: String},
  // userId: {type: Schema.Types.ObjectId},
  // userId has to go here??? but assigned in the PRE / best practice?
  // type String? doesnt work with type: Number
});

dogSchema.pre('save', function(next) {
  // this.userId = this._id;

  bcrypt.hash(this.password,10)
    .then( hashedPassword => {
      // console.log('hashedPassword: ', hashedPassword);
      this.password = hashedPassword;
      // console.log('Password hashed and on to next()');
      next();
    })
    .catch( error => error );
  // console.log('PRE SAVE ERROR', error.status);

});

dogSchema.statics.authenticate = function(auth) {
  console.log('dogModel Authenticate', auth.username);
  let query = {username:auth.username};
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    //comparePassword is below
    .catch( error => error );
  //maybe need error passed in
  // console.log('Authenticate ERROR', error.status);
};

dogSchema.statics.authorize = function(token) {
  console.log('GETTING to Authorize dog-model.js: ', token);

  //put this verify in an if?
  // this isnt async because thers no callback = docs on npm
  let parsedToken = jwt.verify(token, process.env.APP_SECRET || 'changeit');
  console.log('parsedToken after jwt.verify: ', parsedToken);
  // console.log(parsedToken);
  // let query = {_id:parsedToken.id};

  // return this.findOne(query)
  return this.findOne({_id:parsedToken.id})
    .then(user => {
      // console.log('Authorize user: ', user);
      return user;
    })
    // .catch( error => error );
    .catch( error => {
      console.log('Authorize Error',error);
      throw error;
    } );

  //maybe need error passed in
  // console.log('Authorize ERROR');
};

dogSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
    .then( valid => valid ? this : null);
};

dogSchema.methods.generateToken = function() {
  return jwt.sign( {id:this._id}, process.env.APP_SECRET || 'changeit');
};

export default mongoose.model('dogs', dogSchema);