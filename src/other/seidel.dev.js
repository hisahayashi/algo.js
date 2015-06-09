! function(e) {
  if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
  else if ("function" == typeof define && define.amd) define([], e);
  else {
    var f;
    "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.seidel = e()
  }
}(function() {
    var define, module, exports;
    return (function e(t, n, r) {
        function s(o, u) {
          if (!n[o]) {
            if (!t[o]) {
              var a = typeof require == "function" && require;
              if (!u && a) return a(o, !0);
              if (i) return i(o, !0);
              var f = new Error("Cannot find module '" + o + "'");
              throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {
              exports: {}
            };
            t[o][0].call(l.exports, function(e) {
              var n = t[o][1][e];
              return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
          }
          return n[o].exports
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
      })({
          1: [function(require, module, exports) {
                'use strict';


module.exports = Edge;

function Edge(p, q) {
    this.p = p;
    this.q = q;
    this.slope = (q.y - p.y) / (q.x - p.x);
    this.poly = null;
    this.below = null;
    this.above = null;
}

},{}],2:[function(require,module,exports){
'use strict';

module.exports = triangulateMountain;

var cross = require('./util').cross;


// triangulates a monotone mountain based on `edge`, adding resulting triangles to the `triangles` array

function triangulateMountain(edge, triangles) {

    var a = edge.p,
        b = edge.q,
        poly = edge.poly,
        p = poly.first.next;

    if (poly.length < 3) return;
    else if (poly.length === 3) { triangles.push([a, p.point, b]); return; }

    // triangles.push(monoPoly(poly)); return;

    var convexPoints = [],
        positive = cross(p.point, b, a) > 0;

    while (p !== poly.last) {
        addEar(convexPoints, p, poly, positive);
        p = p.next;
    }

    while (convexPoints.length) {
        var ear = convexPoints.shift(),
            prev = ear.prev,
            next = ear.next;

        triangles.push([prev.point, ear.point, next.point]);

        poly.remove(ear);

        addEar(convexPoints, prev, poly, positive);
        addEar(convexPoints, next, poly, positive);
    }
}

function addEar(points, p, poly, positive) {
    if (!p.ear && p !== poly.first && p !== poly.last && isConvex(p, positive)) {
        p.ear = true;
        points.push(p);
    }
}

function isConvex(p, positive) {
    return positive === (cross(p.next.point, p.prev.point, p.point) > 0);
}

// function monoPoly(poly) {
//     var points = [];
//     var p = poly.first;
//     while (p) {
//         points.push(p.point);
//         p = p.next;
//     }
//     return points;
// }

},{"./util":9}],3:[function(require,module,exports){
'use strict';

module.exports = Point;

function Point(x, y) {
    this.x = x;
    this.y = y;
}

},{}],4:[function(require,module,exports){
'use strict';

module.exports = Polygon;

// polygon contour as a doubly linked list

function Polygon() {
	this.length = 0;
	this.first = null;
	this.last = null;
}

function PolygonNode(point) {
	this.point = point;
	this.next = null;
	this.prev = null;
	this.ear = false;
}

Polygon.prototype = {
	add: function (point) {
		var node = new PolygonNode(point);

		if (!this.length) {
			this.first = this.last = node;

		} else {
			this.last.next = node;
			node.prev = this.last;
			this.last = node;
		}

		this.length++;
	},

	remove: function (node) {
		if (!this.length) return;

		if (node === this.first) {
			this.first = this.first.next;

			if (!this.first) this.last = null;
			else this.first.prev = null;

		} else if (node === this.last) {
			this.last = this.last.prev;
			this.last.next = null;

		} else {
			node.prev.next = node.next;
			node.next.prev = node.prev;
		}

		node.prev = null;
		node.next = null;

		this.length--;
	},

	insertBefore: function (point, node) {
		var newNode = new PolygonNode(point);
		newNode.prev = node.prev;
		newNode.next = node;

		if (!node.prev) this.first = newNode;
		else node.prev.next = newNode;

		node.prev = newNode;

		this.length++;
	}
};

},{}],5:[function(require,module,exports){
'use strict';

module.exports = QueryGraph;

var edgeOrient = require('./util').edgeOrient;


function QueryGraph(head) {
    this.head = getSink(head);
}

QueryGraph.prototype = {

    locate: function (point, slope) {
        var node = this.head,
            orient;

        while (node) {
            if (node.trapezoid) return node.trapezoid;

            if (node.point) {
                node = point.x >= node.point.x ? node.rchild : node.lchild;

            } else if (node.edge) {
                orient = edgeOrient(node.edge, point);
                node =
                    orient < 0 ? node.rchild :
                    orient > 0 ? node.lchild :
                    slope < node.edge.slope ? node.rchild : node.lchild;
            }
        }
    },

    case1: function (sink, edge, t1, t2, t3, t4) {
        var yNode = setYNode(new Node(), edge, getSink(t2), getSink(t3)),
            qNode = setXNode(new Node(), edge.q, yNode, getSink(t4));
        setXNode(sink, edge.p, getSink(t1), qNode);
    },

    case2: function (sink, edge, t1, t2, t3) {
        var yNode = setYNode(new Node(), edge, getSink(t2), getSink(t3));
        setXNode(sink, edge.p, getSink(t1), yNode);
    },

    case3: function (sink, edge, t1, t2) {
        setYNode(sink, edge, getSink(t1), getSink(t2));
    },

    case4: function (sink, edge, t1, t2, t3) {
        var yNode = setYNode(new Node(), edge, getSink(t1), getSink(t2));
        setXNode(sink, edge.q, yNode, getSink(t3));
    }
};


function Node() {
    this.point = null;
    this.edge = null;
    this.lchild = null;
    this.rchild = null;
    this.trapezoid = null;
}

function setYNode(node, edge, lchild, rchild) {
    node.edge = edge;
    node.lchild = lchild;
    node.rchild = rchild;
    node.trapezoid = null;
    return node;
}

function setXNode(node, point, lchild, rchild) {
    node.point = point;
    node.lchild = lchild;
    node.rchild = rchild;
    node.trapezoid = null;
    return node;
}


function setSink(node, trapezoid) {
    node.trapezoid = trapezoid;
    trapezoid.sink = node;
    return node;
}

function getSink(trapezoid) {
    return trapezoid.sink || setSink(new Node(), trapezoid);
}



},{"./util":9}],6:[function(require,module,exports){
'use strict';

module.exports = triangulate;

var Point = require('./point'),
    Edge = require('./edge'),
    TrapezoidalMap = require('./trapezoidalmap'),
    triangulateMountain = require('./mountain');


// Build the trapezoidal map and query graph & return triangles
function triangulate(rings) {

    var triangles = [],
        edges = [],
        i, j, k, points, p, q, len, done;

    for (k = 0; k < rings.length; k++) {

        points = rings[k];

        // build a set of edges from points
        for (i = 0, len = points.length; i < len; i++) {
            j = i < len - 1 ? i + 1 : 0;
            p = i ? q : shearTransform(points[i]);
            q = shearTransform(points[j]);
            edges.push(p.x > q.x ? new Edge(q, p) : new Edge(p, q));
        }
    }

    // shuffle(edges);

    var map = new TrapezoidalMap();

    for (i = 0; i < edges.length; i++) {
        done = map.addEdge(edges[i]);
        if (!done) return null;
    }
    done = map.collectPoints();
    if (!done) return null;

    // Generate the triangles
    for (i = 0; i < edges.length; i++) {
        if (edges[i].poly && edges[i].poly.length) triangulateMountain(edges[i], triangles);
    }

    return triangles.length ? triangles : null;
}

// Shear transform. May effect numerical robustness
var SHEAR = 1e-10;

function shearTransform(point) {
    return new Point(point[0] + SHEAR * point[1], point[1]);
}

// Fisher-Yates shuffle algorithm
// function shuffle(array) {
//     for (var i = array.length - 1, j, tmp; i > 0; i--) {
//         j = Math.floor(Math.random() * (i + 1));
//         tmp = array[i];
//         array[i] = array[j];
//         array[j] = tmp;
//     }
//     return array;
// }

},{"./edge":1,"./mountain":2,"./point":3,"./trapezoidalmap":8}],7:[function(require,module,exports){
'use strict';

module.exports = Trapezoid;

var util = require('./util'),
    edgeAbove = util.edgeAbove,
    edgeBelow = util.edgeBelow,
    neq = util.neq,
    Polygon = require('./polygon');

function Trapezoid(leftPoint, rightPoint, top, bottom) {
    this.leftPoint = leftPoint;
    this.rightPoint = rightPoint;
    this.top = top;
    this.bottom = bottom;

    this.inside = false;
    this.removed = false;
    this.sink = null;

    this.upperLeft = null;
    this.upperRight = null;
    this.lowerLeft = null;
    this.lowerRight = null;
}

Trapezoid.prototype = {

    updateLeft: function (ul, ll) {
        this.upperLeft = ul;
        if (ul) ul.upperRight = this;
        this.lowerLeft = ll;
        if (ll) ll.lowerRight = this;
    },

    updateRight: function (ur, lr) {
        this.upperRight = ur;
        if (ur) ur.upperLeft = this;
        this.lowerRight = lr;
        if (lr) lr.lowerLeft = this;
    },

    updateLeftRight: function (ul, ll, ur, lr) {
        this.updateLeft(ul, ll);
        this.updateRight(ur, lr);
    },

    // mark inside trapezoids with non-recursive depth-first search
    markInside: function () {
        var stack = [this];

        while (stack.length) {
            var t = stack.pop();
            if (!t.inside) {
                t.inside = true;
                if (t.upperLeft) stack.push(t.upperLeft);
                if (t.lowerLeft) stack.push(t.lowerLeft);
                if (t.upperRight) stack.push(t.upperRight);
                if (t.lowerRight) stack.push(t.lowerRight);
            }
        }
    },

    contains: function (point) {
        return point.x > this.leftPoint.x &&
               point.x < this.rightPoint.x &&
               edgeAbove(this.top, point) &&
               edgeBelow(this.bottom, point);
    },

    addPoint: function (edge, point) {
        var poly = edge.poly;
        if (!poly) {
            if (neq(point, edge.p) && neq(point, edge.q)) {
                poly = edge.poly = new Polygon();
                poly.add(edge.p);
                poly.add(point);
                poly.add(edge.q);
            }
        } else {
            var v = poly.first;
            while (v) {
                if (!neq(point, v.point)) return;
                if (point.x < v.point.x) {
                    poly.insertBefore(point, v);
                    return;
                }
                v = v.next;
            }
            poly.add(point);
        }
    },

    addPoints: function () {
        if (this.leftPoint !== this.bottom.p) this.addPoint(this.bottom, this.leftPoint);
        if (this.rightPoint !== this.bottom.q) this.addPoint(this.bottom, this.rightPoint);

        if (this.leftPoint !== this.top.p) this.addPoint(this.top, this.leftPoint);
        if (this.rightPoint !== this.top.q) this.addPoint(this.top, this.rightPoint);
    }
};

},{"./polygon":4,"./util":9}],8:[function(require,module,exports){
'use strict';

module.exports = TrapezoidalMap;

var Trapezoid = require('./trapezoid'),
    Point = require('./point'),
    Edge = require('./edge'),
    QueryGraph = require('./querygraph'),
    edgeAbove = require('./util').edgeAbove;


function TrapezoidalMap() {

    var top = new Edge(new Point(-Infinity, Infinity), new Point(Infinity, Infinity)),
        bottom = new Edge(new Point(-Infinity, -Infinity), new Point(Infinity, -Infinity));

    this.root = new Trapezoid(bottom.p, top.q, top, bottom);

    this.items = [];
    this.items.push(this.root);

    this.queryGraph = new QueryGraph(this.root);
}

TrapezoidalMap.prototype = {
    addEdge: function (edge) {
        var t = this.queryGraph.locate(edge.p, edge.slope);
        if (!t) return false;

        var cp, cq;

        while (t) {
            cp = cp ? false : t.contains(edge.p);
            cq = cq ? false : t.contains(edge.q);

            t = cp && cq ?   this.case1(t, edge) :
                cp && !cq ?  this.case2(t, edge) :
                !cp && !cq ? this.case3(t, edge) : this.case4(t, edge);

            if (t === null) return false;
        }

        this.bcross = null;
        this.tcross = null;

        return true;
    },

    nextTrapezoid: function (t, edge) {
        return edge.q.x <= t.rightPoint.x ? false :
            edgeAbove(edge, t.rightPoint) ? t.upperRight : t.lowerRight;
    },

    /*  _________
       |  |___|  |
       |__|___|__|
    */
    case1: function (t, e) {

        var t2 = new Trapezoid(e.p, e.q, t.top, e),
            t3 = new Trapezoid(e.p, e.q, e, t.bottom),
            t4 = new Trapezoid(e.q, t.rightPoint, t.top, t.bottom);

        t4.updateRight(t.upperRight, t.lowerRight);
        t4.updateLeft(t2, t3);

        t.rightPoint = e.p;
        t.updateRight(t2, t3);

        var sink = t.sink;
        t.sink = null;
        this.queryGraph.case1(sink, e, t, t2, t3, t4);

        this.items.push(t2, t3, t4);

        return false;
    },

    /*  _________
       |    |____|
       |____|____|
    */
    case2: function (t, e) {
        var next = this.nextTrapezoid(t, e),
            t2 = new Trapezoid(e.p, t.rightPoint, t.top, e),
            t3 = new Trapezoid(e.p, t.rightPoint, e, t.bottom);

        t.rightPoint = e.p;

        t.updateLeft(t.upperLeft, t.lowerLeft);
        t2.updateLeftRight(t, null, t.upperRight, null);
        t3.updateLeftRight(null, t, null, t.lowerRight);

        this.bcross = t.bottom;
        this.tcross = t.top;

        e.above = t2;
        e.below = t3;

        var sink = t.sink;
        t.sink = null;
        this.queryGraph.case2(sink, e, t, t2, t3);

        this.items.push(t2, t3);

        return next;
    },

    /*  ________
       |________|
       |________|
    */
    case3: function (t, e) {
        var next = this.nextTrapezoid(t, e),
            bottom = t.bottom,
            lowerRight = t.lowerRight,
            lowerLeft = t.lowerLeft,
            top = t.top,
            t1, t2;

        if (this.tcross === t.top) {
            t1 = t.upperLeft;
            t1.updateRight(t.upperRight, null);
            t1.rightPoint = t.rightPoint;

        } else {
            t1 = t;
            t1.bottom = e;
            t1.lowerLeft = e.above;
            if (e.above) e.above.lowerRight = t1;
            t1.lowerRight = null;
        }

        if (this.bcross === bottom) {
            t2 = lowerLeft;
            t2.updateRight(null, lowerRight);
            t2.rightPoint = t.rightPoint;

        } else if (t1 === t) {
            t2 = new Trapezoid(t.leftPoint, t.rightPoint, e, bottom);
            t2.updateLeftRight(e.below, lowerLeft, null, lowerRight);
            this.items.push(t2);

        } else {
            t2 = t;
            t2.top = e;
            t2.upperLeft = e.below;
            if (e.below) e.below.upperRight = t2;
            t2.upperRight = null;
        }

        if (t !== t1 && t !== t2) t.removed = true;

        this.bcross = bottom;
        this.tcross = top;

        e.above = t1;
        e.below = t2;

        var sink = t.sink;
        t.sink = null;
        this.queryGraph.case3(sink, e, t1, t2);

        return next;
    },

    /*  _________
       |____|    |
       |____|____|
    */
    case4: function (t, e) {
        var next = this.nextTrapezoid(t, e),
            t1, t2;

        if (this.tcross === t.top) {
            t1 = t.upperLeft;
            t1.rightPoint = e.q;

        } else {
            t1 = new Trapezoid(t.leftPoint, e.q, t.top, e);
            t1.updateLeft(t.upperLeft, e.above);
            this.items.push(t1);
        }

        if (this.bcross === t.bottom) {
            t2 = t.lowerLeft;
            t2.rightPoint = e.q;

        } else {
            t2 = new Trapezoid(t.leftPoint, e.q, e, t.bottom);
            t2.updateLeft(e.below, t.lowerLeft);
            this.items.push(t2);
        }

        t.leftPoint = e.q;
        t.updateLeft(t1, t2);

        var sink = t.sink;
        t.sink = null;
        this.queryGraph.case4(sink, e, t1, t2, t);

        return next;
    },

    collectPoints: function () {
        var i, t,
            len = this.items.length;

        // after finding the first outside trapezoid that has a linked inside trapezoid below,
        // mark other inside trapezoids (with depth-first search)
        for (i = 0; i < len; i++) {
            t = this.items[i];
            if (t.removed) continue;
            if (t.top === this.root.top && t.bottom.below && !t.bottom.below.removed) { t.bottom.below.markInside(); break; }
            if (t.bottom === this.root.bottom && t.top.above && !t.top.above.removed) { t.top.above.markInside(); break; }
        }

        // collect interior monotone mountain points
        for (i = 0; i < len; i++) {
            t = this.items[i];
            if (!t.removed && t.inside) {
                // if a trapezoid marked as inside has an infinite boundary, then something has gone wrong
                if (t.top.p.y === Infinity) return false;
                t.addPoints();
            }
        }
        return true;
    }
};

},{"./edge":1,"./point":3,"./querygraph":5,"./trapezoid":7,"./util":9}],9:[function(require,module,exports){
'use strict';

var Point = require('./point');

exports.neq = function (p1, p2) {
    return p1.x !== p2.x || p1.y !== p2.y;
};

exports.clone = function (p) {
    return new Point(p.x, p.y);
};

function cross(a, b, c) {
    var acx = a.x - c.x,
        bcx = b.x - c.x,
        acy = a.y - c.y,
        bcy = b.y - c.y;
    return acx * bcy - acy * bcx;
}
exports.cross = cross;

exports.edgeOrient = function (edge, point) { return cross(edge.p, edge.q, point); };
exports.edgeAbove  = function (edge, point) { return cross(edge.p, edge.q, point) < 0; };
exports.edgeBelow  = function (edge, point) { return cross(edge.p, edge.q, point) > 0; };


},{"./point":3}]},{},[6])(6)
});
