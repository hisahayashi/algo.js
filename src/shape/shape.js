/**
 * ALGO.Shape
 */
ALGO.Shape = (function() {
  'use strict';

  /**
   * Private Variables
   */
  var that;

  ALGO.Shape = function(_x, _y, _angles, _radius) {
    // ALGO.log('ALGO.Shape');

    that = this;
    that.x = _x;
    that.y = _y;
    that.angles = _angles;
    that.radius = _radius;

    // define
    that.angles_ = _angles;
    that.radius_ = _radius;

    init();
  };

  /**
   * [init description]
   * @return {[type]} [description]
   */
  function init() {
    // set matrix
    that.matrix = new ALGO.Matrix();
    that.matrix.create();

    /* 頂点の位置を算出 */
    var angle_points = [];
    for (var i = 0; i < that.angles; i++) {
      angle_points[i] = {};
      angle_points[i].x = that.radius * Math.cos(2 * i * Math.PI / that.angles - Math.PI / 2);
      angle_points[i].y = that.radius * Math.sin(2 * i * Math.PI / that.angles - Math.PI / 2);
    }

    var vp = [];
    var vc = [];
    var cl = ALGO.ColorUtil.hexToRgbNormalize( that.color );

    for( i = 0; i < angle_points.length; i++ ){
      // point
      vp.push( angle_points[i].x );
      vp.push( angle_points[i].y );

      // color
      vc.push( cl.r );
      vc.push( cl.g );
      vc.push( cl.b );
      vc.push( that.alpha );
    }
    that.vertexPosition = vp;

    // ALGO.log( vp );
    // ALGO.log( vc );


    // set vertex colors
    // var vc = [
    //   1.0, 0.0, 0.0, 1.0,
    //   0.0, 1.0, 0.0, 1.0,
    //   0.0, 0.0, 1.0, 1.0,
    //   1.0, 1.0, 1.0, 1.0
    // ];
    that.vertexColors = vc;

    // set index
    var index = [];

    // set index
    for( i = 1; i < that.angles - 1; i++ ){
      index.push( 0 );
      index.push( i );
      index.push( i+1 );
    }

    that.index = index;
  };

  /**
   * [add description]
   * @param {[type]} root [description]
   */
  function add(root) {
    if (!that.id) {
      that.id = ALGO.ShapeCtrl.createID(root.displayObjects, 8);
    }
    root.displayObjects.push(that.id);
    root.children.push(that);
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
      that = null;
      // ALGO.log(that);
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
    var vc = that.vertexColors;
    var length = vc.length;
    var cl = ALGO.ColorUtil.hexToRgbNormalize(color);

    for (var i = 0; i < length; i += 4) {
      vc[i] = cl.r;
      vc[i + 1] = cl.g;
      vc[i + 2] = cl.b;
    }
  };

  function setVertexAlpha(alpha) {
    var vc = that.vertexColors;
    var length = vc.length;

    for (var i = 0; i < length; i += 4) {
      vc[i + 3] = alpha;
    }
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
    matrix: undefined,
    children: [],
    geometry: [],
    vertexPosition: [],
    vertexColors: [],
    index: [],

    /**
     * define getter/setter
     */
    scale_: 1,
    radius_: null,
    color_: 0xffffff,
    alpha_: 1.0,
    angle_: 3,

    /**
     * Method
     */
    add: add,
    remove: remove,
    clone: clone,
    setVertexColor: setVertexColor,
    setVertexAlpha: setVertexAlpha
  };

  return ALGO.Shape;
}());


/**
 * Define Getter / Setter
 */
ALGO.Shape.prototype.__defineGetter__('scale', function() {
  // ALGO.log('define getter: scale');
  return this.scale_;
});

ALGO.Shape.prototype.__defineSetter__('scale', function(value) {
  // ALGO.log('define setter: scale');
  this.scale_ = value;
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
