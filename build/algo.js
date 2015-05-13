/*!*
 * algo.js
 *
 * JavaScript Creative Coding Framework
 * http://algojs.com
 *
 * Copyright 2015 hisa hayashi, HYS INC.
 */

/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
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
    /**
     * Child Class
     */
    render: null, // ALGO.Render
    renderer: null, // ALGO.WebGLRenderer
  };

  return ALGO;
}());

/**
 * ALGO.Circle
 */
ALGO.Circle = (function() {

  'use strict';

  ALGO.Circle = function() {
    ALGO.log('ALGO.Circle');
  };

  ALGO.Circle.prototype = {
    constructor: ALGO.Circle
  };

  return ALGO.Circle;
}());

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
 * ALGO.Matrix
 */
ALGO.Matrix = (function(ALGO) {
  'use strict';

  /**
   * Constructor
   */
  ALGO.Matrix = function(){
    // ALGO.log('ALGO.Matrix');
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

  ALGO.Matrix.prototype = {
    constructor: ALGO.Matrix,
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

  return ALGO.Matrix;
}(ALGO));

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
 * ALGO.Shape
 */
ALGO.Shape = (function() {

  'use strict';

  ALGO.Shape = function() {
    ALGO.log('ALGO.Shape');
  };

  ALGO.Shape.prototype = {
    constructor: ALGO.Shape
  };

  return ALGO.Shape;
}());

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

/**
 * ALGO.WebGLRenderer
 */
ALGO.WebGLRenderer = (function(ALGO) {
  'use strict';

  var that;
  var gl;
  var v_shader;
  var f_shader;
  var vbuffers = [];
  var ibuffer = [];
  var texture = [];
  var program;
  var uniform_vars;
  var attr_location;
  var attr_stride;
  var index;
  var point_size = 10;


  var count = 0;

  /**
   * renderer properties
   */
  var canvas;
  var background;
  var backgroundAlpha;
  var backgroundAuto;
  var depth;

  /**
   * Constructor
   */
  ALGO.WebGLRenderer = function(_that) {
    // ALGO.log('ALGO.WebGLRenderer');
    that = _that;

    updateParameter(that);
    initContext();
    setupShader();
    setupVbo();
    setupMatrix();
  };

  /**
   * Init
   */
  function initContext() {
    // webglコンテキストを取得
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    updateDepth();
    updateBackground();
    updateCanvas();
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
    setupMatrix();
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
    updateBackground();
    if (backgroundAuto) {
      updateCanvas();
    }
    drawGraphic();
  };

  /**
   * [setupShader description]
   * @return {[type]} [description]
   */
  function setupShader() {
    // ALGO.log(gl);

    // 頂点シェーダとフラグメントシェーダの生成
    v_shader = createShader('vertex');
    f_shader = createShader('fragment');
    // ALGO.log(v_shader);
    // ALGO.log(f_shader);

    // プログラムオブジェクトの生成とリンク
    program = createProgram(v_shader, f_shader);
    // ALGO.log(program);

    // attributeLocationの取得
    attr_location = [];
    attr_location[0] = gl.getAttribLocation(program, 'position');
    attr_location[1] = gl.getAttribLocation(program, 'color');
    // ALGO.log(attr_location);
  };

  /**
   * [setupVbo description]
   * @return {[type]} [description]
   */
  function setupVbo() {
    /*
    attr_location はpositionがattributeの何番目なのかを持っている
     */

    // attributeの要素数(この場合は xyz の3要素)
    attr_stride = [];
    attr_stride[0] = 3;
    attr_stride[1] = 4;

    // モデル(頂点)データ
    var vertex_position = [
         0.0,  1.0,  0.0,
         1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
         0.0, -1.0,  0.0
    ];

    // 頂点の色情報を格納する配列
    var vertex_color = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0
    ];

    // VBOの生成
    var vbo = [];
    vbo[0] = createVbo(vertex_position);
    vbo[1] = createVbo(vertex_color);
    setAttribute(vbo, attr_location, attr_stride);

    index = [
      0, 1, 2,
      1, 2, 3
    ];

    // IBOの生成
    var ibo = createIbo(index);

    // IBOをバインドして登録する
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  };

  /**
   * [setupMatrix description]
   * @return {[type]} [description]
   */
  function setupMatrix() {

    // Matrix を用いた行列関連処理
    var m = new ALGO.Matrix();

    // 各種行列の生成と初期化
    var m_matrix = m.identity(m.create());
    var v_matrix = m.identity(m.create());
    var p_matrix = m.identity(m.create());

    var tmp_matrix = m.identity(m.create());

    /* モデルビュープロジェクションのマトリックス */
    var mvp_matrix = m.identity(m.create());

    // カウンタをインクリメントする
    count += 1;
    // カウンタを元にラジアンを算出
    var rad = (count % 360) * Math.PI / 180;

    // ビュー座標変換行列
    m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], v_matrix);
    // プロジェクション座標変換行列
    m.perspective(90, canvas.width / canvas.height, 0.1, 100, p_matrix);
    // 各行列を掛け合わせ座標変換行列を完成させる
    m.multiply(p_matrix, v_matrix, tmp_matrix);

    // uniformLocationの取得
    var uni_location = [];
    uni_location[0] = gl.getUniformLocation(program, 'mvp_matrix');
    uni_location[1]  = gl.getUniformLocation(program, 'point_size');

    // 一つ目のモデルを移動するためのモデル座標変換行列
    m.identity(m_matrix);
    m.translate(m_matrix, [1.5, 0.0, 0.0], m_matrix);
    m.rotate(m_matrix, rad, [0, 1, 0], m_matrix);
    m.multiply(tmp_matrix, m_matrix, mvp_matrix);
    gl.uniformMatrix4fv(uni_location[0], false, mvp_matrix);
    // gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

    // 二つ目のモデルを移動するためのモデル座標変換行列
    m.identity(m_matrix);
    m.translate(m_matrix, [-1.5, 0.0, 0.0], m_matrix);
    m.rotate(m_matrix, -rad, [0, 1, 0], m_matrix);
    m.multiply(tmp_matrix, m_matrix, mvp_matrix);

    // uniformLocationへ座標変換行列を登録
    gl.uniformMatrix4fv(uni_location[0], false, mvp_matrix);
    gl.uniform1f(uni_location[1], point_size);
    // gl.drawArrays(gl.TRIANGLES, 0, 3);
    // gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
    // gl.drawElements(gl.POINTS, index.length, gl.UNSIGNED_SHORT, 0);
    gl.drawElements(gl.LINES, index.length, gl.UNSIGNED_SHORT, 0);

    // コンテキストの再描画
    gl.flush();
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
      attribute vec3 position;\
      attribute vec4 color;\
      uniform   mat4 mvp_matrix;\
      varying   vec4 v_color; \
      uniform float point_size;\
      \
      void main(void){\
        v_color = color;\
        gl_Position = mvp_matrix * vec4(position, 1.0);\
        gl_PointSize = point_size;\
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

  // VBOをバインドし登録する関数
  /**
   * [setAttribute description]
   * @param {[type]} vbo  [description]
   * @param {[type]} attL [description]
   * @param {[type]} attS [description]
   */
  function setAttribute(vbo, attL, attS) {
    // 引数として受け取った配列を処理する
    for (var i in vbo) {
      // バッファをバインドする
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);

      // attributeLocationを有効にする
      gl.enableVertexAttribArray(attL[i]);

      // attributeLocationを通知し登録する
      gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
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

  ALGO.WebGLRenderer.prototype = {
    constructor: ALGO.WebGLRenderer,
    update: update
  };

  return ALGO.WebGLRenderer;
}(ALGO));
