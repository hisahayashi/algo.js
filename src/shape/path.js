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
  this.holes = [];
  this.triangles = null;

  this.init();
  this.setup();

  this.initLine();
};

ALGO.Path.prototype = Object.create(ALGO.Shape.prototype);
ALGO.Path.prototype.constructor = ALGO.Path;
ALGO.Path.prototype.closed = false;
ALGO.Path.prototype.holes = [];
ALGO.Path.prototype.triangles = null;

/**
 * [setGeometry description]
 */
ALGO.Path.prototype.setGeometry = function() {};

ALGO.Path.prototype.geometryToPoly = function( geometry, start_count ){
  var poly = [];
  var length = geometry.length;
  var prevx, prevy;
  var count = start_count;
  for (var i = 0; i < length; i++) {
    var x = geometry[i].x;
    var y = geometry[i].y;
    if( prevx !== x || prevy !== y ){
      var point = { x: x, y: y, id: count };
      poly.push(point);
      prevx = x;
      prevy = y;
      count++;
      // ALGO.log( point );
    }
  }
  return poly;
};

/**
 * [setIndex description]
 */
ALGO.Path.prototype.setIndex = function() {
  // set index
  var index = this.index = [];
  var length = this.geometry.length;

  if (length > 2) {
    // create geometry
    var poly = this.geometryToPoly( this.geometry, 0 );

    // create poly
    var swctx = new poly2tri.SweepContext(poly, {cloneArrays: true});

    // create holes
    var hole_length = this.holes.length;
    var hole_count = poly.length;
    for( i = 0; i < hole_length; i++ ){
      var hole_geometry = this.holes[i];
      var hole_poly = this.geometryToPoly( hole_geometry, hole_count );
      poly = poly.concat(hole_poly);
      hole_count += hole_poly.length;
      swctx.addHole( hole_poly );
    }
    this.geometry = poly;

    // create triangles
    var trianglate = swctx.triangulate();
    var triangles = trianglate.getTriangles() || [];
    this.triangles = triangles;

    // set indexes
    var indexes = [];
    for( var i = 0; i < triangles.length; i++ ){
      var t = triangles[i];
      var p1 = t.getPoint(0);
      var p2 = t.getPoint(1);
      var p3 = t.getPoint(2);
      indexes.push( p1.id );
      indexes.push( p2.id );
      indexes.push( p3.id );
    }
    this.index = indexes;

    // update
    this.vertexPosition = [];
    this.setVertexPosition();
    this.setVertexColor( this.color, this.vertexColors );
    this.setVertexAlpha( this.alpha, this.vertexColors );
    this.setVertexColor( this.lineColor, this.vertexLineColors );
    this.setVertexAlpha( this.lineAlpha, this.vertexLineColors );
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

ALGO.Path.prototype.close = function() {
  this.closed = true;
};
