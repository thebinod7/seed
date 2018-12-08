const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

const test = new Schema({
  id : ObjectId,
  title : String,
  description : String,
  createdAt : { type : Date, default : Date.now }
});

module.exports = mongoose.model('Test', test);
