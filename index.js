const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      uuid = require('uuid');

const mongoose = require('mongoose');
const { movies, users } = require('./models');

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/movie_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check the connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
/*
var users = [
  {
    id: 1,
    name: "Sarah",
    favoriteMovies: []
  },
  {
    id: 2,
    name: "Josh",
    favoriteMovies: ["13 Hours: The Secret Soldiers of Benghazi"]
  },
]
var movies =[
  {
    "Title":"13 Hours: The Secret Soldiers of Benghazi",
    "Description": "The film follows six members of the Annex Security Team who fought to defend the American diplomatic compound in Benghazi, Libya after waves of attacks by militants on September 11, 2012.",
    "Genre":{
      "Name":"Action",
      "Description":"Action film is a film genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats."
    },
    "Director":{
      "Name": "Michael Bay",
      "Bio": "Michael Benjamin Bay is an American film director and producer. He is best known for making big-budget, high-concept action films characterized by fast cutting, stylistic cinematography and visuals, and extensive use of special effects, including frequent depictions of explosions.",
      "Birth": 1965
    },
    "ImageURL":"https://deadline.com/2023/05/michael-bay-true-crime-docuseries-investigation-discovery-1235369521/",
    "Featured": false
  },
  {
    "Title":"The Other Guys",
    "Description": "Two mismatched New York City detectives seize an opportunity to step up like the city's top cops, whom they idolize, only things don't quite go as planned.",
    "Genre":{
      "Name":"Action",
      "Description":"Action film is a film genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats."
    },
    "Director":{
      "Name": "Adam McKay",
      "Bio": "Adam McKay (born April 17, 1968) is an American screenwriter, director, comedian, and actor. McKay has a comedy partnership with Will Ferrell, with whom he co-wrote the films Anchorman, Talladega Nights, and The Other Guys. Ferrell and McKay also founded their comedy website Funny or Die through their production company Gary Sanchez Productions. He has been married to Shira Piven since 1999. They have two children.",
      "Birth": 1968
    },
    "ImageURL":"https://www.imdb.com/name/nm0570912/?ref_=tt_ov_dr",
    "Featured": false
  }
]
*/
//Create - post new user
app.post('/users', async (req, res) =>{
  // Validate input
  const input = req.body;
  if(!validateUserInfo(input, res))
  {
    return;
  }

  // Create new users object
  var newUser = new users();
  newUser.id = uuid.v4();
  newUser.username = input.username;
  newUser.password = input.password;
  newUser.email = input.email;

  // Write to the database
  await newUser.save();
  res.status(201).json(newUser);
})

//Update
app.put('/users/:id', async (req, res) =>{
  // Input validation
  const updatedUserInfo = req.body;
  if(!validateUserInfo(updatedUserInfo, res))
  {
    return;
  }

  // Update information of user
  const { id } = req.params;
  await users.updateOne({'_id': id},
    {
      $set:{
        username: updatedUserInfo.username,
        password: updatedUserInfo.password,
        email: updatedUserInfo.email
      }
    }
  );

  // Return updated user data
  var user = (await users.find({'_id': id}))[0];
  res.status(200).json(user);
})

//Update - Add a new movie to a selected user's favorite's list
app.post('/users/:userId/addFavoriteMovie/:movieId', async (req, res) =>{
  const { userId, movieId } = req.params;

  try{
    const user = (await users.find({'_id': userId}))[0];
    if (user){
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
  } catch (err){
    console.error(err);
    res.status(500).send('Error:' + err);
  }
});

//Update - remove movieId from selected user's favorites list
app.post('/users/:userId/removeFavoriteMovie/:movieId', async (req, res) => {
  const { userId, movieId } = req.params;
  
  try {
    const user = (await users.find({'_id': userId}))[0];
    if (user) {
      const favoriteMovies = user.favoriteMovies.filter(function (id) {
        return id != movieId;
      });
      await users.updateOne({'_id': userId}, {
        $set:{
          favoriteMovies: favoriteMovies
        }
      });

      res.status(200).send(`${movieId} has been removed from user ${userId}'s array`);
    }
    else {
      res.status(400).send('No such user');
    }
  }
  catch(err) {
    res.status(500).send('Error:' + err);
  }
});

//Delete - remove user from database
app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try{
    const deletedUser = await users.findOneAndDelete({ '_id': id });
      if (!deletedUser) {
        res.status(400).send(id + " was not found");
      } else {
        res.status(200).send(id + " was deleted.");
      }  
    }catch(err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
});


//Read - get all movies
app.get('/movies', async (req, res) =>{
  const result = await movies.find();
  res.status(200).json(result);
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
app.listen(8080, () => console.log("Listening on 8080"));


function validateUserInfo(userInfo, res){
  if(!userInfo.username){
    res.status(400).send('request missing username');
    return false;
  }
  if(!userInfo.password){
    res.status(400).send('request missing password');
    return false;
  }
  if(!userInfo.email){
    res.status(400).send('request missing email');
    return false;
  }

  return true;
}