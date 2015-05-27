/*!*
 * algo.js
 *
 * JavaScript Creative Coding Framework
 * http://algojs.com
 *
 * Copyright 2015 hisa hayashi, HYS INC.
 */

var ALGO = (function () {
  'use strict';

  /**
   * Private Variables
   */
  var that;
  var params = {
    id: '',
    width: window.innerWidth,
    height: window.innerHeight,
  };
  var canvas;

  /**
   * Constructor
   */
  function ALGO(_param) {
    // ALGO.log('ALGO Constructor');
    that = this;
    params = ALGO.ObjectUtil.extend(param, _param);
    init();
  };

  /**
   * init
   */
  function init() {
    setupProperties();
    setupRender();
    addEvents();
  };

  /**
   * setupProperties
   */
  function setupProperties() {
    /**
     * setter variables
     */
    that.width = param.width;
    that.height = param.height;
    // that.framerate = ALGO.prototype.framerate;
  };

  /**
   * setupRender
   */
  function setupRender() {
    that.render = new ALGO.Render(that);
    that.render.setFramerate(that.framerate);
  };

  /**
   * setupStage
   */
  function setupStage() {
    // ALGO.log('ALGO: Setup stage.');

    // set canvas
    that.canvas = document.getElementById(params.id);
    that.canvas.width = params.width;
    that.canvas.height = params.height;
    // that.canvas = c;

    // set renderer
    that.renderer = new ALGO.WebGLRenderer(that);
  };

  /**
   * addEvents
   */
  function addEvents() {
    // ALGO.log('ALGO: Add events.');
    window.onload = function () {
      setupStage();
      if (that.setup) that.setup.call(that);
    };
    window.onmouseover = function () {
      if (that.mouseover) that.mouseover.call(that);
    };
    window.onmouseout = function () {
      if (that.mouseout) that.mouseout.call(that);
    };
    window.onmousedown = function () {
      if (that.mousedown) that.mousedown.call(that);
    };
    window.onmouseup = function () {
      if (that.mouseup) that.mouseup.call(that);
    };
    window.onmousemove = function () {
      if (that.mousemove) that.mousemove.call(that);
    };
    window.onkeydown = function () {
      if (that.keydown) that.keydown.call(that);
    };
    window.onkeyup = function () {
      if (that.keyup) that.keyup.call(that);
    };
    window.onresize = function () {
      if (that.resize) that.resize.call(that);
      // renderer
      if( that.renderer ) that.renderer.resize();
    };
    that.render.startRender();
  };

  /**
   * removeEvents
   */
  function removeEvents() {
    ALGO.log('ALGO: Remove events.');
    window.onload = null;
    window.onmouseover = null;
    window.onmouseout = null;
    window.onmousedown = null;
    window.onmouseup = null;
    window.onmousemove = null;
    window.onkeydown = null;
    window.onkeyup = null;
    window.onresize = null;
    that.render.stopRender();
  };

  /**
   * bind
   */
  function bind(name, method) {
    this[name] = method;
    that[name] = this[name];
    // save the class variable
    that = this;
  };

  function unbind(name, method) {
    this[name] = method;
    that[name] = null;
  };

  /**
   * events
   */
  function setup() {};

  function frame() {};

  function destroy() {};

  function mouseover() {};

  function mouseout() {};

  function mousedown() {};

  function mouseup() {};

  function mousemove() {};

  function keydown() {};

  function keyup() {};

  function resize() {};

  /**
   * methods
   */
  function size(w, h) {
    that.canvas.width = w;
    that.canvas.height = h;
    that.width = w;
    that.height = h;
  };

  function add( shape ){
    shape.add( that );
  };

  function remove( shape ){
    shape.remove( that );
  };

  ALGO.prototype = {
    constructor: ALGO,

    /**
     * Events
     */
    setup: setup,
    frame: frame,
    destroy: destroy,
    mouseover: mouseover,
    mouseout: mouseout,
    mousedown: mousedown,
    mouseup: mouseup,
    mousemove: mousemove,
    keydown: keydown,
    keyup: keyup,
    resize: resize,

    /**
     * Methods
     */
    bind: bind,
    unbind: unbind,
    size: size,
    add: add,
    remove: remove,

    /**
     * Child Class
     */
    render: null, // ALGO.Render
    renderer: null, // ALGO.WebGLRenderer
  };

  return ALGO;
}());

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

/**
 * Define Getter / Setter
 */
ALGO.prototype.__defineGetter__('circleResolution', function() {
  // ALGO.log('define getter: circleResolution');
  return this.circleResolution_;
});

ALGO.prototype.__defineSetter__('circleResolution', function(value) {
  // ALGO.log('define setter: circleResolution');

  /*
  更新時にALGO.Circleへの通知が必要かも
   */
  ALGO.circleResolution = value;

  this.circleResolution_ = value;
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
ALGO.prototype.circleResolution = 32;
ALGO.prototype.canvas = null;
ALGO.prototype.displayObjects = [];
ALGO.prototype.children = [];

/**
 * ALGO.Render
 */
ALGO.Render = (function() {
  'use strict';

  var that;
  var is_render = false;
  var framerate;
  var frameCount = 0;
  var fpsInterval;
  var startTime;
  var now;
  var then;
  var elapsed;

  var requestAnimation = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / framerate);
    };


  ALGO.Render = function(_that) {
    // ALGO.log('ALGO.Render');
    that = _that;
    renderInit();
  };

  /**
   * renderInit
   */
  function renderInit() {
    setupRequestAnimation();
    setupNowTime();
  };

  /**
   * setupRequestAnimation
   */
  function setupRequestAnimation() {}

  /**
   * setupNowTime
   */
  function setupNowTime() {}

  /**
   * setFramerate
   */
  function setFramerate(value) {
    framerate = value;
    fpsInterval = 1000 / framerate;
    ALGO.log('setFramerate = ' + framerate);
  };

  /**
   * getFramerate
   */
  function getFramerate() {
    return framerate;
  };

  /**
   * startRender
   */
  function startRender() {
    is_render = true;

    fpsInterval = 1000 / framerate;
    then = Date.now();
    startTime = then;

    renderUpdate();
  };

  function stopRender() {
    is_render = false;
  };

  /**
   * renderUpdate
   */
  function renderUpdate() {
    if (is_render) requestAnimation(renderUpdate);

    now = Date.now();
    elapsed = now - then;
    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {
      // Get ready for next frame by setting then=now, but also adjust for your
      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
      then = now - (elapsed % fpsInterval);

      // renderer
      if( that.renderer ) that.renderer.update();

      // drawing code
      if (that.frame) that.frame.call(that);

      // debug framerate
      var sinceStart = now - startTime;
      var currentFps = Math.round(1000 / (sinceStart / ++frameCount) * 100) / 100;
      // ALGO.log("Elapsed time= " + Math.round(sinceStart / 1000 * 100) / 100 + " secs @ " + currentFps + " fps.");
    }
  };

  ALGO.Render.prototype = {
    constructor: ALGO.Render,
    setFramerate: setFramerate,
    getFramerate: getFramerate,
    startRender: startRender,
    stopRender: stopRender
  };

  return ALGO.Render;
}());

/**
 * ALGO.Matrix3
 */
ALGO.Matrix3 = (function(ALGO) {
  'use strict';

  /**
   * Constructor
   */
  ALGO.Matrix3 = function(){
    // ALGO.log('ALGO.Matrix3');
    // return create();
  };

  /**
   * [create description]
   * @return {[type]} [description]
   */
  function create() {
    return new Float32Array(16);
  };

  /**
   * [identity description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function identity(dest) {
    dest = [
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0
    ];
    return dest;
  };

  /**
   * [multiply description]
   * @param  {[type]} mat1 [description]
   * @param  {[type]} mat2 [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function multiply(mat1, mat2, dest) {
    // var a = mat1[0] * mat2[0] + mat1[3] * mat2[1] + mat1[6] * mat2[2];
    // var b = mat1[1] * mat2[0] + mat1[4] * mat2[1] + mat1[7] * mat2[2];
    // var c = mat1[2] * mat2[0] + mat1[5] * mat2[1] + mat1[8] * mat2[2];

    // var d = mat1[0] * mat2[3] + mat1[3] * mat2[4] + mat1[6] * mat2[5];
    // var e = mat1[1] * mat2[3] + mat1[4] * mat2[4] + mat1[7] * mat2[5];
    // var f = mat1[2] * mat2[3] + mat1[5] * mat2[4] + mat1[8] * mat2[5];

    // var g = mat1[0] * mat2[6] + mat1[3] * mat2[7] + mat1[6] * mat2[8];
    // var h = mat1[1] * mat2[6] + mat1[4] * mat2[7] + mat1[7] * mat2[8];
    // var i = mat1[2] * mat2[6] + mat1[5] * mat2[7] + mat1[8] * mat2[8];

    // dest[0] = a;
    // dest[1] = b;
    // dest[2] = c;
    // dest[3] = d;
    // dest[4] = e;
    // dest[5] = f;
    // dest[6] = g;
    // dest[7] = h;
    // dest[8] = i;

    var a = mat1[0 * 3 + 0];
    var b = mat1[0 * 3 + 1];
    var c = mat1[0 * 3 + 2];

    var d = mat1[1 * 3 + 0];
    var e = mat1[1 * 3 + 1];
    var f = mat1[1 * 3 + 2];

    var g = mat1[2 * 3 + 0];
    var h = mat1[2 * 3 + 1];
    var i = mat1[2 * 3 + 2];

    var A = mat2[0 * 3 + 0];
    var B = mat2[0 * 3 + 1];
    var C = mat2[0 * 3 + 2];

    var D = mat2[1 * 3 + 0];
    var E = mat2[1 * 3 + 1];
    var F = mat2[1 * 3 + 2];

    var G = mat2[2 * 3 + 0];
    var H = mat2[2 * 3 + 1];
    var I = mat2[2 * 3 + 2];

    dest[0] = a * A + b * D + c * G;
    dest[1] = a * B + b * E + c * H;
    dest[2] = a * C + b * F + c * I;
    dest[3] = d * A + e * D + f * G;
    dest[4] = d * B + e * E + f * H;
    dest[5] = d * C + e * F + f * I;
    dest[6] = g * A + h * D + i * G;
    dest[7] = g * B + h * E + i * H;
    dest[8] = g * C + h * F + i * I;


    return dest;
  };

  /**
   * [scale description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} vec  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function scale(mat, vec, dest) {
    dest[0] = mat[0] * vec[0];
    dest[1] = mat[1];
    dest[2] = mat[2];

    dest[3] = mat[3];
    dest[4] = mat[4] * vec[1];
    dest[5] = mat[5];

    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    return dest;
  };

  /**
   * [translate description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} vec  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function translate(mat, vec, dest) {
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];

    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];

    dest[6] = mat[6] + vec[0];
    dest[7] = mat[7] + vec[1];
    dest[8] = mat[8];
    return dest;
  };

  /**
   * [rotate description]
   * @param  {[type]} mat   [description]
   * @param  {[type]} angle [description]
   * @param  {[type]} axis  [description]
   * @param  {[type]} dest  [description]
   * @return {[type]}       [description]
   */
  function rotate(mat, rad, axis, dest) {
    var c = Math.cos(rad);
    var s = Math.sin(rad);
    dest[0] = mat[0] + c;
    dest[1] = mat[1] - s;
    dest[2] = mat[2];
    dest[3] = mat[3] + s;
    dest[4] = mat[4] + c;
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    return dest;
  };


  /**
   * [transpose description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function transpose(mat, dest) {
    dest[0] = mat[0];
    dest[1] = mat[3];
    dest[2] = mat[6];
    dest[3] = mat[1];
    dest[4] = mat[4];
    dest[5] = mat[7];
    dest[6] = mat[2];
    dest[7] = mat[5];
    dest[8] = mat[8];
    return dest;
  };

  /**
   * [inverse description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function inverse(mat, dest) {
    /*
    これから書く
     */
    return dest;
  };

  ALGO.Matrix3.prototype = {
    constructor: ALGO.Matrix3,
    create: create,
    identity: identity,
    multiply: multiply,
    scale: scale,
    translate: translate,
    rotate: rotate,
    transpose: transpose,
    inverse: inverse
  };

  return ALGO.Matrix3;
}(ALGO));

/**
 * ALGO.Matrix4
 */
ALGO.Matrix4 = (function(ALGO) {
  'use strict';

  /**
   * Constructor
   */
  ALGO.Matrix4 = function(){
    // ALGO.log('ALGO.Matrix4');
    // return create();
  };

  /**
   * [create description]
   * @return {[type]} [description]
   */
  function create() {
    return new Float32Array(16);
  };

  /**
   * [identity description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function identity(dest) {
    dest[0] = 1;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = 1;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 0;
    dest[9] = 0;
    dest[10] = 1;
    dest[11] = 0;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = 0;
    dest[15] = 1;
    return dest;
  };

  /**
   * [multiply description]
   * @param  {[type]} mat1 [description]
   * @param  {[type]} mat2 [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function multiply(mat1, mat2, dest) {
    var a = mat1[0],
      b = mat1[1],
      c = mat1[2],
      d = mat1[3],
      e = mat1[4],
      f = mat1[5],
      g = mat1[6],
      h = mat1[7],
      i = mat1[8],
      j = mat1[9],
      k = mat1[10],
      l = mat1[11],
      m = mat1[12],
      n = mat1[13],
      o = mat1[14],
      p = mat1[15],
      A = mat2[0],
      B = mat2[1],
      C = mat2[2],
      D = mat2[3],
      E = mat2[4],
      F = mat2[5],
      G = mat2[6],
      H = mat2[7],
      I = mat2[8],
      J = mat2[9],
      K = mat2[10],
      L = mat2[11],
      M = mat2[12],
      N = mat2[13],
      O = mat2[14],
      P = mat2[15];
    dest[0] = A * a + B * e + C * i + D * m;
    dest[1] = A * b + B * f + C * j + D * n;
    dest[2] = A * c + B * g + C * k + D * o;
    dest[3] = A * d + B * h + C * l + D * p;
    dest[4] = E * a + F * e + G * i + H * m;
    dest[5] = E * b + F * f + G * j + H * n;
    dest[6] = E * c + F * g + G * k + H * o;
    dest[7] = E * d + F * h + G * l + H * p;
    dest[8] = I * a + J * e + K * i + L * m;
    dest[9] = I * b + J * f + K * j + L * n;
    dest[10] = I * c + J * g + K * k + L * o;
    dest[11] = I * d + J * h + K * l + L * p;
    dest[12] = M * a + N * e + O * i + P * m;
    dest[13] = M * b + N * f + O * j + P * n;
    dest[14] = M * c + N * g + O * k + P * o;
    dest[15] = M * d + N * h + O * l + P * p;
    return dest;
  };

  /**
   * [scale description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} vec  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function scale(mat, vec, dest) {
    dest[0] = mat[0] * vec[0];
    dest[1] = mat[1] * vec[0];
    dest[2] = mat[2] * vec[0];
    dest[3] = mat[3] * vec[0];
    dest[4] = mat[4] * vec[1];
    dest[5] = mat[5] * vec[1];
    dest[6] = mat[6] * vec[1];
    dest[7] = mat[7] * vec[1];
    dest[8] = mat[8] * vec[2];
    dest[9] = mat[9] * vec[2];
    dest[10] = mat[10] * vec[2];
    dest[11] = mat[11] * vec[2];
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
    return dest;
  };

  /**
   * [translate description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} vec  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function translate(mat, vec, dest) {
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    dest[9] = mat[9];
    dest[10] = mat[10];
    dest[11] = mat[11];
    dest[12] = mat[0] * vec[0] + mat[4] * vec[1] + mat[8] * vec[2] + mat[12];
    dest[13] = mat[1] * vec[0] + mat[5] * vec[1] + mat[9] * vec[2] + mat[13];
    dest[14] = mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14];
    dest[15] = mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15];
    return dest;
  };

  /**
   * [rotate description]
   * @param  {[type]} mat   [description]
   * @param  {[type]} angle [description]
   * @param  {[type]} axis  [description]
   * @param  {[type]} dest  [description]
   * @return {[type]}       [description]
   */
  function rotate(mat, angle, axis, dest) {
    var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    if (!sq) {
      return null;
    }
    var a = axis[0],
      b = axis[1],
      c = axis[2];
    if (sq != 1) {
      sq = 1 / sq;
      a *= sq;
      b *= sq;
      c *= sq;
    }
    var d = Math.sin(angle),
      e = Math.cos(angle),
      f = 1 - e,
      g = mat[0],
      h = mat[1],
      i = mat[2],
      j = mat[3],
      k = mat[4],
      l = mat[5],
      m = mat[6],
      n = mat[7],
      o = mat[8],
      p = mat[9],
      q = mat[10],
      r = mat[11],
      s = a * a * f + e,
      t = b * a * f + c * d,
      u = c * a * f - b * d,
      v = a * b * f - c * d,
      w = b * b * f + e,
      x = c * b * f + a * d,
      y = a * c * f + b * d,
      z = b * c * f - a * d,
      A = c * c * f + e;
    if (angle) {
      if (mat != dest) {
        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
      }
    } else {
      dest = mat;
    }
    dest[0] = g * s + k * t + o * u;
    dest[1] = h * s + l * t + p * u;
    dest[2] = i * s + m * t + q * u;
    dest[3] = j * s + n * t + r * u;
    dest[4] = g * v + k * w + o * x;
    dest[5] = h * v + l * w + p * x;
    dest[6] = i * v + m * w + q * x;
    dest[7] = j * v + n * w + r * x;
    dest[8] = g * y + k * z + o * A;
    dest[9] = h * y + l * z + p * A;
    dest[10] = i * y + m * z + q * A;
    dest[11] = j * y + n * z + r * A;
    return dest;
  };

  /**
   * [lookAt description]
   * @param  {[type]} eye    [description]
   * @param  {[type]} center [description]
   * @param  {[type]} up     [description]
   * @param  {[type]} dest   [description]
   * @return {[type]}        [description]
   */
  function lookAt(eye, center, up, dest) {
    var eyeX = eye[0],
      eyeY = eye[1],
      eyeZ = eye[2],
      upX = up[0],
      upY = up[1],
      upZ = up[2],
      centerX = center[0],
      centerY = center[1],
      centerZ = center[2];
    if (eyeX == centerX && eyeY == centerY && eyeZ == centerZ) {
      return identity(dest);
    }
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, l;
    z0 = eyeX - center[0];
    z1 = eyeY - center[1];
    z2 = eyeZ - center[2];
    l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= l;
    z1 *= l;
    z2 *= l;
    x0 = upY * z2 - upZ * z1;
    x1 = upZ * z0 - upX * z2;
    x2 = upX * z1 - upY * z0;
    l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!l) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      l = 1 / l;
      x0 *= l;
      x1 *= l;
      x2 *= l;
    }
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!l) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      l = 1 / l;
      y0 *= l;
      y1 *= l;
      y2 *= l;
    }
    dest[0] = x0;
    dest[1] = y0;
    dest[2] = z0;
    dest[3] = 0;
    dest[4] = x1;
    dest[5] = y1;
    dest[6] = z1;
    dest[7] = 0;
    dest[8] = x2;
    dest[9] = y2;
    dest[10] = z2;
    dest[11] = 0;
    dest[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
    dest[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
    dest[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
    dest[15] = 1;
    return dest;
  };

  /**
   * [perspective description]
   * @param  {[type]} fovy   [description]
   * @param  {[type]} aspect [description]
   * @param  {[type]} near   [description]
   * @param  {[type]} far    [description]
   * @param  {[type]} dest   [description]
   * @return {[type]}        [description]
   */
  function perspective(fovy, aspect, near, far, dest) {
    var t = near * Math.tan(fovy * Math.PI / 360);
    var r = t * aspect;
    var a = r * 2,
      b = t * 2,
      c = far - near;
    dest[0] = near * 2 / a;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = near * 2 / b;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 0;
    dest[9] = 0;
    dest[10] = -(far + near) / c;
    dest[11] = -1;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = -(far * near * 2) / c;
    dest[15] = 0;
    return dest;
  };

  /**
   * [transpose description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function transpose(mat, dest) {
    dest[0] = mat[0];
    dest[1] = mat[4];
    dest[2] = mat[8];
    dest[3] = mat[12];
    dest[4] = mat[1];
    dest[5] = mat[5];
    dest[6] = mat[9];
    dest[7] = mat[13];
    dest[8] = mat[2];
    dest[9] = mat[6];
    dest[10] = mat[10];
    dest[11] = mat[14];
    dest[12] = mat[3];
    dest[13] = mat[7];
    dest[14] = mat[11];
    dest[15] = mat[15];
    return dest;
  };

  /**
   * [inverse description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function inverse(mat, dest) {
    var a = mat[0],
      b = mat[1],
      c = mat[2],
      d = mat[3],
      e = mat[4],
      f = mat[5],
      g = mat[6],
      h = mat[7],
      i = mat[8],
      j = mat[9],
      k = mat[10],
      l = mat[11],
      m = mat[12],
      n = mat[13],
      o = mat[14],
      p = mat[15],
      q = a * f - b * e,
      r = a * g - c * e,
      s = a * h - d * e,
      t = b * g - c * f,
      u = b * h - d * f,
      v = c * h - d * g,
      w = i * n - j * m,
      x = i * o - k * m,
      y = i * p - l * m,
      z = j * o - k * n,
      A = j * p - l * n,
      B = k * p - l * o,
      ivd = 1 / (q * B - r * A + s * z + t * y - u * x + v * w);
    dest[0] = (f * B - g * A + h * z) * ivd;
    dest[1] = (-b * B + c * A - d * z) * ivd;
    dest[2] = (n * v - o * u + p * t) * ivd;
    dest[3] = (-j * v + k * u - l * t) * ivd;
    dest[4] = (-e * B + g * y - h * x) * ivd;
    dest[5] = (a * B - c * y + d * x) * ivd;
    dest[6] = (-m * v + o * s - p * r) * ivd;
    dest[7] = (i * v - k * s + l * r) * ivd;
    dest[8] = (e * A - f * y + h * w) * ivd;
    dest[9] = (-a * A + b * y - d * w) * ivd;
    dest[10] = (m * u - n * s + p * q) * ivd;
    dest[11] = (-i * u + j * s - l * q) * ivd;
    dest[12] = (-e * z + f * x - g * w) * ivd;
    dest[13] = (a * z - b * x + c * w) * ivd;
    dest[14] = (-m * t + n * r - o * q) * ivd;
    dest[15] = (i * t - j * r + k * q) * ivd;
    return dest;
  };

  ALGO.Matrix4.prototype = {
    constructor: ALGO.Matrix4,
    create: create,
    identity: identity,
    multiply: multiply,
    scale: scale,
    translate: translate,
    rotate: rotate,
    lookAt: lookAt,
    perspective: perspective,
    transpose: transpose,
    inverse: inverse
  };

  return ALGO.Matrix4;
}(ALGO));

/**
 * ALGO.ShapeCtrl
 */
ALGO.ShapeCtrl = {

  createID: function( _ary, _length ){
    var strings = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var length = ( _length )? _length: 12;
    var id = '';
    for( var i = 0; i < length; i++ ){
      var c_length = strings.length;
      var c_index = Math.floor( Math.random() * c_length );
      id += strings.charAt( c_index );
    }
    if( _ary.indexOf( id ) > -1 ){
      arguments.callee( _ary, _length );
    }
    return id;
  }

};

/**
 * ALGO.Shape
 */
ALGO.Shape = (function() {
  'use strict';

  /**
   * Private Variables
   */
  ALGO.Shape = function(_x, _y, _radius) {
    // ALGO.log('ALGO.Shape');
    this.x = _x;
    this.y = _y;
    this.radius = _radius;

    // define
    this.radius_ = _radius;

    this.init();
    this.setup();
  };

  /**
   * [init description]
   * @return {[type]} [description]
   */
  function init() {
    this.vertexPosition = [];
    this.vertexColors = [];
    this.index = [];

    // set matrix
    this.m = new ALGO.Matrix3();
    this.matrix = this.m.identity(this.m.create());
    this.matrixScale = this.m.identity(this.m.create());
    this.matrixRotate = this.m.identity(this.m.create());
    this.matrixTranslate = this.m.identity(this.m.create());
  };

  /**
   * [setup description]
   * @return {[type]} [description]
   */
  function setup(){
    var radius = this.radius;
    var vp = [
      0, -radius,
      -radius, radius,
      radius, radius
    ];
    var vc = [
      0, 0, 0, 1,
      0, 0, 0, 1,
      0, 0, 0, 1
    ];
    var index = [
      0, 1, 2
    ];
    this.vertexPosition = vp;
    this.vertexColors = vc;
    this.index = index;
  };

  /**
   * [add description]
   * @param {[type]} root [description]
   */
  function add(root) {
    if (!this.id) {
      this.id = ALGO.ShapeCtrl.createID(root.displayObjects, 8);
    }
    root.displayObjects.push(this.id);
    root.children.push(this);
  };

  /**
   * [remove description]
   * @param  {[type]} root [description]
   * @return {[type]}      [description]
   */
  function remove(root) {
    var object_index = root.displayObjects.indexOf(id);
    if (object_index > -1) {
      root.displayObjects.splice(object_index, 1);
      root.children.splice(object_index, 1);
      // ALGO.log(this);
    }
  };

  /**
   * [clone description]
   * @return {[type]} [description]
   */
  function clone() {};

  /**
   * [clone description]
   * @return {[type]} [description]
   */
  function setVertexColor(color) {
    var vc = this.vertexColors;
    var length = vc.length;
    var cl = ALGO.ColorUtil.hexToRgbNormalize(color);

    for (var i = 0; i < length; i += 4) {
      vc[i] = cl.r;
      vc[i + 1] = cl.g;
      vc[i + 2] = cl.b;
    }
  };

  function setVertexAlpha(alpha) {
    var vc = this.vertexColors;
    var length = vc.length;

    for (var i = 0; i < length; i += 4) {
      vc[i + 3] = alpha;
    }
  };

  function setScale(scale){
    if( this.m ){
      this.m.scale( this.matrix, [ scale, scale, 0.0 ], this.matrixScale );
      // ALGO.log( 'scale: ' + scale );
      // ALGO.log( this.matrixScale );
    }
  };

  function setRotate(rotate){
    if( this.m ){
      var rad = rotate * Math.PI / 180;
      this.m.rotate( this.matrix, rad, [ 0, 1, 0 ], this.matrixRotate );
      // ALGO.log( 'rotate: ' + rotate );
      // ALGO.log( this.matrixRotate );
    }
  };

  function setTranslate( x, y ){
    if( this.m ){
      this.m.translate( this.matrix, [ x, y, 0 ], this.matrixTranslate );
      // ALGO.log( 'xy: ' + x + ', ' + y );
      // ALGO.log( this.matrixTranslate );
    }
  };

  function getMatrix(){
    var tmpMatrix = null;
    if( this.m ){
      tmpMatrix = this.m.identity( this.m.create() );
      this.m.multiply( this.matrix, this.matrixScale, tmpMatrix );
      this.m.multiply( tmpMatrix, this.matrixRotate, tmpMatrix );
      this.m.multiply( tmpMatrix, this.matrixTranslate, tmpMatrix );
      // ALGO.log( tmpMatrix );
    }
    return tmpMatrix;
  };

  ALGO.Shape.prototype = {
    constructor: ALGO.Shape,
    /**
     * Property
     */
    name: '',
    type: 'shape',
    id: null,
    x: 0,
    y: 0,
    width: null,
    height: null,
    angles: 3,
    radius: null,
    alpha: 1.0,
    visible: true,
    color: 0xffffff,
    scale: 1,
    rotate: 0,
    parent: undefined,
    m: undefined,
    matrix: undefined,
    matrixScale: undefined,
    matrixRotate: undefined,
    matrixTranslate: undefined,
    children: [],
    geometry: [],
    vertexPosition: [],
    vertexColors: [],
    needsUpdate: false,
    index: [],

    /**
     * define getter/setter
     */
    x_: 0,
    y_: 0,
    scale_: 1,
    rotate_: 0,
    radius_: null,
    color_: 0xffffff,
    alpha_: 1.0,
    angle_: 3,
    needsUpdate_: false,

    /**
     * Method
     */
    init: init,
    setup: setup,
    add: add,
    remove: remove,
    clone: clone,

    /**
     * Private Method
     */
    setVertexColor: setVertexColor,
    setVertexAlpha: setVertexAlpha,
    setScale: setScale,
    setRotate: setRotate,
    setTranslate: setTranslate,
    getMatrix: getMatrix
  };

  return ALGO.Shape;
}());


/**
 * Define Getter / Setter
 */
ALGO.Shape.prototype.__defineGetter__('x', function() {
  // ALGO.log('define getter: x');
  return this.x_;
});

ALGO.Shape.prototype.__defineSetter__('x', function(value) {
  // ALGO.log('define setter: x');
  this.x_ = value;
  this.setTranslate( this.x, this.y );
});

ALGO.Shape.prototype.__defineGetter__('y', function() {
  // ALGO.log('define getter: y');
  return this.y_;
});

ALGO.Shape.prototype.__defineSetter__('y', function(value) {
  // ALGO.log('define setter: y');
  this.y_ = value;
  this.setTranslate( this.x, this.y );
});

ALGO.Shape.prototype.__defineGetter__('scale', function() {
  // ALGO.log('define getter: scale');
  return this.scale_;
});

ALGO.Shape.prototype.__defineSetter__('scale', function(value) {
  // ALGO.log('define setter: scale');
  this.setScale( value );
  this.scale_ = value;
});

ALGO.Shape.prototype.__defineGetter__('rotate', function() {
  // ALGO.log('define getter: rotate');
  return this.rotate_;
});

ALGO.Shape.prototype.__defineSetter__('rotate', function(value) {
  // ALGO.log('define setter: rotate');
  this.setRotate( value );
  this.rotate_ = value;
});

ALGO.Shape.prototype.__defineGetter__('radius', function() {
  // ALGO.log('define getter: radius');
  return this.radius_;
});

ALGO.Shape.prototype.__defineSetter__('radius', function(value) {
  // ALGO.log('define setter: radius');
  this.radius_ = value;
});

ALGO.Shape.prototype.__defineGetter__('color', function() {
  // ALGO.log('define getter: color');
  return this.color_;
});

ALGO.Shape.prototype.__defineSetter__('color', function(value) {
  // ALGO.log('define setter: color');
  this.setVertexColor(value);
  this.color_ = value;
});

ALGO.Shape.prototype.__defineGetter__('alpha', function() {
  // ALGO.log('define getter: alpha');
  return this.alpha_;
});

ALGO.Shape.prototype.__defineSetter__('alpha', function(value) {
  // ALGO.log('define setter: alpha');
  this.setVertexAlpha(value);
  this.alpha_ = value;
});

ALGO.Shape.prototype.__defineGetter__('angle', function() {
  // ALGO.log('define getter: angle');
  return this.angle_;
});

ALGO.Shape.prototype.__defineSetter__('angle', function(value) {
  // ALGO.log('define setter: angle');
  this.angle_ = value;
});

ALGO.Shape.prototype.__defineGetter__('needsUpdate', function() {
  // ALGO.log('define getter: needsUpdate');
  return this.needsUpdate_;
});

ALGO.Shape.prototype.__defineSetter__('needsUpdate', function(value) {
  // ALGO.log('define setter: needsUpdate');
  this.needsUpdate_ = value;
});

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

/**
 * ALGO.WebGLRenderer
 */
ALGO.WebGLRenderer = (function(ALGO) {
  'use strict';

  var that;
  var gl;
  var vbuffers = [];
  var ibuffer = [];
  var texture = [];
  var program;
  var uniform_vars;
  var attr_location;
  var attr_stride;
  var point_size = 10;

  var cw, ch;
  var sw, sh;
  var sx, sy;

  var m;
  var v_matrix;
  var p_matrix;
  var tmp_matrix;
  var mvp_matrix;
  var uni_location;

  var zoom = 5.0;

  var object_vbo = [];
  var object_ibo = [];
  var object_index = [];

  /**
   * renderer properties
   */
  var canvas;
  var background;
  var backgroundAlpha;
  var backgroundAuto;
  var depth;
  var children;
  var displayObjects;

  /**
   * Constructor
   */
  ALGO.WebGLRenderer = function(_that) {
    // ALGO.log('ALGO.WebGLRenderer');
    that = _that;

    updateParameter(that);



    // webglコンテキストを取得
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // 頂点シェーダとフラグメントシェーダの生成
    var v_shader = createShader('vertex');
    var f_shader = createShader('fragment');

    // プログラムオブジェクトの生成とリンク
    program = createProgram(v_shader, f_shader);




    // // Matrix を用いた行列関連処理
    // m = new ALGO.Matrix4();

    // // 各種行列の生成と初期化
    // v_matrix = m.identity(m.create());
    // p_matrix = m.identity(m.create());

    // tmp_matrix = m.identity(m.create());

    // /* モデルビュープロジェクションのマトリックス */
    // mvp_matrix = m.identity(m.create());

    resize();

    // uniformLocationの取得
    uni_location = {};
    uni_location.position = gl.getUniformLocation(program, 'position2d');
    uni_location.matrix = gl.getUniformLocation(program, 'matrix2d');
    uni_location.color = gl.getUniformLocation(program, 'color');
    uni_location.point_size = gl.getUniformLocation(program, 'point_size');


    // attributeLocationの取得
    attr_location = {};
    attr_location.position = gl.getAttribLocation(program, 'position2d');
    attr_location.color = gl.getAttribLocation(program, 'color');

    /*
    attr_location はpositionがattributeの何番目なのかを持っている
    attributeの要素数(この場合は xyz の3要素)
     */
    attr_stride = {};
    attr_stride.position = 2; // vertex
    attr_stride.color = 4; // index

    render();

    // gl.viewport( 0, 0, screen.width, screen.height );
    // gl.flush();
    // gl.viewport( 0, 0, canvas.width, canvas.height );
  };


  function make2DProjection(width, height) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ];
  }


  /**
   * Init
   */
  function render() {

    var pm = new ALGO.Matrix3();
    var projectionMatrix = make2DProjection(cw, ch);

    for (var i = 0; i < children.length; i++) {

      var object = children[i];
      var needsUpdate = object.needsUpdate;

      // VBOの生成
      if( !object_vbo[i] || needsUpdate ){
        // モデル(頂点)データ
        var vertex_position = object.vertexPosition;
        // 頂点の色情報を格納する配列
        var vertex_color = object.vertexColors;
        // Set Geometry
        var vbo = [];
        vbo.position = createVbo(vertex_position);
        vbo.color = createVbo(vertex_color);
        object_vbo[i] = vbo;

      }

      setVBOAttribute( object_vbo[i], attr_location, attr_stride);


      if( !object_ibo[i] || needsUpdate ){
        var index = object.index;
        // IBOの生成
        var ibo = createIbo(index);

        object_index[i] = index;
        object_ibo[i] = ibo;
      }

      // IBOをバインドして登録する
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object_ibo[i]);

      var objectMatrix = object.getMatrix();
      var matrix2 = pm.multiply(objectMatrix, projectionMatrix, [] );

      if( i == 0 ){
        // ALGO.log( matrix2 );
        // ALGO.log( '' );
      }

      // Set the matrix.
      gl.uniformMatrix3fv(uni_location.matrix, false, matrix2);

      if( needsUpdate ){
        object.needsUpdate = false;
      }

      // gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.drawElements(gl.TRIANGLES, object_index[i].length, gl.UNSIGNED_SHORT, 0);


      // object.x;
      // object.y;
      // object.width;
      // object.height;
      // object.rotate;
      // object.scale;
      /*
            // 一つ目のモデルを移動するためのモデル座標変換行列
            m.identity(m_matrix);
            // m.translate(m_matrix, [ x, y, 0.0], m_matrix);
            // m.scale(m_matrix, [3.0, 3.0, 3.0], m_matrix);
            // m.rotate(m_matrix, rad, [0, 1, 0], m_matrix);
            m.multiply(tmp_matrix, m_matrix, mvp_matrix);
            gl.uniformMatrix4fv(uni_location.position, false, mvp_matrix);
            // gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
            */

    }

    // コンテキストの再描画
    gl.flush();

  };

  /**
   * [resize description]
   * @return {[type]} [description]
   */
  function resize() {
    cw = canvas.width;
    ch = canvas.height;

    // m.identity(v_matrix);
    // m.identity(p_matrix);
    // m.identity(tmp_matrix);
    // m.identity(mvp_matrix);

    // // ビュー座標変換行列
    // m.lookAt([0.0, 0.0, zoom], [0, 0, 0], [0, 1, 0], v_matrix);
    // // プロジェクション座標変換行列
    // m.perspective(90, canvas.width / canvas.height, 0.01, 1000, p_matrix);
    // // 各行列を掛け合わせ座標変換行列を完成させる
    // m.multiply(p_matrix, v_matrix, tmp_matrix);

    var resolution_location = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolution_location, canvas.width, canvas.height);

    gl.viewport(0, 0, cw, ch);
  };

  /**
   * [update description]
   * @return {[type]} [description]
   */
  function update() {
    // gl.drawingBufferWidth = that.width;
    // gl.drawingBufferHeight = that.height;

    updateParameter(that);
    updateDepth();

    if (backgroundAuto) {
      updateBackground();
      updateCanvas();
    }

    drawGraphic();
  };

  /**
   * [updateParameter description]
   * @param  {[type]} that [description]
   * @return {[type]}      [description]
   */
  function updateParameter(that) {
    canvas = that.canvas;
    background = that.background;
    backgroundAlpha = that.backgroundAlpha;
    backgroundAuto = that.backgroundAuto;
    depth = that.depth;
    children = that.children;
    displayObjects = that.displayObjects;

    // ALGO.log( that.children );
    // ALGO.log( that.displayObjects );
  };

  /**
   * [updateDepth description]
   * @return {[type]} [description]
   */
  function updateDepth() {
    // canvasを初期化する際の深度を設定する
    gl.clearDepth(depth);
  };

  /**
   * [updateBackground description]
   * @return {[type]} [description]
   */
  function updateBackground() {
    // canvasを初期化する色を設定する
    var color_n = ALGO.ColorUtil.hexToRgbNormalize(background);
    gl.clearColor(color_n.r, color_n.g, color_n.b, backgroundAlpha);
  };

  /**
   * [updateCanvas description]
   * @return {[type]} [description]
   */
  function updateCanvas() {
    // canvasを初期化
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  };

  /**
   * [drawGraphic description]
   * @return {[type]} [description]
   */
  function drawGraphic() {
    render();
  };

  // シェーダを生成する関数
  /**
   * [create_shader description]
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  function createShader(type) {
    // シェーダを格納する変数
    var shader;
    var shader_script = '';
    if (type == 'vertex') {
      shader_script = '\
      attribute vec2 position2d;\
      uniform mat3 matrix2d;\
      uniform vec2 u_resolution;\
      attribute vec4 color;\
      varying   vec4 v_color; \
      uniform float point_size;\
      \
      void main(void){\
        v_color = color;\
        gl_PointSize = point_size;\
        \
        gl_Position = vec4((matrix2d * vec3(position2d, 1)).xy, 0, 1);\
      }';
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (type == 'fragment') {
      shader_script = '\
      precision mediump float;\
      varying vec4 v_color;\
      \
      void main(void){\
        gl_FragColor = v_color;\
      }';
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    // 生成されたシェーダにソースを割り当てる
    gl.shaderSource(shader, shader_script);

    // シェーダをコンパイルする
    gl.compileShader(shader);

    // シェーダが正しくコンパイルされたかチェック
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      // 成功していたらシェーダを返して終了
      return shader;
    } else {
      // 失敗していたらエラーログをアラートする
      alert(gl.getShaderInfoLog(shader));
    }
  };


  // プログラムオブジェクトを生成しシェーダをリンクする関数
  /**
   * [createProgram description]
   * @param  {[type]} vs [description]
   * @param  {[type]} fs [description]
   * @return {[type]}    [description]
   */
  function createProgram(vs, fs) {
    // プログラムオブジェクトの生成
    var program = gl.createProgram();

    // プログラムオブジェクトにシェーダを割り当てる
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    // シェーダをリンク
    gl.linkProgram(program);

    // シェーダのリンクが正しく行なわれたかチェック
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {

      // 成功していたらプログラムオブジェクトを有効にする
      gl.useProgram(program);

      // プログラムオブジェクトを返して終了
      return program;
    } else {

      // 失敗していたらエラーログをアラートする
      alert(gl.getProgramInfoLog(program));
    }
  };

  // VBOを生成する関数
  function createVbo(data) {
    // バッファオブジェクトの生成
    var vbo = gl.createBuffer();

    // バッファをバインドする
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

    // バッファにデータをセット
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    // バッファのバインドを無効化
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // 生成した VBO を返して終了
    return vbo;
  };

  // IBOを生成する関数
  /**
   * [create_ibo description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  function createIbo(data) {
    // バッファオブジェクトの生成
    var ibo = gl.createBuffer();
    // バッファをバインドする
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    // バッファにデータをセット
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    // バッファのバインドを無効化
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    // 生成したIBOを返して終了
    return ibo;
  };

  // VBOをバインドし登録する関数
  /**
   * [setVBOAttribute description]
   * @param {[type]} vbo  [description]
   * @param {[type]} attL [description]
   * @param {[type]} attS [description]
   */
  function setVBOAttribute(vbo, attL, attS) {
    // 引数として受け取った配列を処理する
    for (var key in vbo) {
      // バッファをバインドする
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo[key]);

      // attributeLocationを有効にする
      gl.enableVertexAttribArray(attL[key]);

      // attributeLocationを通知し登録する
      gl.vertexAttribPointer(attL[key], attS[key], gl.FLOAT, false, 0, 0);
    }
  };

  ALGO.WebGLRenderer.prototype = {
    constructor: ALGO.WebGLRenderer,
    update: update,
    resize: resize,
  };

  return ALGO.WebGLRenderer;
}(ALGO));

/**
 * ALGO.log
 */
ALGO.log = function(obj) {
  if (window.console && window.console.log) {
    if (ALGO.debug) window.console.log(obj);
  }
};

/**
 * ALGO.warn
 */
ALGO.warn = function(obj) {
  if (window.console && window.console.warn) {
    if (ALGO.debug) window.console.warn(obj);
  }
};

/**
 * ALGO.error
 */
ALGO.error = function(obj) {
  if (window.console && window.console.error) {
    if (ALGO.debug) window.console.error(obj);
  }
};

/**
 * ALGO.PointUtil
 */
ALGO.PointUtil = {

  /**
   * [normalize description]
   * @param  {[type]} point [description]
   * @param  {[type]} scale [description]
   * @return {[type]}       [description]
   */
  normalize: function(point, scale) {
    var norm = Math.sqrt(point.x * point.x + point.y * point.y);
    if (norm != 0) { // as3 return 0,0 for a point of zero length
      point.x = scale * point.x / norm;
      point.y = scale * point.y / norm;
    }
  },

  /**
   * [normalize3 description]
   * @param  {[type]} p     [description]
   * @param  {[type]} scale [description]
   * @return {[type]}       [description]
   */
  normalize3: function(p, scale) {
    var norm = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
    if (norm != 0) { // as3 return 0,0 for a point of zero length
      p.x = scale * p.x / norm;
      p.y = scale * p.y / norm;
      p.z = scale * p.z / norm;
    }
    return p;
  },

  /**
   * [pointLength3 description]
   * @param  {[type]} p [description]
   * @return {[type]}   [description]
   */
  pointLength3: function(p) {
    return Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
  },

  /**
   * [getDistance description]
   * @param  {[type]} p1 [description]
   * @param  {[type]} p2 [description]
   * @return {[type]}    [description]
   */
  getDistance: function(p1, p2) {
    var nX = p2.x - p1.x;
    var nY = p2.y - p1.y;
    return Math.sqrt(nX * nX + nY * nY);
  },

  // 2点間の傾きを求める
  /**
   * [getSlope description]
   * @param  {[type]} p1 [description]
   * @param  {[type]} p2 [description]
   * @return {[type]}    [description]
   */
  getSlope: function(p1, p2) {
    return (p2.y - p1.y) / (p2.x - p1.x);
  },

  // 2点間の切片を求める
  /**
   * [getIntercept description]
   * @param  {[type]} p1 [description]
   * @param  {[type]} p2 [description]
   * @param  {[type]} a  [description]
   * @return {[type]}    [description]
   */
  getIntercept: function(p1, p2, a) {
    var x = (p1.x + p2.x);
    var y = (p1.y + p2.y);
    return y / 2 - (a * x) / 2;
  },

  // 2点間の中点を求める
  /**
   * [getMidpoint description]
   * @param  {[type]} p1 [description]
   * @param  {[type]} p2 [description]
   * @return {[type]}    [description]
   */
  getMidpoint: function(p1, p2) {
    var p = [];
    p.x = (p1.x + p2.x) / 2;
    p.y = (p1.y + p2.y) / 2;
    return p;
  },

  // 2点から垂直二等分線を求める
  /**
   * [getMidperpendicular description]
   * @param  {[type]} p1 [description]
   * @param  {[type]} p2 [description]
   * @return {[type]}    [description]
   */
  getMidperpendicular: function(p1, p2) {

    // 傾きを調べる
    var a = getSlope(p1, p2);

    // 垂直二等分線の傾き
    if (checkEQ(a)) {
      x = 1.0;
    } else {
      x = -1.0 / a;
    }

    // 線の中点
    var mp = getMidpoint(p1, p2);

    // 切片を求める
    if (checkEQ(a)) {
      y = 0;
    } else {
      y = mp.y - x * mp.x;
    }

    return {
      x: x,
      y: y
    }
  },

  // 3点から外接円を求める、引数特殊なので注意
  /**
   * [getThroughPoint3 description]
   * @param  {[type]} _p1 [description]
   * @param  {[type]} _p2 [description]
   * @param  {[type]} _p3 [description]
   * @return {[type]}     [description]
   */
  getThroughPoint3: function(_p1, _p2, _p3) {

    // 二等分線を作成
    var p1 = getMidperpendicular(_p1, _p2);
    var p2 = getMidperpendicular(_p1, _p3);

    // 中心を算出
    var center = [];
    center.x = (p2.y - p1.y) / (p1.x - p2.x);
    center.y = p1.x * center.x + p1.y;

    // 半径を算出
    var rad = Math.sqrt(Math.pow(center.x - _p1.x, 2) + Math.pow(center.y - _p1.y, 2));

    return {
      x: center.x,
      y: center.y,
      rad: rad
    }
  },

  // 3点から外接円を求める、引数特殊なので注意
  /**
   * [getHugeTriangle description]
   * @param  {[type]} _p1 [description]
   * @param  {[type]} _p2 [description]
   * @param  {[type]} _p3 [description]
   * @return {[type]}     [description]
   */
  getHugeTriangle: function(_p1, _p2, _p3) {
    var obj = getThroughPoint3(_p1, _p2, _p3);

    var x1 = obj.x - Math.sqrt(3) * obj.rad;
    var y1 = obj.y - obj.rad;
    var x2 = obj.x + Math.sqrt(3) * obj.rad;
    var y2 = obj.y - obj.rad;
    var x3 = obj.x;
    var y3 = obj.y + 2 * obj.rad;
    return [{
      x: x1,
      y: y1
    }, {
      x: x2,
      y: y2
    }, {
      x: x3,
      y: y3
    }]
  },

  // 直線上の点かどうか判定
  /**
   * [checkEQ description]
   * @param  {[type]} x [description]
   * @return {[type]}   [description]
   */
  checkEQ: function(x) {
    var eps = 0.000001;
    return -eps <= x && x <= eps;
  }
};

/**
 * ALGO.StringUtil
 */
ALGO.StringUtil = {

  /**
   * [zeroPadding description]
   * @param  {[type]} number [description]
   * @param  {[type]} length [description]
   * @return {[type]}        [description]
   */
  zeroPadding: function (number, length) {
    return (Array(length).join('0') + number).slice(-length);
  },

  /**
   * [numComma description]
   * @param  {[type]} num [description]
   * @return {[type]}     [description]
   */
  numComma: function (num) {
    return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  },

  /**
   * [separate description]
   * @param  {[type]} num [description]
   * @return {[type]}     [description]
   */
  separate: function (num) {
    return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  }
};

/**
 * ALGO.ObjectUtil
 */
ALGO.ObjectUtil = {

  /**
   * [extend description]
   * @param  {[type]} base_obj [description]
   * @param  {[type]} over_obj [description]
   * @return {[type]}          [description]
   */
  extend: function ( base_obj, over_obj ) {
    var new_obj = ALGO.ObjectUtil.clone( base_obj );
    for( key in over_obj ){
      var value = ( over_obj[ key ] )? over_obj[ key ] : base_obj[ key ];
      base_obj[ key ] = value;
    }
    return base_obj;
  },

  /**
   * [clone description]
   * @param  {[type]} obj [description]
   * @return {[type]}     [description]
   */
  clone: function ( obj ) {
    var new_obj = {};
    for( key in obj ){
      new_obj[ key ] = obj[ key ];
    }
    return new_obj;
  }


};

/**
 * ALGO.ColorUtil
 */
ALGO.ColorUtil = {

  /**
   * [rgbToHex description]
   * @param  {[type]} r [description]
   * @param  {[type]} g [description]
   * @param  {[type]} b [description]
   * @return {[type]}   [description]
   */
  rgbToHex: function (r, g, b) {
    r = Math.floor( r );
    g = Math.floor( g );
    b = Math.floor( b );
    var hex = ( r << 16 ) + ( g << 8 ) + b;
    return '0x' + hex.toString(16);
  },

  /**
   * [hexToRgb description]
   * @param  {[type]} hex [description]
   * @return {[type]}     [description]
   */
  hexToRgb: function ( hex ) {
    hex = hex.toString(16).replace('#', '').replace('0x', '');
    hex = '0x' + hex;
    var obj = {
      r: hex >> 16,
      g: hex >> 8 & 0xff,
      b: hex & 0xff,
    };
    return obj;
  },

  /**
   * [hexToRgb description]
   * @param  {[type]} hex [description]
   * @return {[type]}     [description]
   */
  hexToRgbNormalize: function ( hex ) {
    var obj = ALGO.ColorUtil.hexToRgb( hex );
    obj.r = obj.r / 256;
    obj.g = obj.g / 256;
    obj.b = obj.b / 256;
    return obj;
  },

};

/**
 * ALGO.Util
 */
ALGO.Util = {
  /**
   * [browserLanguage description]
   * @return {[type]} [description]
   */
  getBrowserLang: function () {
    var ua = window.navigator.userAgent.toLowerCase();
    try {
      // chrome
      if (ua.indexOf('chrome') != -1) {
        return (navigator.languages[0] || navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0, 2);
      }
      // others
      else {
        return (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0, 2);
      }
    } catch (e) {
      return undefined;
    }
  },

  /**
   * [isSmartDevice description]
   * @return {Boolean} [description]
   */
  isSmartDevice: function () {
    var ua = navigator.userAgent;
    var flag = false;

    if ((ua.indexOf('iPhone') > 0 && ua.indexOf('iPad') == -1) || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
      flag = 'smartphone';
    } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
      flag = 'tablet';
    }
    return flag;
  },

  /**
   * [getOS description]
   * @return {[type]} [description]
   */
  getOS: function () {
    var os;
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/win/)) {
      os = "win";
    } else if (ua.match(/mac|ppc/)) {
      os = "mac";
    } else if (ua.match(/linux/)) {
      os = "linux";
    } else {
      os = "other";
    }
    return os;
  },

  /**
   * [getBrowser description]
   * @return (ie6、ie7、ie8、ie9、ie10、ie11、chrome、safari、opera、firefox、unknown)
   */
  getBrowser: function () {
    var ua = window.navigator.userAgent.toLowerCase();
    var ver = window.navigator.appVersion.toLowerCase();
    var name = 'unknown';

    if (ua.indexOf("msie") != -1) {
      if (ver.indexOf("msie 6.") != -1) {
        name = 'ie6';
      } else if (ver.indexOf("msie 7.") != -1) {
        name = 'ie7';
      } else if (ver.indexOf("msie 8.") != -1) {
        name = 'ie8';
      } else if (ver.indexOf("msie 9.") != -1) {
        name = 'ie9';
      } else if (ver.indexOf("msie 10.") != -1) {
        name = 'ie10';
      } else {
        name = 'ie';
      }
    } else if (ua.indexOf('trident/7') != -1) {
      name = 'ie11';
    } else if (ua.indexOf('chrome') != -1) {
      name = 'chrome';
    } else if (ua.indexOf('safari') != -1) {
      name = 'safari';
    } else if (ua.indexOf('opera') != -1) {
      name = 'opera';
    } else if (ua.indexOf('firefox') != -1) {
      name = 'firefox';
    }
    return name;
  },

  /**
   * [isSupported description]
   * @param  {[type]}  browsers [description]
   * @return {Boolean}          [description]
   */
  isSupported: function (browsers) {
    var thusBrowser = getBrowser();
    for (var i = 0; i < browsers.length; i++) {
      if (browsers[i] == thusBrowser) {
        return true;
        exit;
      }
    }
    return false;
  },

  /**
   * [getQuery description]
   * @return {[type]} [description]
   */
  getQuery: function () {
    var query = window.location.search.substring(1);
    var parms = query.split('&');
    var p = {};

    for (var i = 0; i < parms.length; i++) {
      var pos = parms[i].indexOf('=');
      if (pos > 0) {
        var key = parms[i].substring(0, pos);
        var val = parms[i].substring(pos + 1);
        p[key] = val;
      }
    }
    return p;
  }

};
