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
// 2D array of co-ordinates in the form [x,y]
var obstructions = [
  [0, 9],
  [1, 9],
  [2, 9],
  [3, 9],
  [8, 9],
  [9, 9],
  [0, 8],
  [1, 8],
  [2, 8],
  [9, 8],
  [0, 7],
  [1, 7],
  [0, 6],
  [6, 6],
  [5, 5],
  [9, 3],
  [0, 2],
  [5, 2],
  [6, 2],
  [9, 2],
  [0, 1],
  [1, 1],
  [4, 1],
  [5, 1],
  [6, 1],
  [7, 1],
  [9, 1],
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0],
  [6, 0],
  [7, 0],
  [8, 0],
  [9, 0],
];

populateMapWithObstructions();

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

function populateMapWithObstructions() {
  for (const obstruction of obstructions) {
    var x = obstruction[0];
    var y = obstruction[1];

    map[x][y] = "x";
  }
}

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
      var dronePlaceholderHtml = '<div class="drone-placeholder"></div>';
      var projectilePlaceholderHtml =
        '<div class="projectile-placeholder"><div class="placeholder_1"></div><div class="placeholder_2"></div><div class="placeholder_3"></div></div>';
      tableHtml +=
        "<td " +
        (map[x][yIndex] == "x" ? 'class="obstruction"' : "") +
        'id="map_' +
        x +
        "_" +
        y +
        '">' +
        dronePlaceholderHtml +
        " " +
        projectilePlaceholderHtml +
        "</td>";
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

  if (
    !isNumeric(argumentParts[0].trim()) ||
    !isNumeric(argumentParts[1].trim())
  ) {
    addItemToHistory(
      "sys",
      "Invalid place command. Invalid co-ordinates given",
      "feedback-danger"
    );
    addItemToHistory("sys", "Enter -help for help", "feedback-danger");
    return false;
  }

  var f = argumentParts[2];
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

function isNumeric(c) {
  return /^\d+$/.test(c);
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
      "Drone could not be placed. Out of x bounds",
      "feedback-danger"
    );
    return;
  }

  if (y < 0 || y > maxY) {
    addItemToHistory(
      "sys",
      "Drone could not be placed. Out of y bounds",
      "feedback-danger"
    );
    return;
  }

  var placed = drone.place(x, y, f, obstructions);
  if (!placed) {
    addItemToHistory(
      "sys",
      "Drone could not be placed there! Please make sure surface is not obstructed",
      "feedback-danger"
    );
    return;
  }
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
  var attacked = drone.attack(obstructions, maxX, maxY);
  if (!attacked) {
    addItemToHistory(
      "sys",
      "Drone does not have 2 units clear in front of it. Aborting!",
      "feedback-danger"
    );
  } else {
    addItemToHistory("sys", "Drone attacking...", "ok");
    // fireProjectile();
  }
}

function fireProjectile() {
  var mapX = drone.x;
  var mapY = getInvertedY(drone.y);

  var dronePlaceholder = $("#map_" + mapX + "_" + mapY).find(
    ".drone-placeholder"
  );

  var cellWidth = $(dronePlaceholder).innerWidth();
  var cellHeight = $(dronePlaceholder).innerHeight();
  var projectileX = $(dronePlaceholder).position().left - 0.5 * cellWidth;
  var projectileY = $(dronePlaceholder).position().top + 0.5 * cellHeight;

  $(dronePlaceholder).append('<div class="projectile"></div>');
  var projectile = $(".projectile");
  $(projectile).parent().css("position", "relative");

  var projectileHeight = $(projectile).innerHeight();
  projectileY = projectileY - 0.5 * projectileHeight;
  $(projectile).css("top", projectileY + "px");

  var projectileWidth = $(projectile).innerWidth();
  projectileX = projectileX + 0.5 * projectileWidth;
  $(projectile).css("left", projectileX + "px");

  var startX = projectileX;
  var endX = projectileX - 2 * cellWidth + projectileWidth;
  var startY = projectileY;
  var endY = projectileY;
  animateProjectile(startX, startY, endX, endY, dronePlaceholder);
}

function animateProjectile(startX, startY, endX, endY, dronePlaceholder) {
  var xChange;
  var yChange;
  switch (drone.bearing) {
    case 0:
      xChange = 0;
      yChange = 1;
      break;
    case 90:
      xChange = 1;
      yChange = 0;
      break;
    case 180:
      xChange = 0;
      yChange = -1;
      break;
    case 270:
      xChange = -1;
      yChange = 0;
      break;
    default:
      xChange = 0;
      yChange = 1;
  }

  console.log("xChange", xChange);
  console.log("yChange", yChange);

  var currentX = startX;
  var currentY = startY;
  var projectile = $(".projectile");

  var interval = setInterval(function () {
    currentY += 1 * yChange;
    currentX += 1 * xChange;

    $(projectile).css("top", currentY + "px");
    $(projectile).css("left", currentX + "px");
    if (currentX < endX && currentY >= endY) {
      clearInterval(interval);
      explode(endX, endY, dronePlaceholder);
    }
  }, 10);
}

function explode(x, y, dronePlaceholder) {
  $(".projectile").remove();
  $(dronePlaceholder).append('<div class="explosion"></div>');
  var explosion = $(".explosion");
  $(explosion).parent().css("position", "relative");

  var explosionX, explosionY;
  var explosionHeight = $(explosion).innerHeight();
  explosionY = y - 0.5 * explosionHeight + 7.5;
  $(explosion).css("top", explosionY + "px");

  explosionX = x;
  $(explosion).css("left", explosionX + "px");

  setTimeout(() => {
    $(explosion).parent().css("position", "static");
    $(".explosion").remove();
  }, 200);
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
  var moved = drone.move(maxX, maxY, obstructions);
  placeDroneOnMap();
  if (!moved) {
    addItemToHistory(
      "sys",
      "Drone could not be moved in the direction of " +
        drone.getDirection() +
        "...",
      "feedback-danger"
    );
  } else {
    addItemToHistory(
      "sys",
      "Drone moved forwards one unit in the direction of " +
        drone.getDirection() +
        "...",
      "ok"
    );
  }
}
