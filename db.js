let mongoose = require('mongoose');
let db = mongoose.connect('mongodb://127.0.0.1:27017/characters') // DATABASE CONNECTION


// SCHEMA CREATION
const characterSchema = new mongoose.Schema({
  name: {type:String, required:true},
  city: {type:String, required:true},
  age:{type:Number, default:0},
  profession:{type:String, required:true},
  fileName: {
    type: String,
    required:[true, "Uploaded file must have a name"]
  },
  createdAt:{type:Date, default:Date.now}
})


// ATTACH SCHEMA TO A MODEL
const character = mongoose.model("character", characterSchema)


module.exports = character
