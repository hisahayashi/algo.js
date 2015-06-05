/**
 * ALGO.Path
 */
ALGO.Path = function(_start, _end) {
  'use strict';
  // ALGO.log( 'ALGO.Path' );
  // ALGO.log( this.geometry );

  this.start = _start;
  this.end = _end;
  this.type = 'path';

  this.init();
  this.setup();

  this.initLine();
};

ALGO.Path.prototype = Object.create(ALGO.Shape.prototype);
ALGO.Path.prototype.constructor = ALGO.Path;
ALGO.Path.prototype.closed = false;

ALGO.Path.prototype.setGeometry = function() {};

/**
 * [setIndex description]
 */
ALGO.Path.prototype.setIndex = function() {
  // set index
  var index = this.index = [];
  var length = this.geometry.length;
  // for (i = 1; i < length - 1; i += 1) {
  //   index.push(0);
  //   index.push(i);
  //   index.push(i + 1);
  //   // ALGO.log( 0 + ', ' + i + ', ' + ( i + 1 ) );
  // }
  var g = [];
  for (var i = 0; i < length; i++) {
    g[i] = [];
    g[i][0] = this.geometry[i].x;
    g[i][1] = this.geometry[i].y;
  }
  if (length > 2) {
    var triangles = Delaunay.triangulate(g);
    this.index = triangles;
  }
};

ALGO.Path.prototype.setScale = function(scale) {
  if (this.m) {
    var scaleX = scale;
    var scaleY = scale;

    this.m.scale(this.matrix, [scaleX, scaleY, 0.0], this.matrixScale);
    // ALGO.log( 'scale: ' + scale );
    // ALGO.log( this.matrixScale );
  }
};

ALGO.Path.prototype.initLine = function() {
  var start = this.start;
  var end = this.end;
  if (start) {
    this.moveTo(start.x, start.y);
  }
  if (end) {
    this.lineTo(end.x, end.y);
  }
};

ALGO.Path.prototype.moveTo = function(x, y) {
  // ALGO.log('moveTo: ' + x + ', ' + y );
  var vec2 = {
    x: x,
    y: y
  };
  this.geometry.push(vec2);

  this.vertexUpdate();
};

ALGO.Path.prototype.lineTo = function(x, y) {
  // ALGO.log('lineTo: ' + x + ', ' + y );
  var vec2 = {
    x: x,
    y: y
  };
  this.geometry.push(vec2);

  this.vertexUpdate();
  // ALGO.log( 'geometry: ' + this.geometry.length + ', pos: ' + this.vertexPosition.length + ', color: ' + this.vertexColors.length );
};

ALGO.Path.prototype.vertexUpdate = function() {
  this.setVertexPosition();
  this.setVertexColor(this.color, this.vertexColors);
  this.setVertexAlpha(this.alpha, this.vertexColors);
  this.setVertexColor(this.lineColor, this.vertexLineColors);
  this.setVertexAlpha(this.lineAlpha, this.vertexLineColors);
  this.setIndex();
}

ALGO.Path.prototype.close = function() {
  this.closed = true;
};
