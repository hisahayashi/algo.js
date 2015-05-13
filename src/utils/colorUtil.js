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