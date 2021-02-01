var map = Array(10)
  .fill(" ")
  .map(() => Array(10));
var drone = new Drone();

// command and methods
var commands = {
  place: (x, y, f) => placeDrone(x, y, f),
  left: () => left(),
  right: () => right(),
  attack: () => attack(),
  report: () => report(),
};

while (!drone.placed) {
  var command = prompt("Where would you like to place the drone? PLACE X,Y,F");
  command = command.trim().toLowerCase();
  console.log(command);
  var commandParts = command.split(" ");
  var verb = commandParts[0];
  var arguments = commandParts[1];
  var argumentParts = arguments.split(",");

  commands.place(
    argumentParts[0].trim(),
    argumentParts[1].trim(),
    argumentParts[2].trim()
  );
}

function placeDrone(x, y, f) {
  drone.place(Number(x), Number(y), f);
}

function left() {
  drone.left();
}

function right() {
  drone.right();
}

function attack() {
  console.log("Attack");
}

function report() {
  console.log(drone.report());
}
