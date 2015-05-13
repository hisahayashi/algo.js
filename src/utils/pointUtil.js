/**
 * ALGO.PointUtil
 */
ALGO.PointUtil = {

  /**
   * [normalize description]
   * @param  {[type]} point [description]
   * @param  {[type]} scale [description]
   * @return {[type]}       [description]
   */
  normalize: function(point, scale) {
    var norm = Math.sqrt(point.x * point.x + point.y * point.y);
    if (norm != 0) { // as3 return 0,0 for a point of zero length
      point.x = scale * point.x / norm;
      point.y = scale * point.y / norm;
    }
  },

  /**
   * [normalize3 description]
   * @param  {[type]} p     [description]
   * @param  {[type]} scale [description]
   * @return {[type]}       [description]
   */
  normalize3: function(p, scale) {
    var norm = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
    if (norm != 0) { // as3 return 0,0 for a point of zero length
      p.x = scale * p.x / norm;
      p.y = scale * p.y / norm;
      p.z = scale * p.z / norm;
    }
    return p;
  },

  /**
   * [pointLength3 description]
   * @param  {[type]} p [description]
   * @return {[type]}   [description]
   */
  pointLength3: function(p) {
    return Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
  },

  /**
   * [getDistance description]
   * @param  {[type]} p1 [description]
   * @param  {[type]} p2 [description]
   * @return {[type]}    [description]
   */
  getDistance: function(p1, p2) {
    var nX = p2.x - p1.x;
    var nY = p2.y - p1.y;
    return Math.sqrt(nX * nX + nY * nY);
  },

  // 2点間の傾きを求める
  /**
   * [getSlope description]
   * @param  {[type]} p1 [description]
   * @param  {[type]} p2 [description]
   * @return {[type]}    [description]
   */
  getSlope: function(p1, p2) {
    return (p2.y - p1.y) / (p2.x - p1.x);
  },

  // 2点間の切片を求める
  /**
   * [getIntercept description]
   * @param  {[type]} p1 [description]
   * @param  {[type]} p2 [description]
   * @param  {[type]} a  [description]
   * @return {[type]}    [description]
   */
  getIntercept: function(p1, p2, a) {
    var x = (p1.x + p2.x);
    var y = (p1.y + p2.y);
    return y / 2 - (a * x) / 2;
  },

  // 2点間の中点を求める
  /**
   * [getMidpoint description]
   * @param  {[type]} p1 [description]
   * @param  {[type]} p2 [description]
   * @return {[type]}    [description]
   */
  getMidpoint: function(p1, p2) {
    var p = [];
    p.x = (p1.x + p2.x) / 2;
    p.y = (p1.y + p2.y) / 2;
    return p;
  },

  // 2点から垂直二等分線を求める
  /**
   * [getMidperpendicular description]
   * @param  {[type]} p1 [description]
   * @param  {[type]} p2 [description]
   * @return {[type]}    [description]
   */
  getMidperpendicular: function(p1, p2) {

    // 傾きを調べる
    var a = getSlope(p1, p2);

    // 垂直二等分線の傾き
    if (checkEQ(a)) {
      x = 1.0;
    } else {
      x = -1.0 / a;
    }

    // 線の中点
    var mp = getMidpoint(p1, p2);

    // 切片を求める
    if (checkEQ(a)) {
      y = 0;
    } else {
      y = mp.y - x * mp.x;
    }

    return {
      x: x,
      y: y
    }
  },

  // 3点から外接円を求める、引数特殊なので注意
  /**
   * [getThroughPoint3 description]
   * @param  {[type]} _p1 [description]
   * @param  {[type]} _p2 [description]
   * @param  {[type]} _p3 [description]
   * @return {[type]}     [description]
   */
  getThroughPoint3: function(_p1, _p2, _p3) {

    // 二等分線を作成
    var p1 = getMidperpendicular(_p1, _p2);
    var p2 = getMidperpendicular(_p1, _p3);

    // 中心を算出
    var center = [];
    center.x = (p2.y - p1.y) / (p1.x - p2.x);
    center.y = p1.x * center.x + p1.y;

    // 半径を算出
    var rad = Math.sqrt(Math.pow(center.x - _p1.x, 2) + Math.pow(center.y - _p1.y, 2));

    return {
      x: center.x,
      y: center.y,
      rad: rad
    }
  },

  // 3点から外接円を求める、引数特殊なので注意
  /**
   * [getHugeTriangle description]
   * @param  {[type]} _p1 [description]
   * @param  {[type]} _p2 [description]
   * @param  {[type]} _p3 [description]
   * @return {[type]}     [description]
   */
  getHugeTriangle: function(_p1, _p2, _p3) {
    var obj = getThroughPoint3(_p1, _p2, _p3);

    var x1 = obj.x - Math.sqrt(3) * obj.rad;
    var y1 = obj.y - obj.rad;
    var x2 = obj.x + Math.sqrt(3) * obj.rad;
    var y2 = obj.y - obj.rad;
    var x3 = obj.x;
    var y3 = obj.y + 2 * obj.rad;
    return [{
      x: x1,
      y: y1
    }, {
      x: x2,
      y: y2
    }, {
      x: x3,
      y: y3
    }]
  },

  // 直線上の点かどうか判定
  /**
   * [checkEQ description]
   * @param  {[type]} x [description]
   * @return {[type]}   [description]
   */
  checkEQ: function(x) {
    var eps = 0.000001;
    return -eps <= x && x <= eps;
  }
};
