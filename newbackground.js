const MongoClient = require('mongodb').MongoClient;
const image = (process.argv[2]);
const fs = require('fs');
let url = "mongodb://localhost:27017/";

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return (bitmap).toString('base64');
}

MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
  var dbo = db.db("DB_game");
  dbo.createCollection("Tbl_screen", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
  dbo.createCollection("Tbl_background", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });

});

var base64str = base64_encode(image);

MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("DB_game");
    var myobj = { image: base64_encode(image) };
    dbo.collection("Tbl_background").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
});

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));
