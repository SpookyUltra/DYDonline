//when a user connects to the room, update the display of people in the lobby
socket.on('connectToRoom',function(data) {
     $("#lobbyNo").text(data);
 });

//if a connection fails
socket.on('connect_failed', function() {
 alert("connection failed!");
})

//when there are 2 people in a lobby, start the game
socket.on('roomLength', function(data) {
    $("#peopleInLobby").text(data+"/2 people");
    if(data == 2){
        startTimer();
    }
})

//set the quote for online game
socket.on('quote', function(data) {
    quote = decodeHtml(data);
    quoteLength = quote.length;
    wordUnits = quoteLength / 5;
    $("#quoteDiv").text(quote);
})

//set the author
socket.on('author', function(data) {
    author = decodeHtml(data);
    $("#authorDiv").text("― " + author);
})

//update the opponent's track
socket.on('updateTrack', function(data) {
    theirTrack = setCharAt(track, Math.floor(data), "X");
    $("#theirCar").text(theirTrack);
})

//when the opponent is finished
socket.on('opponentFinished', function(data) {
    // show opponents score
    $("#theirScore").text("Your opponent finished in " + data + "seconds");
    $("#theirWpm").text("Opponent's WPM: " + wordUnits / data);
    //show whether user won or lost or drew
    if(wordUnits / data < wpm){
        $("#winOrLoss").text("You win!")
    }else if(wordUnits / data > wpm){
        $("#winOrLoss").text("You lose! :(")
    }else{
        $("#winOrLoss").text("A draw!")
    }

})
