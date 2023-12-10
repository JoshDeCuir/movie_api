const express = require('express');
const morgan = require('morgan');

const app = express();
const port = 8080;

// Middleware to log all requests
app.use(morgan('combined'));

// Express GET route for "/movies"
app.get('/movies', (req, res) => {
  
  const topMovies = [
    { title: 'Movie 1', rating: 9 },
    { title: 'Movie 2', rating: 8 },
    // Add more movies as needed
  ];

  res.json(topMovies);
});

// Express GET route for "/"
app.get('/', (req, res) => {
  res.send('Hello, this is the default response!');
});

// Middleware to log application-level errors to the terminal
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Serving static files (documentation.html) from the public folder
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
