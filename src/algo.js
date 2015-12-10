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
    backgroundAuto: true
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
    addReady();
  };

  /**
   * setupProperties
   */
  function setupProperties() {
    /**
     * setter variables
     */
    that.width = params.width;
    that.height = params.height;
    that.backgroundAuto = param.backgroundAuto;
    // that.framerate = ALGO.prototype.framerate;

    ALGO.log( that );
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
  function addReady() {
    // ALGO.log('ALGO: Add events.');
    window.onload = function () {
      setupStage();
      if (that.setup) that.setup.call(that);
      addEvents();
    };
  };

  function addEvents(){
    window.onmouseover = function () {
      if (that.mouseover) that.mouseover.call(that);
    };
    window.onmouseout = function () {
      if (that.mouseout) that.mouseout.call(that);
    };
    window.onmousedown = function (e) {
      if (that.mousedown){
        var mousex = e.clientX;
        var mousey = e.clientY;
        that.mousedown.call(that, mousex, mousey);
      }
    };
    window.onmouseup = function () {
      if (that.mouseup) that.mouseup.call(that);
    };
    window.onmousemove = function (e) {
      if (that.mousemove){
        var mousex = e.clientX;
        var mousey = e.clientY;
        that.mousemove.call(that, mousex, mousey);
      }
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

  function readPixels( _x, _y, _width, _height){
    if(_x == undefined) _x = 0;
    if(_y == undefined) _y = 0;
    if(_width == undefined) _width = this.width;
    if(_height == undefined) _height = this.height;
    var ctx = this.renderer.getContext();
    var buffer = new Uint8Array(_width * _height * 4);
    ctx.readPixels(_x, _y, _width, _height, ctx.RGBA, ctx.UNSIGNED_BYTE, buffer);
    var pixels = new Uint8Array(_width * _height * 4);
    for( var i = 0; i < _height; i++){
      var head = (_height - i) * _width * 4;
      var nhead = i * _width * 4;
      var tmp = buffer.slice(head, head + (_width * 4));
      pixels.set(new Uint8Array(tmp), nhead);
    }
    return pixels;
  };

  function setBackgroundAuto( bool ){
    this.backgroundAuto = bool;
    if( this.renderer ) this.renderer.init( this );
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
    readPixels: readPixels,
    setBackgroundAuto: setBackgroundAuto,

    /**
     * Child Class
     */
    render: null, // ALGO.Render
    renderer: null, // ALGO.WebGLRenderer
  };

  return ALGO;
}());
