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
