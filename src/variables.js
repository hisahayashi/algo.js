/**
 * Static Variables
 */
ALGO.debug = 1;

// Blendmode
// @see http://yomotsu.net/blog/2013/08/04/blendmode-in-webgl.html
ALGO.BLEND_NONE = 0;
ALGO.BLEND_ADD = 1;
ALGO.BLEND_MULTIPLY = 2;
ALGO.BLEND_SCREEN = 3;

/**
 * Define Getter / Setter
 */
ALGO.prototype.__defineGetter__('framerate', function() {
  // ALGO.log('define getter: framerate');
  return this.framerate_;
});

ALGO.prototype.__defineSetter__('framerate', function(value) {
  // ALGO.log('define setter: framerate');
  if (this.render) this.render.setFramerate(value);
  this.framerate_ = value;
});


// Properties
ALGO.prototype.width = 0;
ALGO.prototype.height = 0;
ALGO.prototype.blendMode = ALGO.BLEND_NONE;
ALGO.prototype.backgroundAuto = true;
ALGO.prototype.background = 0x666666;
ALGO.prototype.backgroundAlpha = 0.5;
ALGO.prototype.depth = 1.0;
ALGO.prototype.framerate = 60;
ALGO.prototype.canvas = null;