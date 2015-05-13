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
