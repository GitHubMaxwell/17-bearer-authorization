import mongoose from 'mongoose';

const dogsSchema = new mongoose.Schema({
  color: {type: String},
  dog: {type: String},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  // userId: {type: mongoose.Types.ObjectId, ref: 'user'},

});
//how to dynamically add userId to the dog model

// lab mission: user signs in
// anytime use makes new dog, that instance of dog is tied to the SPECIFC user signed in
// one way relationship between the dog(s) and a user BUT not the other way around

export default mongoose.model('dogs', dogsSchema);


// db.dogs.remove({}) versus the .drop cleans out the Schema / see the difference in the docs -> mongoose
//DROP is the BETTER choice
//i renamed everything and shouldve dropped the db completed to clean it