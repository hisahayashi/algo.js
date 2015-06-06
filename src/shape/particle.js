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
  var geometry = this.geometry = [];

  // for (var i = 0; i < this.angles; i++) {
  //   geometry[i] = {};
  //   geometry[i].x = Math.cos(2 * i * Math.PI / this.angles - Math.PI / 2);
  //   geometry[i].y = Math.sin(2 * i * Math.PI / this.angles - Math.PI / 2);
  // }
  // this.geometry = geometry;

  if( _geometry ){
    this.geometry = _geometry;
    this.vertexUpdate();
  }

};

/**
 * [setIndex description]
 */
 ALGO.Particle.prototype.setIndex = function(){
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
