/**
 * ALGO.Rectangle
 */
ALGO.Rectangle = function( _x, _y, _width, _height ) {
  'use strict';
  // ALGO.log( 'ALGO.Rectangle' );
  this.x = _x;
  this.y = _y;
  this.width = _width;
  this.height = _height;

  // define
  this.width_ = _width;
  this.height_ = _height;

  this.type = 'rectangle';

  this.init();
  this.setup();
};

ALGO.Rectangle.prototype = Object.create( ALGO.Shape.prototype );
ALGO.Rectangle.prototype.constructor = ALGO.Rectangle;

ALGO.Rectangle.prototype.width = 0;
ALGO.Rectangle.prototype.height = 0;
ALGO.Rectangle.prototype.width_ = 0;
ALGO.Rectangle.prototype.height_ = 0;

ALGO.Rectangle.prototype.setGeometry = function(){
  /* 頂点の位置を算出 */
  var geometry = this.geometry = [];

  geometry[0] = [];
  geometry[0].x = -0.5;
  geometry[0].y = -0.5;

  geometry[1] = [];
  geometry[1].x = 0.5;
  geometry[1].y = -0.5;

  geometry[2] = [];
  geometry[2].x = 0.5;
  geometry[2].y = 0.5;

  geometry[3] = [];
  geometry[3].x = -0.5;
  geometry[3].y = 0.5;
};

ALGO.Rectangle.prototype.setScale = function(scale){
  if( this.m ){
    var scaleX = this.width * scale;
    var scaleY = this.height * scale;

    this.m.scale( this.matrix, [ scaleX, scaleY, 0.0 ], this.matrixScale );
    // ALGO.log( 'scale: ' + scale );
    // ALGO.log( this.matrixScale );
  }
};

ALGO.Rectangle.prototype.setIndex = function(){
  var index = [
    0, 1, 2,
    0, 2, 3
  ];
  this.index = index;
};

/**
 * Define Getter / Setter
 */
ALGO.Rectangle.prototype.__defineGetter__('width', function() {
  // ALGO.log('define getter: width');
  return this.width_;
});

ALGO.Rectangle.prototype.__defineSetter__('width', function(value) {
  // ALGO.log('define setter: width');
  this.width_ = value;
  this.setScale( this.scale );
});

ALGO.Rectangle.prototype.__defineGetter__('height', function() {
  // ALGO.log('define getter: height');
  return this.height_;
});

ALGO.Rectangle.prototype.__defineSetter__('height', function(value) {
  // ALGO.log('define setter: height');
  this.height_ = value;
  this.setScale( this.scale );
});
