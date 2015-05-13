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
