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

/**
 * [setupGeometry description]
 */
 ALGO.Polygon.prototype.setGeometry = function(){
  /* 頂点の位置を算出 */
  var geometry = this.geometry = [];
  for (var i = 0; i < this.angles; i++) {
    geometry[i] = {};
    geometry[i].x = Math.cos(2 * i * Math.PI / this.angles - Math.PI / 2);
    geometry[i].y = Math.sin(2 * i * Math.PI / this.angles - Math.PI / 2);
  }
};

/**
 * [setIndex description]
 */
 ALGO.Polygon.prototype.setIndex = function(){
  // set index
  var index = this.index = [];
  for( i = 1; i < this.angles - 1; i++ ){
    index.push( 0 );
    index.push( i );
    index.push( i+1 );
  }
};
