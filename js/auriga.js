/*====
  Util
  ====*/
Util = {
  extend: function(extendee, extender) {
    for(var key in extender)
      if(extender.hasOwnProperty(key) && typeof extendee[key] === 'undefined')
        extendee[key] = extender[key];
  },
};


/*========
  ColorGen
  ========*/
// See http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/.
ColourGen = {
  random: function() {
    var hue = ColourGen._generate_hue();
    var saturation = 0.5;
    var value = 0.95;

    var rgb = ColourGen._hsv_to_rgb(hue, saturation, value);
    for(var i = 0; i < rgb.length; i++)
      rgb[i] = Math.floor(256 * rgb[i]).toString(16);
    return '#' + rgb.join('');
  },

  _generate_hue: function() {
    var golden_ratio_conjugate = 0.618033988749895;
    var hue = Math.random();
    hue += golden_ratio_conjugate;
    hue %= 1;
    return hue;
  },

  _hsv_to_rgb: function(h, s, v) {
    var h_i = Math.floor(6*h);
    var f = 6*h - h_i;
    var p = v*(1 - s);
    var q = v * (1 - f*s);
    var t = v * (1 - (1 - f) * s);

    switch(h_i) {
      case 0: return [v, t, p];
      case 1: return [q, v, p];
      case 2: return [p, v, t];
      case 3: return [p, q, v];
      case 4: return [t, p, v];
      case 5: return [v, p, q];
      default: return [0, 0, 0];
    }
  },
};

/*======
  Auriga
  ======*/
function Auriga(container_id) {
  this._config = {
    container_width: 1200,
    container_height: 1000,
    max_speed: 80,
    err_tolerance: 3,
  };

  this._initialize_shapes();
  this._initialize_canvas(container_id);

  // Uncomment only one of the two following lines.
  //this._configure_mouse_follower();
  this._configure_waypoint_follower();

  this._draw_image();

  this._configure_redraw();
  this._stage.start();
}

Auriga.prototype._draw_image = function() {
  var img = new Image();
  var kimg = new Kinetic.Image({
    x: 150,
    y: 150,
    image: img,
    width: 100,
    height: 100,
    draggable: true,
  });

  var layer = this._layer;
  layer.add(kimg);
  img.onload = function() {
    layer.draw();
  };

  var svg = document.getElementById('pants');
  var face = svg.querySelector('circle.face');
  var xmls = new XMLSerializer();
  window.setInterval(function() {
    face.setAttribute('fill', ColourGen.random());
    var svg_xml = xmls.serializeToString(svg);
    img.src = 'data:image/svg+xml;base64,' + btoa(svg_xml);
    console.log(img);
  }, 500);
}

Auriga.prototype._initialize_canvas = function(container_id) {
  this._layer = new Kinetic.Layer();
  this._layer.add(this._shape);
  this._stage = new Kinetic.Stage(container_id,
    this._config.container_width, this._config.container_height);
  this._stage.add(this._layer);
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

Auriga.prototype._configure_mouse_follower = function() {
  this._behaviour = new MouseFollower(this._shape);
  this._behaviour.cursorLastAt(new Vector(this._shape.x, this._shape.y));

  var self = this;
  this._stage.on('mousemove', function(evt) {
    self._behaviour.cursorLastAt(self._resolve_mouse_coords(evt));
  });
}

Auriga.prototype._configure_waypoint_follower = function() {
  this._behaviour = new WaypointFollower(this._shape);

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
      self._layer.draw();
      console.log('Reached ' + coords.toString());
    });
  });
}

Auriga.prototype._initialize_shapes = function(container_id) {
  var config = {
    x: 50,
    y: 50,
    fill: '#00D2FF',
    stroke: '#000000',
    strokeWidth: 1,
    radius: 50
  };
  Util.extend(config, this._config);
  this._shape = new FollowingShape(config);
}

Auriga.prototype._configure_redraw = function() {
  var self = this;
  this._stage.onFrame(function(frame) {
    self._behaviour.update();
    if(self._shape.needs_redraw())
      self._layer.draw();
  });
}


/*==============
  FollowingShape
  ==============*/
FollowingShape = function(config) {
  FollowingShape.parent_type.call(this, config);
  this._config = config;
  this._waypoints = [];
  this._needs_redraw = false;
  this._velocity = new Vector(0, 0);
  this._acceleration = new Vector(0, 0);
}
FollowingShape.parent_type = Kinetic.Circle;
Util.extend(FollowingShape.prototype, FollowingShape.parent_type.prototype);

FollowingShape.prototype.move_toward = function(target_pos, on_target_reached) {
  var current_pos = new Vector(this.x, this.y);
  var delta = target_pos.sub(current_pos);
  delta.y = -delta.y;

  if(delta.magnitude() < this._config.err_tolerance) {
    this._needs_redraw = false;
    if(typeof on_target_reached !== 'undefined')
      on_target_reached.call(this);
  } else {
    this._needs_redraw = true;
  }

  //console.log(delta.magnitude());
  this._acceleration = delta;
  this._velocity = this._velocity.add(this._acceleration);

  var frame_max_speed = this._config.max_speed * (delta.magnitude() / this._config.container_width);
  if(this._velocity.magnitude() > frame_max_speed)
    this._velocity = this._velocity.normalize().mult(frame_max_speed);

  this.x += this._velocity.x;
  this.y -= this._velocity.y;
};

FollowingShape.prototype.move_toward_next_waypoint = function() {
  if(this._waypoints.length === 0) {
    this._needs_redraw = false;
    return;
  }

  var target = this._waypoints[0];
  this.move_toward(target.coords, target.on_waypoint_reached);
};

FollowingShape.prototype.needs_redraw = function() {
  return this._needs_redraw;
}

FollowingShape.prototype.add_waypoint = function(coords, on_waypoint_reached) {
  this._waypoints.push({
    coords: coords,
    on_waypoint_reached: function() {
      this._waypoints.shift();
      on_waypoint_reached.call(this);
    }
  });
};


/*====================
  Following Behaviours
  ====================*/
WaypointFollower = function(shape) {
  this.update = function() {
    shape.move_toward_next_waypoint();
  };

}

MouseFollower = function(shape) {
  this.update = function() {
    shape.move_toward(this._lastCursorPos);
  };

  this.cursorLastAt = function(pos) {
    this._lastCursorPos = pos;
  }
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
  new Auriga('container');
}, false);
