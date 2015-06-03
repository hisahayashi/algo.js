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
    this.angles = 3;
    this.radius = _radius;

    // define
    this.angles_ = 3;
    this.radius_ = _radius;

    this.init();
    this.setup();
  };

  /**
   * [init description]
   * @return {[type]} [description]
   */
  function init() {
    // initialize
    this.geometry = [];
    this.vertexPosition = [];
    this.vertexColors = [];
    this.vertexLineColors = [];
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
    // setup vertex
    this.setGeometry();
    this.setVertexPosition();
    this.setVertexColor( this.color, this.vertexColors );
    this.setVertexAlpha( this.alpha, this.vertexColors );
    this.setVertexColor( this.lineColor, this.vertexLineColors );
    this.setVertexAlpha( this.lineAlpha, this.vertexLineColors );
    this.setIndex();

    // setup matrix
    this.setScale( this.scale );
    this.setRotate( this.rotate );
    this.setTranslate( this.x, this.y );
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
   * [clear description]
   * @return {[type]} [description]
   */
  function clear(){
    this.geometry = [];
    this.vertexPosition = [];
    this.vertexColors = [];
    this.vertexLineColors = [];

    this.setVertexPosition();
    this.setVertexColor( this.color, this.vertexColors );
    this.setVertexAlpha( this.alpha, this.vertexColors );
    this.setVertexColor( this.lineColor, this.vertexLineColors );
    this.setVertexAlpha( this.lineAlpha, this.vertexLineColors );
  };

  /**
   * [clone description]
   * @return {[type]} [description]
   */
  function clone() {};

  /**
   * [setupGeometry description]
   */
  function setGeometry(){
    var geometry = this.geometry;
    geometry[0] = {
      x: 0.00,
      y: -1.00
    };
    geometry[1] = {
      x: -0.87,
      y: 0.50
    };
    geometry[2] = {
      x: 0.87,
      y: 0.50
    };
    // for( var i = 0; i < 3; i++ ){
    //   var rot = i * ( 360 / 3 ) + 180;
    //   var rad = rot * Math.PI / 180;
    //   geometry[i] = { x: Math.sin( rad ), y: Math.cos( rad ) };
    // }
  };

  /**
   * [setVertexPosition description]
   */
  function setVertexPosition(){
    var vp = this.vertexPosition;
    var length = this.geometry.length;
    for( var i = 0; i < length; i++ ){
      // point
      var num = i * 2;
      vp[num] = this.geometry[i].x;
      vp[num+1] = this.geometry[i].y;
    }
  };

  /**
   * [clone description]
   */
  function setVertexColor(color, obj) {
    var vc = obj;
    var length = this.geometry.length;
    var cl = ALGO.ColorUtil.hexToRgbNormalize(color);

    for (var i = 0; i < length; i++) {
      var num = i * 4;
      vc[num] = cl.r;
      vc[num + 1] = cl.g;
      vc[num + 2] = cl.b;
    }
  };

  /**
   * [setVertexAlpha description]
   */
  function setVertexAlpha(alpha, obj) {
    var vc = obj;
    var length = this.geometry.length;

    for (var i = 0; i < length; i++) {
      var num = i * 4;
      vc[num + 3] = alpha;
    }
  };

  /**
   * [setIndex description]
   */
  function setIndex(){
    var index = [
      0, 1, 2
    ];
    this.index = index;
  };

  function setScale(scale){
    if( this.m ){
      var scaleX = this.radius * scale;
      var scaleY = this.radius * scale;

      /*
      子クラスで分岐するというイケてない処理
       */
      // if( this.type == 'rectangle' ){
      //   scaleX = this.width * scale;
      //   scaleY = this.height * scale;
      // }

      this.m.scale( this.matrix, [ scaleX, scaleY, 0.0 ], this.matrixScale );
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
      // scale
      this.m.multiply( tmpMatrix, this.matrixScale, tmpMatrix );
      // rotate
      this.m.multiply( tmpMatrix, this.matrixRotate, tmpMatrix );
      // translate
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
    // width: null,
    // height: null,
    angles: undefined,
    radius: null,
    alpha: 1.0,
    visible: true,
    color: 0xffffff,
    scale: 1,
    rotate: 0,

    line: false,
    lineColor: 0x000000,
    lineAlpha: 1.0,
    lineWidth: 1.0,
    fill: true,

    m: undefined,
    matrix: undefined,
    matrixScale: undefined,
    matrixRotate: undefined,
    matrixTranslate: undefined,

    parent: undefined,
    children: [],
    geometry: [],
    vertexPosition: [],
    vertexColors: [],
    vertexLineColors: [],
    needsUpdate: false,
    geometry: [],
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
    angle_: undefined,
    needsUpdate_: false,

    lineColor_: 0x000000,
    lineAlpha_: 1.0,

    /**
     * Method
     */
    init: init,
    setup: setup,
    add: add,
    remove: remove,
    clone: clone,
    clear: clear,

    /**
     * Private Method
     */
    setGeometry: setGeometry,
    setVertexPosition: setVertexPosition,
    setVertexColor: setVertexColor,
    setVertexAlpha: setVertexAlpha,
    setIndex: setIndex,
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
  this.setScale( this.scale );
  this.radius_ = value;
});

ALGO.Shape.prototype.__defineGetter__('color', function() {
  // ALGO.log('define getter: color');
  return this.color_;
});

ALGO.Shape.prototype.__defineSetter__('color', function(value) {
  // ALGO.log('define setter: color');
  this.setVertexColor(value, this.vertexColors);
  this.color_ = value;
});

ALGO.Shape.prototype.__defineGetter__('alpha', function() {
  // ALGO.log('define getter: alpha');
  return this.alpha_;
});

ALGO.Shape.prototype.__defineSetter__('alpha', function(value) {
  // ALGO.log('define setter: alpha');
  this.setVertexAlpha(value, this.vertexColors);
  this.alpha_ = value;
});

ALGO.Shape.prototype.__defineGetter__('lineColor', function() {
  // ALGO.log('define getter: lineColor');
  return this.lineColor_;
});

ALGO.Shape.prototype.__defineSetter__('lineColor', function(value) {
  // ALGO.log('define setter: lineColor');
  this.setVertexColor(value, this.vertexLineColors);
  this.lineColor_ = value;
});

ALGO.Shape.prototype.__defineGetter__('lineAlpha', function() {
  // ALGO.log('define getter: lineAlpha');
  return this.lineAlpha_;
});

ALGO.Shape.prototype.__defineSetter__('lineAlpha', function(value) {
  // ALGO.log('define setter: lineAlpha');
  this.setVertexAlpha(value, this.vertexLineColors);
  this.lineAlpha_ = value;
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
