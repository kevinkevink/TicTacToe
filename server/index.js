const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { isObject } = require('util');
const app = express();
var xTaken = true;
var squares = [null, null, null, null, null, null, null, null, null];

app.use(bodyParser.json());
// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// API Endpoint to return squares
app.get('/api/getSquares', (req,res) => {
    res.json(squares);
    console.log('Sent squares');
    console.log(squares);
});

app.get('/api/getTeam', (req,res) => {
  xTaken = !xTaken;
  res.json(xTaken);
  console.log('Sent Team ' + xTaken);
});

//Modify Squares
//app.post('/api/modifySquares', (req,res) => {
//  squares = req.body.squares;
//  console.log('modified squares');
//  console.log(squares);
//  res.end("yes");
//});

// Handles any requests that don't match the ones above
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '../client/public/index.html'));
  });

const port = process.env.PORT;
const server = app.listen(port);

const io = require('socket.io')(server);
io.on('connection', (socket) => {
  console.log("Client connected!");
  socket.on("updateSquares", (msg) => {
      console.log(msg);
      squares = msg;
      socket.broadcast.emit("newSquares", squares);
      console.log("emitting newSquares");
  })
});

console.log('App is listening on port ' + port);