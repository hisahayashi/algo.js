/**
 * ALGO.Particle
 */
ALGO.Particle = function( _x, _y ) {
  'use strict';
  // ALGO.log( 'ALGO.Particle' );
  this.x = _x;
  this.y = _y;

  // define
  this.angles = 10;
  this.angles_ = 10;
  this.radius = 100;
  this.radius_ = 100;

  this.type = 'particle';

  this.init();
  this.setup();
};

ALGO.Particle.prototype = Object.create( ALGO.Shape.prototype );
ALGO.Particle.prototype.constructor = ALGO.Particle;

 ALGO.Particle.prototype.pointsize = 1;

/**
 * [setupGeometry description]
 */
 ALGO.Particle.prototype.setGeometry = function( _geometry ){
  /* 頂点の位置を算出 */
  if( _geometry ){
    this.geometry = _geometry;
    this.vertexUpdate();
  }
  // ALGO.log('geometry', this.geometry);
};

/**
 * [setIndex description]
 */
ALGO.Particle.prototype.setIndex = function(){
};

/**
 * [textureCoord description]
 */
 ALGO.Particle.prototype.setTextureCoord = function(){
  var length = this.geometry.length;
  this.textureCoord = [
    0.0, 0.0
  ];
  var count = 0;
  for( var i = 0; i < length; i++ ){
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
  // ALGO.log('textureCoord', this.textureCoord);
};

ALGO.Particle.prototype.setScale = function(scale) {
  if (this.m) {
    var scaleX = scale;
    var scaleY = scale;

    this.m.scale(this.matrix, [scaleX, scaleY, 0.0], this.matrixScale);
    // ALGO.log( 'scale: ' + scale );
    // ALGO.log( this.matrixScale );
  }
};
