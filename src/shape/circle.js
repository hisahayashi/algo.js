/**
 * ALGO.Circle
 */
ALGO.Circle = function( _x, _y, _radius ) {
  'use strict';
  // ALGO.log( 'ALGO.Circle' );
  this.x = _x;
  this.y = _y;
  this.angles = ALGO.circleResolution;
  this.radius = _radius;

  // define
  this.angles_ = ALGO.circleResolution;
  this.radius_ = _radius;

  this.type = 'circle';

  this.init();
  this.setup();
};

ALGO.Circle.prototype = Object.create( ALGO.Polygon.prototype );
ALGO.Circle.prototype.constructor = ALGO.Circle;
