/**
 * ALGO.Shape
 */
ALGO.Shape = (function () {
  'use strict';

  /**
   * Private Variables
   */
  var that;

  ALGO.Shape = function ( _x, _y, _angles, _radius ) {
    // ALGO.log('ALGO.Shape');

    that = this;
    that.x = _x;
    that.y = _y;
    that.angles = _angles;
    that.radius = _radius;

    init();
  };

  /**
   * [init description]
   * @return {[type]} [description]
   */
  function init(){
    // set matrix
    that.matrix = new ALGO.Matrix();
    that.matrix.create();

    // set vertex position
    var vp = [
         -0.5,  -0.5,  0.0,
         0.5,  -0.5,  0.0,
         -0.5,  0.5,  0.0,
         0.5, 0.5,  0.0
    ];
    that.vertexPosition = vp;

    // set vertex colors
    var vc = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0
    ];
    that.vertexColors = vc;

    // set index
    var index = [
      0, 1, 2,
      1, 2, 3
    ];
    that.index = index;

  };

  /**
   * [add description]
   * @param {[type]} root [description]
   */
  function add( root ){
    if( !that.id ){
      that.id = ALGO.ShapeCtrl.createID( root.displayObjects, 8 );
    }
    root.displayObjects.push( that.id );
    root.children.push( that );
  };

  /**
   * [remove description]
   * @param  {[type]} root [description]
   * @return {[type]}      [description]
   */
  function remove( root ){
    var object_index = root.displayObjects.indexOf(id);
    if( object_index  > -1 ){
      root.displayObjects.splice( object_index, 1 );
      root.children.splice( object_index, 1 );
      that = null;
      ALGO.log( that );
    }
  };

  /**
   * [clone description]
   * @return {[type]} [description]
   */
  function clone(){
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
    scale: [ 1.0, 1.0, 1.0 ],
    rotate: [ 0, 0, 0 ],
    parent: undefined,
    matrix: undefined,
    children: [],
    vertexPosition: [],
    vertexColors: [],
    index: [],

    /**
     * Method
     */
    add: add,
    remove: remove,
    clone: clone
  };

  return ALGO.Shape;
}());
