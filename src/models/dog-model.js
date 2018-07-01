// import mongoose from 'mongoose';
import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jwt';

// const dogSchema = new mongoose.Schema({
const dogSchema = new Schema({
  username:{type: String, required:true, unique: true},
  password: {type: String, required: true},
  //userId has to go here???
});

dogSchema.pre('save', function(next) {
  bcrypt.hash(this.password,10)
    .then( hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch( error => {
      console.log('PRE SAVE ERROR', error.status);
    });
});

dogSchema.statics.authenticate = function(auth) {
//   console.log('dogModel Authenticate', auth.username);
  let query = {username : auth.username};
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    //comparePassword is below
    .catch( error => {
      console.log('Authenticate ERROR', error.status);
    });
};

dogSchema.statics.authorize = function(token) {
  let parsedToken = jwt.verify(token, process.env.APP_SECRET || 'changeit');
  let query = {_id:parsedToken.id};
  return this.findOne(query)
    .then(user => {
      console.log('Authorize user: ', user);
      return user;
    })
    .catch( () => {
      //maybe need error passed in
      console.log('Authorize ERROR');
    });
};

dogSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
    .then( valid => {
      console.log('compare password valid: ', valid);
      valid ? this : null;
    });
};

dogSchema.methods.generateToken = function() {
  return jwt.sign( {id:this._id}, process.env.APP_SECRET || 'changeit');
};

export default mongoose.model('dogs', dogSchema);