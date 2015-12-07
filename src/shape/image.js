/**
 * ALGO.Image
 */
ALGO.Image = function(_x, _y, _width, _height, _path) {
  'use strict';
  // ALGO.log( 'ALGO.Image' );
  this.path = _path;
  this.x = _x;
  this.y = _y;
  this.width = _width;
  this.height = _height;
  this.mipmap = 0;

  var that = this;

  // define
  this.width_ = _width;
  this.height_ = _height;
  this.mipmap_ = this.mipmap;
  this.color = 0xffffff;

  this.type = 'image';

  this.isLoaded = false;
  this.isAttached = false;
  this.texture = null;

  if(this.path){
    // load
    this.image = new Image();
    this.image.src = this.path;

    this.loader = new ALGO.Loader(this.path);
    this.loader.complete = function(e){
      that.complete(e);
    };
    this.loader.get();
  }

  this.init();
  this.setup();
};

ALGO.Image.prototype = Object.create( ALGO.Rectangle.prototype );
ALGO.Image.prototype.constructor = ALGO.Image;

ALGO.Image.prototype.isLoaded = false;
// ALGO.Image.prototype.isAttached = false;
ALGO.Image.prototype.texture = null;

ALGO.Image.prototype.mipmap = 0;
ALGO.Image.prototype.mipmap_ = 0;

ALGO.Image.prototype.complete = function(){
  this.isLoaded = true;
  delete this.loader;
};

ALGO.Image.prototype.getTexture = function(){
  return this.texture;
};

ALGO.Image.prototype.setTexture = function(_texture){
  this.texture = _texture;
};

ALGO.Image.prototype.setLoaded = function(_bool){
  this.isLoaded = _bool;
};

// ALGO.Image.prototype.setAttached = function(_bool){
//   this.isAttached = _bool;
// };

ALGO.Image.prototype.setScale = function(scale){
  if( this.m ){
    var scaleX = this.width * 0.5 * scale;
    var scaleY = this.height * 0.5 * -scale; // reverse

    this.m.scale( this.matrix, [ scaleX, scaleY, 0.0 ], this.matrixScale );
    // ALGO.log( 'scale: ' + scale );
    // ALGO.log( this.matrixScale );
  }
};

/**
 * Define Getter / Setter
 */
ALGO.Image.prototype.__defineGetter__('mipmap', function() {
  // ALGO.log('define getter: mipmap');
  return this.mipmap_;
});

ALGO.Image.prototype.__defineSetter__('mipmap', function(value) {
  // ALGO.log('define setter: mipmap');
  this.mipmap_ = value;
});
