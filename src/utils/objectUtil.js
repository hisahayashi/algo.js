/**
 * ALGO.ObjectUtil
 */
ALGO.ObjectUtil = {

  /**
   * [extend description]
   * @param  {[type]} baseObj [description]
   * @param  {[type]} overObj [description]
   * @return {[type]}          [description]
   */
  extend: function(baseObj, overObj) {
    var newObj = ALGO.ObjectUtil.clone(baseObj);
    for (key in overObj) {
      var value = (overObj[key] != undefined) ? overObj[key] : baseObj[key];
      baseObj[key] = value;
    }
    return baseObj;
  },

  /**
   * [clone description]
   * @param  {[type]} obj [description]
   * @return {[type]}     [description]
   */
  clone: function(obj) {
    var newObj = {};
    for (key in obj) {
      newObj[key] = obj[key];
    }
    return newObj;
  }


};
