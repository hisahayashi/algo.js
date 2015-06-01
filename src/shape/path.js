/**
 * ALGO.Path
 */
ALGO.Path = function( start, end ) {
  'use strict';
  // ALGO.log( 'ALGO.Path' );
  this.moveTo( start.x, start.y );
  this.lineTo( end.x, end.y );

  ALGO.log( this.geometry );

  this.type = 'path';

  this.init();
  this.setup();
};

ALGO.Path.prototype = Object.create( ALGO.Shape.prototype );
ALGO.Path.prototype.constructor = ALGO.Path;
ALGO.Path.prototype.closed = false;

ALGO.Path.prototype.setGeometry = function(){
  /* 頂点の位置を算出 */
  // var geometry = this.geometry = [];
};

ALGO.Path.prototype.setScale = function(scale){
  if( this.m ){
    var scaleX = scale;
    var scaleY = scale;

    this.m.scale( this.matrix, [ scaleX, scaleY, 0.0 ], this.matrixScale );
    // ALGO.log( 'scale: ' + scale );
    // ALGO.log( this.matrixScale );
  }
};

ALGO.Path.prototype.moveTo = function( x, y ){
  // ALGO.log('moveTo: ' + x + ', ' + y );
  var vec2 = { x: x, y: y };
  this.geometry.push( vec2 );

  this.vertexUpdate();
};

ALGO.Path.prototype.lineTo = function( x, y ){
  // ALGO.log('lineTo: ' + x + ', ' + y );
  var vec2 = { x: x, y: y };
  this.geometry.push( vec2 );

  this.vertexUpdate();
  // ALGO.log( 'geometry: ' + this.geometry.length + ', pos: ' + this.vertexPosition.length + ', color: ' + this.vertexColors.length );
};

ALGO.Path.prototype.vertexUpdate = function(){
  this.setVertexPosition();
  this.setVertexColor( this.color, this.vertexColors );
  this.setVertexAlpha( this.alpha, this.vertexColors );
  this.setVertexColor( this.lineColor, this.vertexLineColors );
  this.setVertexAlpha( this.lineAlpha, this.vertexLineColors );
}

ALGO.Path.prototype.close = function(){
  this.closed = true;
};

