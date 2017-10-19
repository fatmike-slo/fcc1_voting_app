const mongoose = require('mongoose');
mongoose.connect("mongodb://fatmike:A10Warthog@ds161471.mlab.com:61471/fatmongodb", { useMongoClient: true });
mongoose.Promise = global.Promise;

let Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

// user db
let userSchema = new Schema({
    // username: String,
    // email: String,
    username: {type: String, unique: true},
    email: {type: String, unique: true},
    password: String,
    date: String
});

// polls db
let pollSchema = new Schema({
    userId: String,
    title: String,
    polls: [Schema.Types.Mixed],
    date: String
});


let Users = mongoose.model('users', userSchema);
let Polls = mongoose.model('polls', pollSchema);


let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=> {
    console.log('connected');
});


module.exports = { Users, Polls, pollSchema }

