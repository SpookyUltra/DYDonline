var socket = io();

//checks that the username has exactly 3 characters, then sends it and the score to the server to add to the database
function buttonClicked(){
    var userName = $("#nameInput").val();
    if(userName.length == 3){
        socket.emit('newScore', userName, wpm);
        document.location.href = "/";
    }else{
        alert("Please enter a 3 character name");
    }
}

//decodes html encoding in the quote (e.g. "&#33;" -> "!")
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

//starts the countdown and unhides the text input box
function startTimer(){
  var counter = 5;
  setInterval(function() {
    counter--;
    if (counter >= 0) {
      $("#count").text(counter);
    }
    if (counter === 0) {
      $("#count").text("Go!");
      startTime = Date.now();
      $("#textInput").css("visibility", "visible");
      $("#textInput").focus();
      clearInterval(counter);
    }
  }, 1000);
}

//replaces a character at a given index in a string
function setCharAt(str, index, chr){
    if(index<0){
        index=0;
    }
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}
