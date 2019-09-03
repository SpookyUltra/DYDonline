// server.js
// load stuff
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dateFormat = require('dateformat');


let db = new sqlite3.Database('./db/quotes.db');
let database = new sqlite3.Database('./db/game.db');


// set the view engine to ejs
app.set('view engine', 'ejs');

//static dirs
app.use("/styles",express.static(__dirname + "/styles"));
app.use("/images",express.static(__dirname + "/images"));
app.use("/scripts",express.static(__dirname + "/scripts"));
app.use("/views",express.static(__dirname + "/views"));
app.use("/socket.io",express.static(__dirname + "/socket.io"));


// use res.render to load up an ejs view file



app.get('/', function(req, res) {
    database.all("SELECT image FROM Tbl_background WHERE background_ID = 1", function(err,rows){
        var image = ""
        rows.forEach(function (row) {
          image = row.image

        });
        // console.log(scores)
        res.render('pages/ottoTest',{
            "image": image
        });
    });
});




var clients = 0;
var roomno = 1;
//whenever someone connects this gets executed
io.on('connection', function(socket) {

    clients ++
    io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
    console.log(socket.id + ' connected');

    //increase roomno if 2 clients are in a room.
    if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1) roomno++;
    socket.join("room-"+roomno);

    var currentRoom = io.sockets.adapter.rooms['room-'+roomno];

    //send this event to everyone in the room.
    io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);
    io.sockets.in("room-"+roomno).emit('roomLength', currentRoom.length);

    if(currentRoom.length == 2){
        db.all("SELECT * FROM quotes WHERE id IN (SELECT id FROM quotes ORDER BY RANDOM() LIMIT 1)", function(err,rows){
            var quote = ""
            var author = ""
            rows.forEach(function (row) {
              console.log('row: ' + row.quote);
              quote = row.quote
              author = row.author
            });
            io.sockets.in("room-"+roomno).emit('quote', quote);
            io.sockets.in("room-"+roomno).emit('author', author);
        });
    }

    //whenever a clientEvent is sent, this is run
    socket.on('clientEvent', function(data) {
        var senderRoom = Object.keys(socket.rooms).filter(item => item!=socket.id)
        console.log(data + " " + senderRoom);
        //send a signal to the opponent to update the track
        socket.broadcast.to(senderRoom).emit("updateTrack", data);
    });

    //when a user finishes a multiplayer race
    socket.on('clientFinished', function(data) {
        var senderRoom = Object.keys(socket.rooms).filter(item => item!=socket.id)
        console.log(data + " " + senderRoom);
        //tell the opponent that they are finished
        socket.broadcast.to(senderRoom).emit("opponentFinished", data);
    });

    //create a new score in the database
    socket.on('newScore', function (name, wpm) {
        console.log(name + " "+wpm)
        db.run("INSERT INTO SCOREBOARD(name, wpm, date) VALUES('"+name.toUpperCase()+"', "+wpm+", "+Date.now()+")", function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      });
    });

    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
        clients --
        io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
        console.log(socket.id + ' disconnected');
    });




    socket.on('ottoTestChanged', function(data) {
        console.log("hi")
        database.all("SELECT image FROM Tbl_background WHERE background_ID = 2", function(err,rows){
            var image = ""
            rows.forEach(function (row) {
              image = row.image
            });
            // console.log(scores)
            io.sockets.emit('changeImage',image);

        });
    });


});
var port = 80
http.listen(port, function() {
   console.log('listening on *:'+port);
});
