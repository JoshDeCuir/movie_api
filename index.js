const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      uuid = require('uuid');

app.use(bodyParser.json());

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

//Create
app.post('/users', (req, res) =>{
  const newUser = req.body;
  if(newUser.name){
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('users need names');
  }
})

//Update
app.put('/users/:id', (req, res) =>{
  const { id } = req.params;
  const updatedUser = req.body;
  var user = users.find(user => user.id == id);

  if (user){
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('No such user');
  }
})

//Create
app.post('/users/:id/:movieTitle', (req, res) =>{
  const { id, movieTitle } = req.params;
  
  var user = users.find(user => user.id == id);

  if (user){
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('No such user');
  }
})

//Delete
app.delete('/users/:id/:movieTitle', (req, res) =>{
  const { id, movieTitle } = req.params;
  
  var user = users.find(user => user.id == id);

  if (user){
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('No such user');
  }
})

//Delete
app.delete('/users/:id', (req, res) =>{
  const { id } = req.params;
  
  var user = users.find(user => user.id == id);

  if (user){
    users = users.filter(user => user.id != id);
    res.status(200).send(`User ${id} has been deleted`);
  } else {
    res.status(400).send('No such user');
  }
})

//Read
app.get('/movies', (req , res) =>{
    res.status(200).json(movies);
})

//Read
app.get('/movies/:title', (req , res) =>{
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if(movie){
    res.status(200).json(movie);
  } else {
    res.status(400).send('No such movie');
  }
})

//Read
app.get('/movies/genre/:genreName', (req , res) =>{
  const { genreName } = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

  if(genre){
    res.status(200).json(genre);
  } else {
    res.status(400).send('No such genre');
  }
})

//Read
app.get('/movies/director/:directorName', (req , res) =>{
  const { directorName } = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName).Director;

  if(director){
    res.status(200).json(director);
  } else {
    res.status(400).send('No such director');
  }
})

// Start the server
app.listen(8080, () => console.log("Listening on 8080"));
