/*======
  Auriga
  ======*/
function Auriga(container_id) {
  this._config = {
    width: 1200,
    height: 1000,
    max_speed: 80,
    err_tolerance: 3,
  };

  this._initialize_shapes();
  this._initialize_canvas(container_id);
  //this._configure_mouse_follower();
  this._configure_mouse_click();
  this._configure_redraw();
  this._stage.start();
}


Auriga.prototype._initialize_canvas = function(container_id) {
  this._layer = new Kinetic.Layer();
  this._layer.add(this._shape);
  this._stage = new Kinetic.Stage(container_id, this._config.width, this._config.height);
  this._stage.add(this._layer);
}

Auriga.prototype._configure_mouse_follower = function() {
  this._last_mouse_position = new Vector(this._shape.x, this._shape.y);
  var self = this;
  this._stage.on('mousemove', function(evt) {
    self._last_mouse_position = self._resolve_mouse_coords(evt);
  });
}

Auriga.prototype._resolve_mouse_coords = function(evt) {
  var total_offset_x = 0;
  var total_offset_y = 0;
  var elem = evt.target;

  do {
    total_offset_x += elem.offsetLeft;
    total_offset_y += elem.offsetTop;
  } while(elem = elem.offsetParent);

  var x = evt.pageX - total_offset_x;
  var y = evt.pageY - total_offset_y;
  return new Vector(x, y);
}

Auriga.prototype._configure_mouse_click = function() {
  var self = this;
  this._stage.on('click', function(evt) {
    var coords = self._resolve_mouse_coords(evt);
    var marker = new Kinetic.Circle({
      x: coords.x,
      y: coords.y,
      fill: '#ff0000',
      radius: 5
    });
    self._layer.add(marker);

    self._shape.add_waypoint(coords, function() {
      self._layer.remove(marker);
      console.log('Reached ' + coords.toString());
    });
  });
}

Auriga.prototype._initialize_shapes = function(container_id) {
  var shape = new Kinetic.Circle({
    x: 50,
    y: 50,
    fill: '#00D2FF',
    stroke: '#000000',
    strokeWidth: 1,
    radius: 50
  });
  shape.velocity = new Vector(0, 0);
  shape.acceleration = new Vector(0, 0);

  var config = this._config;

  shape.update_position = function() {
    if(this._waypoints.length === 0)
      return false;
    var target = this._waypoints[0];

    this._move_toward(target.coords, target.on_waypoint_reached);
    return true;
  };

  shape._move_toward = function(target_pos, on_target_reached) {
    var current_pos = new Vector(this.x, this.y);
    var delta = target_pos.sub(current_pos);
    delta.y = -delta.y;

    if(delta.magnitude() < config.err_tolerance) {
      on_target_reached();
    }

    //console.log(delta.magnitude());
    this.acceleration = delta;
    this.velocity = this.velocity.add(this.acceleration);

    var frame_max_speed = config.max_speed * (delta.magnitude() / config.width);
    if(this.velocity.magnitude() > frame_max_speed)
      this.velocity = this.velocity.normalize().mult(frame_max_speed);

    this.x += this.velocity.x;
    this.y -= this.velocity.y;
  };

  shape._waypoints = [];
  shape.add_waypoint = function(coords, on_waypoint_reached) {
    shape._waypoints.push({
      coords: coords,
      on_waypoint_reached: function() {
        shape._waypoints.shift();
        on_waypoint_reached();
      }
    });
  };

  this._shape = shape;
}

Auriga.prototype._configure_redraw = function() {
  var self = this;
  this._stage.onFrame(function(frame) {
    if(self._shape.update_position.call(self._shape))
      self._layer.draw();
  });
}


/*======
  Vector
  ======*/
function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.add = function(vec) {
  return new Vector(this.x + vec.x, this.y + vec.y);
}

Vector.prototype.sub = function(vec) {
  return new Vector(this.x - vec.x, this.y - vec.y);
}

Vector.prototype.mult = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
}

Vector.prototype.div = function(factor) {
  return new Vector(this.x / factor, this.y / factor);
}

Vector.prototype.normalize = function() {
  var magnitude = this.magnitude();
  if(magnitude < 0.001)
    return this;
  return this.div(magnitude);
}

Vector.prototype.magnitude = function() {
  return Math.sqrt(this.x*this.x + this.y*this.y);
}

Vector.prototype.toString = function() {
  return "[" + this.x + ", " + this.y + "]";
}


window.addEventListener('load', function() {
  var eb = new Auriga('container');
}, false);
