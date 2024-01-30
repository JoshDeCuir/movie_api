const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      uuid = require('uuid');

const mongoose = require('mongoose');
const { movies, users } = require('./models');
const {check, validationResult} = require('express-validator');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const cors = require('cors');
app.use(cors());

var auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// Connect to MongoDB
mongoose.connect('mongodb+srv://movieapiDB:JoshD@cluster0.e7vigcb.mongodb.net/movie_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check the connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

//Create - post new user
app.post('/users',
[
check('username', 'Username is required').isLength({min: 5}),
check('username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(), 
check('password', 'Password is required').not().isEmpty(),
check('email', 'Email does not appear to be valid').isEmail()
],async (req, res) =>{
  // Validate input
  const input = req.body;
  var errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({errors: errors.array() });
  }
  
  var hashPassword = users.hashPassword(req.body.password);
  await users.findOne({username: req.body.username})
    .then(async (user) => {
      if(user) {
        return res.status(400).send(req.body.username + ' already exists');
      }
      else {
          // Create new users object
          var newUser = new users();
          newUser.id = uuid.v4();
          newUser.username = input.username;
          newUser.password = hashPassword;
          newUser.email = input.email;
          newUser.birthday = input.birthday;
          newUser.favoriteMovies = input.favoriteMovies;
        
          // Write to the database
          await newUser.save();
          res.status(201).json(newUser);
      }
    });
})

app.put('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(req.user.username !== req.params.username){
      return res.status(400).send('Permission denied');
  }

  await users.findOneAndUpdate({ username: req.params.username }, {
      $set:
      {
          username: req.body.username,
          password: req.body.password,
          birthday: req.body.birthday
      }
  }, { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send('Error: ' + err);
    })
});

//Update - Add a new movie to a selected user's favorite's list
app.post('/users/:userId/addFavoriteMovie/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { userId, movieId } = req.params;

  await users.findOne({'_id': userId})
    .then(async (user) => {
      if (user){
        if (req.user.username != user.username){
          return res.status(400).send('Permission denied');
        }
  
        const favoriteMovies = user.favoriteMovies;
        favoriteMovies.push(movieId);
        
        await users.updateOne({'_id': userId}, {
          $set:{
            favoriteMovies: favoriteMovies
          }
        });
        res.status(200).send(`${movieId} has been added to user ${userId}'s array`);
      } else {
        res.status(400).send('No such user');
      }
    })
    .catch ((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

//Update - remove movieId from selected user's favorites list
app.post('/users/:userId/removeFavoriteMovie/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { userId, movieId } = req.params;

  await users.findOne({'_id': userId})
    .then(async (user) => {
      if (user){
        if (req.user.username != user.username){
          return res.status(400).send('Permission denied');
        }
  
        const favoriteMovies = user.favoriteMovies.filter(function (id) {
          return id != movieId;
        });
        
        await users.updateOne({'_id': userId}, {
          $set:{
            favoriteMovies: favoriteMovies
          }
        });
        res.status(200).send(`${movieId} has been removed from user ${userId}'s array`);
      } else {
        res.status(400).send('No such user');
      }
    })
    .catch ((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

//Get - get user from database
app.get("/users/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const id = req.params.id;

  await users.findOne({ '_id': id })
    .then(async(user) => {
      if (!user) {
        res.status(400).send("Permission denied");
      } else {
        res.status(200).send(user);
      }  

    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Delete - remove user from database
app.delete("/users/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const id = req.params.id;
  try{
    const deletedUser = await users.findOneAndDelete({ '_id': id });
      if (!deletedUser) {
        res.status(400).send("Permission denied");
      } else {
        res.status(200).send(id + " was deleted.");
      }  
    }catch(err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
});


//Read - get all movies
app.get('/movies', passport.authenticate('jwt',{session: false}), async (req, res) =>{
  await movies.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
})

//Read - get by movie title
app.get('/movies/:title', async (req, res) =>{
  const { title } = req.params;
  const movie = await movies.find({title: title});

  if(movie){
    res.status(200).json(movie);
  } else {
    res.status(400).send('No such movie');
  }
})

//Read - get all movies of a specific genre
app.get('/movies/genre/:genreName', async (req, res) =>{
  const { genreName } = req.params;
  const results = await movies.find({'genre.name': genreName});

  if(results){
    res.status(200).json(results);
  } else {
    res.status(400).send('No such genre');
  }
})

//Read - get all movies made by a specific director
app.get('/movies/director/:directorName', async (req, res) =>{
  const { directorName } = req.params;
  const results = await movies.find({'director.name': directorName});

  if(results){
    res.status(200).json(results);
  } else {
    res.status(400).send('No such director');
  }
})

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0' ,() => {
  console.log('Listening on Port' + port)
}); 