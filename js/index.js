function setup() {
  var canvasHolder = document.getElementById("canvas-holder");
  var width = canvasHolder.offsetWidth;
  var height = canvasHolder.offsetHeight;
  var canvas = createCanvas(width, height);

  canvas.parent("canvas-holder");

  noStroke();
}

function draw() {
  background(51, 51, 51);
  if (mouseIsPressed) {
    fill(0);
  } else {
    fill(255);
  }
  ellipse(mouseX, mouseY, 80, 80);
}

function windowResized() {
  var canvasHolder = document.getElementById("canvas-holder");
  var width = canvasHolder.offsetWidth;
  var height = canvasHolder.offsetHeight;
  resizeCanvas(width, height);
}




var commandInput = $("#command-input");
var historyList = $("ul.history-list");
var drone = new Drone();

$(commandInput).on("keypress", (e)=>{
  // 13 is key code for enter
  if(e.which == 13){
    var enteredCommand = $(e.currentTarget).val();
    if(commandValid(enteredCommand)){
      handleCommand(enteredCommand);
    }
    $(commandInput).val('');
  }
});

function commandValid(command){
  if(command == ''){
    addItemToHistory('sys', 'Please enter a command', 'feedback-danger')
    return false;
  }
  return true;
}

function handleCommand(command){
  // Output command to history
  addItemToHistory('usr', command, 'neutral');
}

function addItemToHistory(prefix, message, statusClass){
  var itemText = "&lt;"+prefix+"&gt; "+message;
  $(historyList).append('<li class="history-item '+ statusClass +'">'+itemText+'</li>');
  $(historyList).scrollTop(function() { return this.scrollHeight; });
}