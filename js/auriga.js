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

  this._initialize_shapes(container_id);
  this._configure_mouse_follower();
  this._configure_redraw();
  this._stage.start();
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
  shape.acceleration = new Vector(0, 0.0);
  this._shape = shape;

  this._layer = new Kinetic.Layer();
  this._layer.add(this._shape);
  this._stage = new Kinetic.Stage(container_id, this._config.width, this._config.height);
  this._stage.add(this._layer);
}

Auriga.prototype._configure_mouse_follower = function() {
  this._last_mouse_position = new Vector(this._shape.x, this._shape.y);
  var self = this;
  this._stage.on('mousemove', function(evt) {
    var total_offset_x = 0;
    var total_offset_y = 0;
    var elem = evt.target;

    do {
      total_offset_x += elem.offsetLeft;
      total_offset_y += elem.offsetTop;
    } while(elem = elem.offsetParent);

    self._last_mouse_position.x = evt.pageX - total_offset_x;
    self._last_mouse_position.y = evt.pageY - total_offset_y;
  });
}

Auriga.prototype._configure_redraw = function() {
  var self = this;
  this._stage.onFrame(function(frame) {
    var position = new Vector(self._shape.x, self._shape.y);
    var delta = self._last_mouse_position.sub(position);
    delta.y = -delta.y;
    if(delta.magnitude() < self._config.err_tolerance)
      return;
    console.log(delta.magnitude());

    self._shape.acceleration = delta;
    self._shape.velocity = self._shape.velocity.add(self._shape.acceleration);

    var frame_max_speed = self._config.max_speed * (delta.magnitude() / self._config.width);
    if(self._shape.velocity.magnitude() > frame_max_speed)
      self._shape.velocity = self._shape.velocity.normalize().mult(frame_max_speed);

    self._shape.x += self._shape.velocity.x;
    self._shape.y -= self._shape.velocity.y;
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
