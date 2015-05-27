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
      this.m.rotate( this.matrix, rad, this.matrixRotate );
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
      this.m.multiply( tmpMatrix, this.matrixScale, tmpMatrix );
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
