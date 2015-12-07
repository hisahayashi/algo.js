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
  for (var i = 0; i < this.angles; i++) {
    this.geometry[i] = {};
    this.geometry[i].x = Math.cos(2 * i * Math.PI / this.angles - Math.PI / 2);
    this.geometry[i].y = Math.sin(2 * i * Math.PI / this.angles - Math.PI / 2);
  }
};

/**
 * [setIndex description]
 */
 ALGO.Polygon.prototype.setIndex = function(){
  // set index
  for( i = 1; i < this.angles - 1; i++ ){
    this.index.push( 0 );
    this.index.push( i );
    this.index.push( i+1 );
  }
};

/**
 * [textureCoord description]
 */
 ALGO.Polygon.prototype.setTextureCoord = function(){
  // set textureCoord
  this.textureCoord = [
    0.0, 0.0
  ];
  var count = 0;
  for( var i = 0; i < this.angles; i++ ){
    switch(count){
      case 0:
      this.textureCoord.push(1.0);
      this.textureCoord.push(0.0);
      break;
      case 1:
      this.textureCoord.push(0.0);
      this.textureCoord.push(1.0);
      break;
      case 2:
      this.textureCoord.push(1.0);
      this.textureCoord.push(1.0);
      break;
      default:
      break;
    }
    count++;
    if(count>2) count = 0;
  }
};
