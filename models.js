const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

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
  username: { type: String, required: true},
  password: { type: String, required: true},
  email: { type: String, required: true},
  birthday: {Date},
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
}

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}

// Create models based on the schemas
const movies = mongoose.model('Movie', movieSchema);
const users = mongoose.model('User', userSchema);

// Export the models
module.exports = {
  movies,
  users,
};
