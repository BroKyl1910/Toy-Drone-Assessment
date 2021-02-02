var commandInput = $("#command-input");
var historyList = $("ul.history-list");
var drone = new Drone();
var pastCommands = [];
var commandIndex = -1;
var maxX = 9;
var maxY = 9;

// Empty Map
var map = Array(10)
  .fill("")
  .map(() => Array(10));

// List of obstructions
var obstructions;

// command and methods
var commands = {
  place: (x, y, f) => placeDrone(x, y, f),
  left: () => left(),
  right: () => right(),
  attack: () => attack(),
  report: () => report(),
  "-help": () => help(),
  move: () => move(),
};

// on window ready the grid has to be generated
$(window).ready(() => {
  generateMap();
});

function removeDroneFromMap() {
  var mapX = drone.x;
  var mapY = getInvertedY(drone.y);

  var dronePlaceholder = $("#map_" + mapX + "_" + mapY).find(
    ".drone-placeholder"
  );

  $(dronePlaceholder).hide();

  // $(dronePlaceholder).addClass("fade-out");
  // setTimeout(() => {
  //   $(dronePlaceholder).css("background-image", "none");
  //   $(dronePlaceholder).css("opacity", "1");
  //   $(dronePlaceholder).removeClass("fade-out");
  // }, 200);
}

function placeDroneOnMap() {
  console.log("Bearing", drone.bearing);
  var mapX = drone.x;
  var mapY = getInvertedY(drone.y);

  var dronePlaceholder = $("#map_" + mapX + "_" + mapY).find(
    ".drone-placeholder"
  );
  var fileName = "";

  switch (drone.bearing) {
    case 0:
      fileName = "drone_N.png";
      break;
    case 90:
      fileName = "drone_E.png";
      break;
    case 180:
      fileName = "drone_S.png";
      break;
    case 270:
      fileName = "drone_W.png";
      break;
    default:
      fileName = "drone_N.png";
  }

  $(dronePlaceholder).show();

  $(dronePlaceholder).css(
    "background-image",
    'url("assets/images/' + fileName + '")'
  );
}

function generateMap() {
  var uiTable = $(".ui-tbody");
  $(uiTable).empty();

  var tableHtml = createTableHtml();

  $(uiTable).append(tableHtml);
}

function getInvertedY(y) {
  return Math.abs(9 - y);
}

function createTableHtml() {
  // create top row of indices
  var tableHtml = "";
  tableHtml += '<tr><td class="index-reference"></td>';
  for (let i = 0; i < map.length; i++) {
    tableHtml += '<td class="index-reference">' + i + "</td>";
  }
  tableHtml += '<td class="index-reference"></td></tr>';

  for (let y = 0; y < map.length; y++) {
    var yIndex = Math.abs(y - 9);
    tableHtml += '<tr><td class="index-reference">' + yIndex + "</td>";
    for (let x = 0; x < map[y].length; x++) {
      // tableHtml += '<td>' + yIndex + "," + x + "</td>";
      tableHtml +=
        '<td id="map_' +
        x +
        "_" +
        y +
        '"><div class="drone-placeholder"></div></td>';
    }
    tableHtml += '<td class="index-reference">' + yIndex + "</td></tr>";
    // tableHtml += "</tr>";
  }

  tableHtml += '<tr><td class="index-reference"></td>';
  for (let i = 0; i < map.length; i++) {
    tableHtml += '<td class="index-reference">' + i + "</td>";
  }
  tableHtml += '<td class="index-reference"></td></tr>';

  return tableHtml;
}

//Enter key
$(commandInput).on("keydown", (e) => {
  // 13 is key code for enter
  if (e.which == 13) {
    var enteredCommand = $(e.currentTarget).val();

    pastCommands.unshift(enteredCommand);
    // Output command to history
    addItemToHistory("usr", enteredCommand, "neutral");
    
    if (commandValid(enteredCommand)) {
      handleCommand(enteredCommand);
    }
    $(commandInput).val("");
    commandIndex = 0;
  }
});

//Up arrow
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

//Down arrow
$(commandInput).on("keydown", (e) => {
  if (e.which == 40) {
    // 40 is key code for down arrow
    if (pastCommands.length == 0) return;

    $(commandInput).val("");
    $(commandInput).focus();
    $(commandInput).val(pastCommands[commandIndex]);

    if (commandIndex > 0) {
      commandIndex--;
    }
  }
});

function handleCommand(command) {
  command = command.trim().toLowerCase();

  if (!drone.placed || command.split(" ")[0].toLowerCase() == "place") {
    handlePlaceCommand(command);
  } else {
    //apart from place, all commands take no arguments, thus can be called straight from commands object
    handleNonPlaceCommand(command);
  }
}

function handleNonPlaceCommand(command) {
  if (commands[command] == undefined) {
    addItemToHistory("sys", "Invalid command", "feedback-danger");
    addItemToHistory("sys", "Enter -help for help", "feedback-danger");
  } else {
    commands[command]();
  }
}

function handlePlaceCommand(command) {
  // The first command has to be place
  var commandParts = command.split(" ");
  var verb = commandParts[0];

  // If command isn't help or place, show error
  if (verb != "place" && verb != "-help") {
    addItemToHistory("sys", "Please place the drone first", "feedback-danger");
    addItemToHistory("sys", "Enter -help for help", "feedback-danger");
    return;
  }
  // show help if -help
  else if (verb == "-help") {
    commands["-help"]();
    return;
  }

  if (placeCommandValid(command)) {
    var arguments = commandParts[1];
    var argumentParts = arguments.split(",");
    commands["place"](
      argumentParts[0].trim(),
      argumentParts[1].trim(),
      argumentParts[2].trim()
    );
  }
}

function commandValid(command) {
  if (command == "") {
    addItemToHistory("sys", "Please enter a command", "feedback-danger");
    return false;
  }
  return true;
}

function placeCommandValid(command) {
  var commandParts = command.split(" ");

  if (commandParts.length < 2) {
    addItemToHistory(
      "sys",
      "Invalid place command. Ensure place follows the following format:",
      "feedback-danger"
    );
    addItemToHistory("sys", "PLACE X,Y,F", "feedback-danger");
    addItemToHistory("sys", "Enter -help for help", "feedback-danger");
    return false;
  }

  //Command has to be place
  var arguments = commandParts[1];
  var argumentParts = arguments.split(",");

  if (argumentParts.length < 3) {
    addItemToHistory(
      "sys",
      "Invalid place command. Not enough arguments",
      "feedback-danger"
    );
    addItemToHistory("sys", "Enter -help for help", "feedback-danger");
    return false;
  }

  if (argumentParts.length < 3) {
    addItemToHistory(
      "sys",
      "Invalid place command. Not enough arguments",
      "feedback-danger"
    );
    addItemToHistory("sys", "Enter -help for help", "feedback-danger");
    return false;
  }

  var f = argumentParts[2].trim().toLowerCase();
  var validFacings = ["north", "south", "east", "west"];
  if (!validFacings.includes(f)) {
    addItemToHistory(
      "sys",
      "Invalid place command. Invalid direction given",
      "feedback-danger"
    );
    addItemToHistory("sys", "Enter -help for help", "feedback-danger");
    return false;
  }
  return true;
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
  if (drone.placed) {
    removeDroneFromMap();
  }
  x = Number(x);
  y = Number(y);
  if (x < 0 || x > maxX) {
    addItemToHistory(
      "sys",
      "Drone could not be place. Out of x bounds",
      "feedback-danger"
    );
    return;
  }

  if (y < 0 || y > maxY) {
    addItemToHistory(
      "sys",
      "Drone could not be place. Out of y bounds",
      "feedback-danger"
    );
    return;
  }

  drone.place(x, y, f);
  placeDroneOnMap();
  addItemToHistory(
    "sys",
    "Drone placed at (" +
      x +
      ", " +
      y +
      ") facing " +
      drone.getDirection() +
      "...",
    "ok"
  );
}

function left() {
  removeDroneFromMap();
  drone.left();
  placeDroneOnMap();
  addItemToHistory(
    "sys",
    "Drone turned to the left now facing " + drone.getDirection() + "...",
    "ok"
  );
}

function right() {
  removeDroneFromMap();
  drone.right();
  placeDroneOnMap();
  addItemToHistory(
    "sys",
    "Drone turned to the right now facing " + drone.getDirection() + "...",
    "ok"
  );
}

function attack() {
  addItemToHistory("sys", "Drone attacking...", "ok");
}

function report() {
  addItemToHistory("sys", drone.report(), "ok");
}

function help() {
  var lines = [];
  lines.push("The following is a list of valid commands and descriptions:");
  lines.push(
    "<strong>PLACE X,Y,F</strong>: PLACE is used to place the drone on the surface.<br/>X, Y and F represent the x and y co-ordinates, and the direction of the drone respectively.<br />An example of a valid place command would be PLACE 5,5,WEST."
  );
  lines.push(
    "<strong>LEFT</strong>: LEFT is used to rotate the drone 90° to the left"
  );
  lines.push(
    "<strong>RIGHT</strong>: RIGHT is used to rotate the drone 90° to the right"
  );
  lines.push(
    "<strong>MOVE</strong>: MOVE is used to move one unit forward in the direction the drone is facing."
  );
  lines.push(
    "<strong>ATTACK</strong>: ATTACK is used to fire a projectile 2 units forwards from the<br/>drone's position in the direction it is facing."
  );
  lines.push(
    "<strong>REPORT</strong>: REPORT is used to get a text report of the drone's current<br />position and the direction it is facing.<br/><br/>"
  );
  lines.push(
    "<strong>*IMPORTANT*</strong>: The PLACE command has to be used before any other command in the sequence.<br/>"
  );

  lines.map((line) => {
    addItemToHistory("hlp", line, "feedback-neutral");
  });
}

function move() {
  removeDroneFromMap();
  drone.move();
  placeDroneOnMap();
}
