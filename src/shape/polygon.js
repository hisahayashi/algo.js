/**
 * ALGO.Polygon
 */
ALGO.Polygon = function( _x, _y, _angles, _radius ) {
  'use strict';
  // ALGO.log( 'ALGO.Polygon' );
  this.x = _x;
  this.y = _y;
  this.angles = _angles;
  this.radius = _radius;

  // define
  this.angles_ = _angles;
  this.radius_ = _radius;

  this.type = 'polygon';

  this.init();
  this.setup();
};

ALGO.Polygon.prototype = Object.create( ALGO.Shape.prototype );
ALGO.Polygon.prototype.constructor = ALGO.Polygon;

ALGO.Polygon.prototype.setup = function(){
  /* 頂点の位置を算出 */
  var angle_points = [];
  for (var i = 0; i < this.angles; i++) {
    angle_points[i] = {};
    angle_points[i].x = this.radius * Math.cos(2 * i * Math.PI / this.angles - Math.PI / 2);
    angle_points[i].y = this.radius * Math.sin(2 * i * Math.PI / this.angles - Math.PI / 2);
  }

  var vp = [];
  var vc = [];
  var cl = ALGO.ColorUtil.hexToRgbNormalize( this.color );

  for( i = 0; i < angle_points.length; i++ ){
    // point
    vp.push( angle_points[i].x );
    vp.push( angle_points[i].y );

    // color
    vc.push( cl.r );
    vc.push( cl.g );
    vc.push( cl.b );
    vc.push( this.alpha );
  }
  this.vertexPosition = vp;
  this.vertexColors = vc;

  // set index
  var index = [];

  // set index
  for( i = 1; i < this.angles - 1; i++ ){
    index.push( 0 );
    index.push( i );
    index.push( i+1 );
  }

  this.index = index;
};
