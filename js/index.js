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
var pastCommands = [];
var commandIndex = -1;
var maxX = 9;
var maxY = 9;

// command and methods
var commands = {
  "place": (x, y, f) => placeDrone(x, y, f),
  "left": () => left(),
  "right": () => right(),
  "attack": () => attack(),
  "report": () => report(),
  "-help": () => help(),
};

$(commandInput).on("keydown", (e) => {
  // 13 is key code for enter
  if (e.which == 13) {
    var enteredCommand = $(e.currentTarget).val();
    if (commandValid(enteredCommand)) {
      handleCommand(enteredCommand);
    }
    $(commandInput).val("");
    commandIndex = 0;
  }
});

$(commandInput).on("keydown", (e) => {
  if (e.which == 38) {
    // 38 is key code for up arrow
    if (pastCommands.length == 0) return;

    $(commandInput).val("");
    $(commandInput).focus();
    $(commandInput).val(pastCommands[commandIndex]);

    if (pastCommands.length > commandIndex + 1) {
      commandIndex++;
    }
  }
});


$(commandInput).on("keydown", (e) => {
  if (e.which == 40) {
    // 40 is key code for up arrow
    if (pastCommands.length == 0) return;

    $(commandInput).val("");
    $(commandInput).focus();
    $(commandInput).val(pastCommands[commandIndex]);

    if (commandIndex > 0) {
      commandIndex--;
    }
  }
});

function commandValid(command) {
  if (command == "") {
    addItemToHistory("sys", "Please enter a command", "feedback-danger");
    return false;
  }
  return true;
}

function handleCommand(command) {
  command = command.trim().toLowerCase();
  pastCommands.unshift(command);
  // Output command to history
  addItemToHistory("usr", command, "neutral");

  if (!drone.placed || command.split(" ")[0].toLowerCase() == 'place') {
    handlePlaceCommand(command);
  } else{
    //apart from place, all commands take no arguments, thus can be called straight from commands object
    if(commands[command]==undefined){
      addItemToHistory("sys", "Invalid command", "feedback-danger");
      addItemToHistory("sys", "Enter -help for help", "feedback-danger");
    } else{
      commands[command]();
    }
  }
}

function handlePlaceCommand(command){
  // The first command has to be place
  var commandParts = command.split(" ");
  var verb = commandParts[0];

  // If command isn't help or place, show error
  if (verb != "place" && verb != "-help") {
    addItemToHistory(
      "sys",
      "Please place the drone first",
      "feedback-danger"
    );
    addItemToHistory("sys", "Enter -help for help", "feedback-danger");
    return;
  }
  // show help if -help 
  else if (verb == "-help") {
    commands["-help"]();
    return;
  }

  if(commandParts.length < 2){
    addItemToHistory("sys", "Invalid place command. Ensure place follows the following format:", "feedback-danger");
    addItemToHistory("sys", "PLACE X,Y,F", "feedback-danger");
    addItemToHistory("sys", "Enter -help for help", "feedback-danger");
  }

  //Command has to be place
  var arguments = commandParts[1];
  var argumentParts = arguments.split(",");

  if(argumentParts.length < 3){
    addItemToHistory("sys", "Invalid place command. Not enough arguments", "feedback-danger");
    addItemToHistory("sys", "Enter -help for help", "feedback-danger");
  }

  commands["place"](
    argumentParts[0].trim(),
    argumentParts[1].trim(),
    argumentParts[2].trim()
  );

}

function addItemToHistory(prefix, message, statusClass) {
  var itemText = "&lt;" + prefix + "&gt; " + message;
  $(historyList).append(
    '<li class="history-item ' + statusClass + '">' + itemText + "</li>"
  );
  $(historyList).scrollTop(function () {
    return this.scrollHeight;
  });
}

function placeDrone(x, y, f) {
  x = Number(x);
  y = Number(y);
  if(x < 0 || x > maxX){
    addItemToHistory("sys", "Drone could not be place. Out of x bounds", "feedback-danger");
    return;
  }

  if(y < 0 || y > maxY){
    addItemToHistory("sys", "Drone could not be place. Out of y bounds", "feedback-danger");
    return;
  }

  drone.place(x, y, f);
  addItemToHistory("sys", "Drone placed at ("+x+", "+y+") facing "+drone.getDirection()+"...", "ok");
  console.log(drone);
}

function left() {
  drone.left();
  addItemToHistory("sys", "Drone turned to the left now facing "+drone.getDirection()+"...", "ok");
}

function right() {
  drone.right();
  addItemToHistory("sys", "Drone turned to the right now facing "+drone.getDirection()+"...", "ok");
}

function attack() {
  console.log("Attack");
  addItemToHistory("sys", "Drone attacking...", "ok");
}

function report() {
  console.log("Report");
  addItemToHistory("sys", drone.report(), "ok");
}

function help() {
  console.log("Help");
  var lines = [];
  lines.push("The following is a list of valid commands and descriptions:");
  lines.push("<strong>PLACE X,Y,F</strong>: PLACE is used to place the drone on the surface.<br/>X, Y and F represent the x and y co-ordinates, and the direction of the drone respectively.<br />An example of a valid place command would be PLACE 5,5,WEST.");
  lines.push("<strong>LEFT</strong>: LEFT is used to rotate the drone 90° to the left");
  lines.push("<strong>RIGHT</strong>: RIGHT is used to rotate the drone 90° to the right");
  lines.push("<strong>MOVE</strong>: MOVE is used to move one unit forward in the direction the drone is facing.");
  lines.push("<strong>ATTACK</strong>: ATTACK is used to fire a projectile 2 units forwards from the<br/>drone's position in the direction it is facing.");
  lines.push("<strong>REPORT</strong>: REPORT is used to get a text report of the drone's current<br />position and the direction it is facing.<br/><br/>");
  lines.push("<strong>*IMPORTANT*</strong>: The PLACE command has to be used before any other command in the sequence.<br/>");




  lines.map((line)=>{
    addItemToHistory("hlp", line, "feedback-neutral");
  });
}
