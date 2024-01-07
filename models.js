const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Movies schema
const movieSchema = new Schema({
  title: { type: String, required: true },
  genre: { 
    name: String,
    description: String
  },
  director: { name: String
  }
  
});

// Define the Users schema
const userSchema = new Schema({
  username: { type: String},
  password: { type: String},
  email: { type: String},
  birthday: {Date},
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

// Create models based on the schemas
const movies = mongoose.model('Movie', movieSchema);
const users = mongoose.model('User', userSchema);

// Export the models
module.exports = {
  movies,
  users,
};
