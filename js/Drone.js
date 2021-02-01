class Drone {
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

  place(x,y,f){
    this.x = x;
    this.y = y;
    this.bearing = this.getBearing(f);
    this.placed = true;
  }

  left() {
    this.bearing -= 90;
    // If facing north (0), turning left will put it at -90, or 270
    if (this.bearing < 0) {
      this.bearing = 270;
    }
  }

  right() {
    this.bearing += 90;
    // If facing west (270), turning right will put it at 360, or 0
    if (this.bearing >= 360) {
      this.bearing = 0;
    }
  }

  getBearing(facing){
      switch(facing){
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

  getDirection() {
    return this.compass[this.bearing];
  }

  report() {
      return "Report: Position("+this.x+","+this.y+"), Facing "+this.getDirection();
  }

  move(maxX, maxY) {
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

    if (newX > maxX || newX < 0) {
      return false;
    }
    this.x = newX;

    if (newY > maxY || newY < 0) {
      return false;
    }
    this.y = newY;
  }
}
