/**
 * ALGO.SVG
 */
ALGO.SVG = (function() {
  'use strict';

  var that;
  var vertexItems = [];

  ALGO.SVG = function() {
    // ALGO.log('ALGO.SVG');
    init();
    that = this;
  };

  /**
   * init
   */
  function init() {};

  function load(url) {

    var loader = new ALGO.Loader(url);
    loader.get();

    loader.complete = function(e) {
      var status = e.status;
      var response_text = e.responseText;

      if (status >= 200 && status < 300) {
        var doc = parseXML(response_text);
        var items = parseSVG(doc);
        if (items) {
          if (that.always) {
            var params = {
              verticles: items
            }
            that.always(params);
          }
        }
      }
    }
  };

  function parseSVG(node) {
    // ALGO.log(parsed_svg.childNodes);
    // ALGO.log(parsed_svg.childNodes[1].getAttribute('version'));
    // ALGO.log(parsed_svg.childNodes[0].nodeType);
    // ALGO.log(parsed_svg.childNodes[1].nodeType);

    var nodes = node.childNodes;

    for (var i = 0; i < nodes.length; i++) {
      var child = nodes[i];
      if (child.nodeType == 1) {
        var item = importSVG(child);
        if (item) {
          vertexItems.push(item);
          if (that.complete) {
            var params = {
              vertex: item
            }
            that.complete(params);
          }
        }
      }
    }
    return vertexItems;
  };

  function importSVG(node) {
    var item;
    var type = node.nodeName.toLowerCase();
    // ALGO.log(type);

    if (type === 'svg') {
      parseSVG(node);
    } else if (type === 'g') {
      parseSVG(node);
    } else if (type === 'path') {
      item = parsePath(node);
    } else if (type === 'defs') {}

    return item;
  };

  function parsePath(node) {
    var data = node.getAttribute('d');
    // ALGO.log( data );
    // ALGO.log( data.match(/m/gi) );
    var parts = data.match(/[mlhvcsqtaz][^mlhvcsqtaz]*/ig);
    // ALGO.log(parts);

    var path = {};
    var coords;
    var relative = false;
    var previous;
    var control;
    var current_point = {
      x: 0,
      y: 0
    };
    var start;
    var end;
    var geometries = [];
    var geometry = [];

    function getCoord(index, coord) {
      var val = +coords[index];
      if (relative) {
        val += current_point[coord];
      }
      // ALGO.log( val );
      // ALGO.log( relative );
      // ALGO.log( coords[index] + ', ' + current_point[coord] );
      return val;
    };

    function getPoint(index) {
      var setx = getCoord(index, 'x');
      var sety = getCoord(index + 1, 'y');
      var point = {
        x: setx,
        y: sety
      };
      return point;
    };

    for (var i = 0, l = parts && parts.length; i < l; i++) {
      var part = parts[i];
      var command = part[0];
      var lower = command.toLowerCase();

      // Match all coordinate values
      var coords = part.match(/[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g);
      var length = coords && coords.length;
      relative = command === lower;

      if (previous === 'z') {
        if (!/[mz]/.test(lower)) {
          ALGO.log('TEST TRUE');
        }
      }

      // if (l == 22 && i > 15) {
      //   ALGO.log(i + '/' + l + ', ' + command + '(' + lower + ')' + ', ' + length);
      //   ALGO.log(coords);
      // }

      switch (lower) {
        // moveto
        case 'm':
        // lineto
        case 'l':
          for (var j = 0; j < length; j += 2) {
            current_point = getPoint(j);
            ALGO.log( 'setx: ' + current_point.x + ', sety: ' + current_point.y );
            geometry.push({
              x: current_point.x,
              y: current_point.y
            });
          }
          break;

          // horizontal lineto
        case 'h':

          // vertical lineto
        case 'v':
          var coord = lower === 'h' ? 'x' : 'y';
          for (var j = 0; j < length; j++) {
            current_point[coord] = getCoord(j, coord);
            ALGO.log( 'setx: ' + current_point.x + ', sety: ' + current_point.y );
            geometry.push({
              x: current_point.x,
              y: current_point.y
            });
          }
          break;

          // curveto
        case 'c':
          for (var j = 0; j < length; j += 6) {
            var cp1 = getPoint(j);
            var cp2 = control = getPoint(j + 2);
            var prev_point = current_point;
            current_point = getPoint(j + 4);

            var points = getBezierPoints(prev_point.x, prev_point.y, cp1.x, cp1.y, cp2.x, cp2.y, current_point.x, current_point.y);

            for (var k = 1; k < points.length - 1; k++) {
              ALGO.log( 'setx: ' + points[k].x + ', sety: ' + points[k].y );
              geometry.push(points[k]);
            }

            // ALGO.log('current: ' + prev_point.x + ', ' + prev_point.y + '   control: ' + cp1.x + ', ' + cp1.y);
            // ALGO.log('current: ' + current_point.x + ', ' + current_point.y + '   control: ' + cp2.x + ', ' + cp2.y);
            // ALGO.log(points);

            // geometry.push( { x: cp1.x, y: cp1.y } );
            // geometry.push( { x: cp2.x, y: cp2.y } );
            // ALGO.log( 'setx: ' + current_point.x + ', sety: ' + current_point.y );
            // geometry.push({
            //   x: current_point.x,
            //   y: current_point.y
            // });
          }
          break;

          // smooth curveto
        case 's':
          for (var j = 0; j < length; j += 4) {
            // /[cs]/.test(previous) ? current_point.multiply(2).subtract(control) : current_point,
            var cp2 = current_point;
            if( /[cs]/.test(previous) ){
              var nx = current_point.x * 2 - control.x;
              var ny = current_point.y * 2 - control.y;
              cp2 = {
                x: nx,
                y: ny
              };
            }
            var cp1 = control = getPoint(j);
            var prev_point = current_point;
            current_point = getPoint(j + 2);

            var points = getBezierPoints(prev_point.x, prev_point.y, cp2.x, cp2.y, cp1.x, cp1.y,  current_point.x, current_point.y );

            for (var k = 1; k < points.length - 1; k++) {
              ALGO.log( 'setx: ' + points[k].x + ', sety: ' + points[k].y );
              geometry.push(points[k]);
            }

            previous = lower;

            // geometry.push( { x: cp1.x, y: cp1.y } );
            // geometry.push( { x: cp2.x, y: cp2.y } );
            // ALGO.log( 'setx: ' + current_point.x + ', sety: ' + current_point.y );
            // geometry.push({
            //   x: current_point.x,
            //   y: current_point.y
            // });
          }
          break;

          // quadratic curveto
        case 'q':
          for (var j = 0; j < length; j += 4) {
            control = getPoint(j);
            current_point = getPoint(j + 2);
            ALGO.log( 'setx: ' + current_point.x + ', sety: ' + current_point.y );
            geometry.push({
              x: current_point.x,
              y: current_point.y
            });
          }
          break;

          // smooth quadratic curveto
        case 't':
          for (var j = 0; j < length; j += 2) {
            control = (/[qt]/.test(previous)) ? current_point.multiply(2).subtract(control) : current_point;
            current_point = getPoint(j);
            previous = lower;
          }
          break;

          // elliptical arc
        case 'a':
          for (var j = 0; j < length; j += 7) {
            current_point = getPoint(j + 5);
            ALGO.log( 'setx: ' + current_point.x + ', sety: ' + current_point.y );
            geometry.push({
              x: current_point.x,
              y: current_point.y
            });
            // new Size( +coords[j], +coords[j + 1]), +coords[j + 2], +coords[j + 4], +coords[j + 3]);
          }
          break;

          // closepath
        case 'z':
        geometry.splice( geometry.length - 1, 1 );
        geometries.push(geometry);
        ALGO.log('z end.');
        geometry = [];
        break;
      }


      if (l == 22 && i > 15) {
        // ALGO.log(current_point);
      }

      // ALGO.log('');
      previous = lower;
    }

    // geometries.push(geometry);


    // ALGO.log('geometry: ');
    // ALGO.log( geometry );
    return geometries;
  };

  /**
   * [parseXML description]
   * @param  {[type]} xml [description]
   * @return {[type]}     [description]
   * @see https://github.com/hughsk/svg-path-parser
   */
  function parseXML(xml) {
    if (typeof(Windows) != 'undefined' && typeof(Windows.Data) != 'undefined' && typeof(Windows.Data.Xml) != 'undefined') {
      var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
      var settings = new Windows.Data.Xml.Dom.XmlLoadSettings();
      settings.prohibitDtd = false;
      xmlDoc.loadXml(xml, settings);
      return xmlDoc;
    } else if (window.DOMParser) {
      var parser = new DOMParser();
      return parser.parseFromString(xml, 'text/xml');
    } else {
      xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
      var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
      xmlDoc.async = 'false';
      xmlDoc.loadXML(xml);
      return xmlDoc;
    }
  };

  // ベジェ曲線の中間点を取得
  function getBezierPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
    var points = [];
    for (var t = 0; t <= 1.01; t += 0.05) {
      // points.push(getBezierPoint(x1, y1, x2, y2, x3, y3, x4, y4, t));
      points.push(cubicBezPoint({ x: x1, y: y1 }, {x: x2, y: y2}, {x: x3, y: y3}, {x: x4, y: y4}, t));
    }
    return points;
  };

  // ベジェ曲線の座標を計算する
  function getBezierPoint(x1, y1, x2, y2, x3, y3, x4, y4, t) {
    t = (typeof t != "number") ? 0 : (t >= 0 && t <= 1) ? t : (t < 0) ? 0 : 1;
    // var x = Math.pow(1 - t, 3) * x1 + 3 * Math.pow(1 - t, 2) * t * x2 + 3 * (1 - t) * Math.pow(t, 2) * x3 + Math.pow(t, 3) * x4;
    // var y = Math.pow(1 - t, 3) * y1 + 3 * Math.pow(1 - t, 2) * t * y2 + 3 * (1 - t) * Math.pow(t, 2) * y3 + Math.pow(t, 3) * y4;
    var x = (1 - t) * (1 - t) * (1 - t) * x1 + 3 * (1 - t) * (1 - t) * t * x2 + 3 * (1 - t) * t * t * x3 + t * t * t * x4;
    var y = (1 - t) * (1 - t) * (1 - t) * y1 + 3 * (1 - t) * (1 - t) * t * y2 + 3 * (1 - t) * t * t * y3 + t * t * t * y4;
    return {
      x: x,
      y: y
    };
  };

  function cubicBezPoint( p0,p1,p2,p3,d){

    var o = {x:0,y:0};

    var v = (1-d) * (1-d) * (1-d);
    o.x += v * p0.x;
    o.y += v * p0.y;

    v = 3 * d * (1-d) * (1-d);
    o.x += v * p1.x;
    o.y += v * p1.y;

    v = 3 * d * d * (1-d);
    o.x += v * p2.x;
    o.y += v * p2.y;

    v = d * d * d;
    o.x += v * p3.x;
    o.y += v * p3.y;

    return o;
  }

  // ベジェ曲線の中間点を取得
  function getBezierPoints2(x1, y1, x2, y2, x3, y3) {
    var points = [];
    for (var t = 0; t <= 1.01; t += 0.1) {
      points.push(getBezierPoint2(x1, y1, x2, y2, x3, y3, t));
    }
    return points;
  };

  function getBezierPoint2( x1, y1, x2, y2, x3, y3, t ) {
    var x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * x2 + t * t * x3;
    var y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * y2 + t * t * y3;
    return {
      x: x,
      y: y
    };
  };

  function complete() {}

  function always() {}

  /**
   * bind
   */
  function bind(name, method) {
    this[name] = method;
  };

  function unbind(name, method) {
    that[name] = null;
  };

  ALGO.SVG.prototype = {
    constructor: ALGO.SVG,

    load: load,
    bind: bind,
    unbind: unbind,

    complete: complete,
    always: always,
  };

  return ALGO.SVG;
}());
