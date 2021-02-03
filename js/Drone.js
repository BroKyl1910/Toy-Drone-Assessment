class Drone {
  // Drone keeps track of its own position and bearing
  constructor() {
    this.x = 0;
    this.y = 0;
    this.bearing = 0;
    this.compass = {
      0: "North",
      90: "East",
      180: "South",
      270: "West",
    };
    this.placed = false;
  }

  // Stores placed position, sets placed Boolean to true
  place(x, y, f, obstructions) {
    if(this.blockObstructed(x,y, obstructions)){
      return false
    }
    this.x = x;
    this.y = y;
    this.bearing = this.getBearing(f);
    this.placed = true;
    return true;
  }

  // Subtracts 90deg from bearing
  left() {
    this.bearing -= 90;
    // If facing north (0), turning left will put it at -90, or 270
    if (this.bearing < 0) {
      this.bearing = 270;
    }
  }

  // Adds 90deg to bearing
  right() {
    this.bearing += 90;
    // If facing west (270), turning right will put it at 360, or 0
    if (this.bearing >= 360) {
      this.bearing = 0;
    }
  }

  // Return bearing based on direction
  getBearing(facing) {
    switch (facing) {
      case "north":
        return 0;
      case "east":
        return 90;
      case "south":
        return 180;
      case "west":
        return 270;
    }
  }

  // Returns direction, based on bearing
  getDirection() {
    return this.compass[this.bearing];
  }

  // Output current state of drone
  report() {
    return (
      "Report: Position(" +
      this.x +
      "," +
      this.y +
      "), facing " +
      this.getDirection()
    );
  }

  // Move drone if next block isn't obstructed or out of bounds
  move(maxX, maxY, obstructions) {
    var xChange;
    var yChange;
    switch (this.bearing) {
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
        yChange = 0;
    }

    var newX = this.x + xChange;
    var newY = this.y + yChange;

    if(this.blockObstructed(newX, newY, obstructions)){
      return false;
    }

    if (newX > maxX || newX < 0) {
      return false;
    }

    this.x = newX;

    if (newY > maxY || newY < 0) {
      return false;
    }
    this.y = newY;

    return true;
  }

  // Checks if safe to fire projectile and returns whether it is or not 
  attack(obstructions, maxX, maxY) {
    // Need to check space around the drone according to its bearing
    // Cannot fire if within 2 units of an obstruction or edge
    console.log("Attack bearing", this.bearing);
    switch (this.bearing) {
      case 0:
        if (this.y + 2 > maxY || this.blockObstructed(this.x, this.y + 1, obstructions) || this.blockObstructed(this.x, this.y + 2, obstructions)) {
          return false;
        }
        break;
      case 90:
        if (this.x + 2 > maxX || this.blockObstructed(this.x + 1, this.y, obstructions) || this.blockObstructed(this.x + 2, this.y, obstructions)) {
          return false;
        }
        break;
      case 180:
        if (this.y - 2 < 0 || this.blockObstructed(this.x, this.y - 1, obstructions) || this.blockObstructed(this.x, this.y - 2, obstructions)) {
          return false;
        }
        break;
      case 270:
        if (this.x + -2 < 0 || this.blockObstructed(this.x - 1, this.y, obstructions) || this.blockObstructed(this.x - 2, this.y, obstructions)) {
          return false;
        }
        break;
    }
    return true;
  }

  // Check if block is obstructed
  blockObstructed(x, y, obstructions) {
    for (const obstruction of obstructions) {
      if(x == obstruction[0] && y == obstruction[1]){
        return true;
      }
    }

    return false;
  }
}
