const express = require('express');
const app = express();
//Import the mongoose module
const mongoose = require('mongoose');
// Import the body parser
const bodyParser = require('body-parser');
//Set up default mongoose connection
const mongoDB = 'mongodb://127.0.0.1/users';
//cors
const cors = require('cors');
const bcrypt = require('bcrypt');
mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
const db = mongoose.connection;

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: String,
    body: String,
    imagePath: String
});

const usersSchema = new Schema({
    username: String,
    password: String
});
const PostModel = mongoose.model('PostModel', postSchema);
const UserModel = mongoose.model('UserModel', usersSchema);
// using additional libraries
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
//


// weather app 
app.get('/weather', generateFakeWeatherData);



function randomWeather(){
    let weather = ["cloudy", "sunny", "rainy", "snowy"]
    return weather[Math.floor(Math.random(0) * 4)]
  }

  function getRandomMinTemp(weatherType){
    if (weatherType === "cloudy"){
        minTemp = Math.floor(Math.random() * 12) + 1  
        return minTemp;
    } else if (weatherType === "sunny"){
        minTemp = Math.floor(Math.random() * 20) + 10
        return minTemp;
    } else if (weatherType === "rainy") {
        minTemp = Math.floor(Math.random() * 6) + 1
        return minTemp;
    } else if (weatherType === "snowy") {
        minTemp = Math.floor(Math.random() * 3) -10
        return minTemp;
    }
}


function getRandomMaxTemp(weatherType){
if (weatherType === "cloudy"){
    maxTemp = Math.floor(Math.random() * 12) + getRandomMinTemp("cloudy") 
    return maxTemp;
} else if (weatherType === "sunny"){
    maxTemp = Math.floor(Math.random() * 20) + getRandomMinTemp("sunny")
    return maxTemp;
} else if (weatherType === "rainy") {
    maxTemp = Math.floor(Math.random() * 6) + getRandomMinTemp("rainy")
    return maxTemp;
} else if (weatherType === "snowy") {
    maxTemp = Math.floor(Math.random() * 3) + getRandomMinTemp("snowy")
    return maxTemp;
}
}

     

    

function DaysWeatherGenerator(){
    let d1 = randomWeather()
    let d2 = randomWeather()
    let d3 = randomWeather()
    let d4 = randomWeather()
    let d5 = randomWeather()
         let arrayOfObjects = [
              {
                weather: d1,
                minTemp: getRandomMinTemp(d1),
                maxTemp: getRandomMaxTemp(d1)
              },{
                weather: d2,
                minTemp: getRandomMinTemp(d2),
                maxTemp: getRandomMaxTemp(d2)
             },{
                weather: d3,
                minTemp: getRandomMinTemp(d3),
                maxTemp: getRandomMaxTemp(d3)
             },{
                weather: d4,
                minTemp: getRandomMinTemp(d4),
                maxTemp: getRandomMaxTemp(d4)
             },{
                weather: d5,
                minTemp: getRandomMinTemp(d5),
                maxTemp: getRandomMaxTemp(d5)
             }
            
            ]
         return arrayOfObjects
    }
 
function generateFakeWeatherData(req, res){
    
    let daysWeather = new DaysWeatherGenerator( );

    return  res.json(daysWeather);
}




//

//post request
app.post('/makeApost', createPost);

function createPost(req, res) {
    let post = req.body;
    console.log(post);
    PostModel.create(post).then(
        function(postObj) {
            console.log(postObj);
            res.sendStatus(200);
        },
        function(err) {
            res.sendStatus(400);
        }
    );
}

//

//Get all posts
app.get('/getAllPosts', getAllPosts);

function getAllPosts(req, res) {
    PostModel.find({}).then(
        posts => {
            res.json(posts);
        },
        err => {
            res.sendStatus(400);
        }
    );
}
//Edit a post

app.put('/editApost', editApost);

function editApost(req, res) {
    const { _id: id, ...post } = req.body;
    PostModel.findByIdAndUpdate(id, { $set: post }).then(
        updatedPost => {
            res.json(updatedPost);
        },
        error => {
            res.sendStatus(400);
        }
    );
}
// Delete a post
app.delete('/post/:id', deleteApost);

function deleteApost(req, res) {
    PostModel.findByIdAndDelete(req.params.id).then(
        () => {
            res.sendStatus(200);
        },
        error => {
            res.sendStatus(400);
        }
    );
}

//creat account

app.post('/createAccount', createAccount);

function createAccount(req, res) {
    UserModel.count({ username: req.body.username })
        .then(count => {
            if (count) return Promise.reject('user already exists');
        })
        .then(() => bcrypt.hash(req.body.password, 10))
        .then(password =>
            UserModel.create({ username: req.body.username, password })
        )
        .then(userObj => {
            console.log(userObj);
            res.sendStatus(200);
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ error: err });
        });
}

app.post('/login', loginAccount);

function loginAccount(req, res) {
    UserModel.findOne({ username: req.body.username })
        .then(user => {
            if (!user) return Promise.reject('No such user found');
            return bcrypt
                .compare(req.body.password, user.password)
                .then(
                    result =>
                        result
                            ? user
                            : Promise.reject('The passwords did not match!')
                );
        })
        .then(user => res.json(user))
        .catch(err => {
            console.error(err);
            res.status(400).json({ error: err });
        });
}

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.listen(8000, () => console.log('Example app listening on port 8000!'));
