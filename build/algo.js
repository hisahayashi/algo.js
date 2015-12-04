/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

(function(global){
  var module = global.noise = {};

  function Grad(x, y, z) {
    this.x = x; this.y = y; this.z = z;
  }
  
  Grad.prototype.dot2 = function(x, y) {
    return this.x*x + this.y*y;
  };

  Grad.prototype.dot3 = function(x, y, z) {
    return this.x*x + this.y*y + this.z*z;
  };

  var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
               new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
               new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];

  var p = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  // To remove the need for index wrapping, double the permutation table length
  var perm = new Array(512);
  var gradP = new Array(512);

  // This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.
  module.seed = function(seed) {
    if(seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if(seed < 256) {
      seed |= seed << 8;
    }

    for(var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = p[i] ^ (seed & 255);
      } else {
        v = p[i] ^ ((seed>>8) & 255);
      }

      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
  };

  module.seed(0);

  /*
  for(var i=0; i<256; i++) {
    perm[i] = perm[i + 256] = p[i];
    gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
  }*/

  // Skewing and unskewing factors for 2, 3, and 4 dimensions
  var F2 = 0.5*(Math.sqrt(3)-1);
  var G2 = (3-Math.sqrt(3))/6;

  var F3 = 1/3;
  var G3 = 1/6;

  // 2D simplex noise
  module.simplex2 = function(xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin)*F2; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var t = (i+j)*G2;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if(x0>y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1=1; j1=0;
    } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      i1=0; j1=1;
    }
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1 + 2 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    i &= 255;
    j &= 255;
    var gi0 = gradP[i+perm[j]];
    var gi1 = gradP[i+i1+perm[j+j1]];
    var gi2 = gradP[i+1+perm[j+1]];
    // Calculate the contribution from the three corners
    var t0 = 0.5 - x0*x0-y0*y0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1*x1-y1*y1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2(x1, y1);
    }
    var t2 = 0.5 - x2*x2-y2*y2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2(x2, y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70 * (n0 + n1 + n2);
  };

  // 3D simplex noise
  module.simplex3 = function(xin, yin, zin) {
    var n0, n1, n2, n3; // Noise contributions from the four corners

    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin+zin)*F3; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var k = Math.floor(zin+s);

    var t = (i+j+k)*G3;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    var z0 = zin-k+t;

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if(x0 >= y0) {
      if(y0 >= z0)      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if(x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else              { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if(y0 < z0)      { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if(x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else             { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    var x1 = x0 - i1 + G3; // Offsets for second corner
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;

    var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;

    var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3;

    // Work out the hashed gradient indices of the four simplex corners
    i &= 255;
    j &= 255;
    k &= 255;
    var gi0 = gradP[i+   perm[j+   perm[k   ]]];
    var gi1 = gradP[i+i1+perm[j+j1+perm[k+k1]]];
    var gi2 = gradP[i+i2+perm[j+j2+perm[k+k2]]];
    var gi3 = gradP[i+ 1+perm[j+ 1+perm[k+ 1]]];

    // Calculate the contribution from the four corners
    var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
    }
    var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
    }
    var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if(t3<0) {
      n3 = 0;
    } else {
      t3 *= t3;
      n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 32 * (n0 + n1 + n2 + n3);

  };

  // ##### Perlin noise stuff

  function fade(t) {
    return t*t*t*(t*(t*6-15)+10);
  }

  function lerp(a, b, t) {
    return (1-t)*a + t*b;
  }

  // 2D Perlin Noise
  module.perlin2 = function(x, y) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    x = x - X; y = y - Y;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255;

    // Calculate noise contributions from each of the four corners
    var n00 = gradP[X+perm[Y]].dot2(x, y);
    var n01 = gradP[X+perm[Y+1]].dot2(x, y-1);
    var n10 = gradP[X+1+perm[Y]].dot2(x-1, y);
    var n11 = gradP[X+1+perm[Y+1]].dot2(x-1, y-1);

    // Compute the fade curve value for x
    var u = fade(x);

    // Interpolate the four results
    return lerp(
        lerp(n00, n10, u),
        lerp(n01, n11, u),
       fade(y));
  };

  // 3D Perlin Noise
  module.perlin3 = function(x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    // Get relative xyz coordinates of point within that cell
    x = x - X; y = y - Y; z = z - Z;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255; Z = Z & 255;

    // Calculate noise contributions from each of the eight corners
    var n000 = gradP[X+  perm[Y+  perm[Z  ]]].dot3(x,   y,     z);
    var n001 = gradP[X+  perm[Y+  perm[Z+1]]].dot3(x,   y,   z-1);
    var n010 = gradP[X+  perm[Y+1+perm[Z  ]]].dot3(x,   y-1,   z);
    var n011 = gradP[X+  perm[Y+1+perm[Z+1]]].dot3(x,   y-1, z-1);
    var n100 = gradP[X+1+perm[Y+  perm[Z  ]]].dot3(x-1,   y,   z);
    var n101 = gradP[X+1+perm[Y+  perm[Z+1]]].dot3(x-1,   y, z-1);
    var n110 = gradP[X+1+perm[Y+1+perm[Z  ]]].dot3(x-1, y-1,   z);
    var n111 = gradP[X+1+perm[Y+1+perm[Z+1]]].dot3(x-1, y-1, z-1);

    // Compute the fade curve value for x, y, z
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);

    // Interpolate
    return lerp(
        lerp(
          lerp(n000, n100, u),
          lerp(n001, n101, u), w),
        lerp(
          lerp(n010, n110, u),
          lerp(n011, n111, u), w),
       v);
  };

})(this);

!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.poly2tri=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports={"version": "1.3.5"}
},{}],2:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

/* jshint maxcomplexity:11 */

"use strict";


/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it
 * easier to keep the 2 versions in sync.
 */


// -------------------------------------------------------------------------Node

/**
 * Advancing front node
 * @constructor
 * @private
 * @struct
 * @param {!XY} p - Point
 * @param {Triangle=} t triangle (optional)
 */
var Node = function(p, t) {
    /** @type {XY} */
    this.point = p;

    /** @type {Triangle|null} */
    this.triangle = t || null;

    /** @type {Node|null} */
    this.next = null;
    /** @type {Node|null} */
    this.prev = null;

    /** @type {number} */
    this.value = p.x;
};

// ---------------------------------------------------------------AdvancingFront
/**
 * @constructor
 * @private
 * @struct
 * @param {Node} head
 * @param {Node} tail
 */
var AdvancingFront = function(head, tail) {
    /** @type {Node} */
    this.head_ = head;
    /** @type {Node} */
    this.tail_ = tail;
    /** @type {Node} */
    this.search_node_ = head;
};

/** @return {Node} */
AdvancingFront.prototype.head = function() {
    return this.head_;
};

/** @param {Node} node */
AdvancingFront.prototype.setHead = function(node) {
    this.head_ = node;
};

/** @return {Node} */
AdvancingFront.prototype.tail = function() {
    return this.tail_;
};

/** @param {Node} node */
AdvancingFront.prototype.setTail = function(node) {
    this.tail_ = node;
};

/** @return {Node} */
AdvancingFront.prototype.search = function() {
    return this.search_node_;
};

/** @param {Node} node */
AdvancingFront.prototype.setSearch = function(node) {
    this.search_node_ = node;
};

/** @return {Node} */
AdvancingFront.prototype.findSearchNode = function(/*x*/) {
    // TODO: implement BST index
    return this.search_node_;
};

/**
 * @param {number} x value
 * @return {Node}
 */
AdvancingFront.prototype.locateNode = function(x) {
    var node = this.search_node_;

    /* jshint boss:true */
    if (x < node.value) {
        while (node = node.prev) {
            if (x >= node.value) {
                this.search_node_ = node;
                return node;
            }
        }
    } else {
        while (node = node.next) {
            if (x < node.value) {
                this.search_node_ = node.prev;
                return node.prev;
            }
        }
    }
    return null;
};

/**
 * @param {!XY} point - Point
 * @return {Node}
 */
AdvancingFront.prototype.locatePoint = function(point) {
    var px = point.x;
    var node = this.findSearchNode(px);
    var nx = node.point.x;

    if (px === nx) {
        // Here we are comparing point references, not values
        if (point !== node.point) {
            // We might have two nodes with same x value for a short time
            if (point === node.prev.point) {
                node = node.prev;
            } else if (point === node.next.point) {
                node = node.next;
            } else {
                throw new Error('poly2tri Invalid AdvancingFront.locatePoint() call');
            }
        }
    } else if (px < nx) {
        /* jshint boss:true */
        while (node = node.prev) {
            if (point === node.point) {
                break;
            }
        }
    } else {
        while (node = node.next) {
            if (point === node.point) {
                break;
            }
        }
    }

    if (node) {
        this.search_node_ = node;
    }
    return node;
};


// ----------------------------------------------------------------------Exports

module.exports = AdvancingFront;
module.exports.Node = Node;


},{}],3:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";

/*
 * Function added in the JavaScript version (was not present in the c++ version)
 */

/**
 * assert and throw an exception.
 *
 * @private
 * @param {boolean} condition   the condition which is asserted
 * @param {string} message      the message which is display is condition is falsy
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assert Failed");
    }
}
module.exports = assert;



},{}],4:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";


/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it
 * easier to keep the 2 versions in sync.
 */

var xy = _dereq_('./xy');

// ------------------------------------------------------------------------Point
/**
 * Construct a point
 * @example
 *      var point = new poly2tri.Point(150, 150);
 * @public
 * @constructor
 * @struct
 * @param {number=} x    coordinate (0 if undefined)
 * @param {number=} y    coordinate (0 if undefined)
 */
var Point = function(x, y) {
    /**
     * @type {number}
     * @expose
     */
    this.x = +x || 0;
    /**
     * @type {number}
     * @expose
     */
    this.y = +y || 0;

    // All extra fields added to Point are prefixed with _p2t_
    // to avoid collisions if custom Point class is used.

    /**
     * The edges this point constitutes an upper ending point
     * @private
     * @type {Array.<Edge>}
     */
    this._p2t_edge_list = null;
};

/**
 * For pretty printing
 * @example
 *      "p=" + new poly2tri.Point(5,42)
 *      // → "p=(5;42)"
 * @returns {string} <code>"(x;y)"</code>
 */
Point.prototype.toString = function() {
    return xy.toStringBase(this);
};

/**
 * JSON output, only coordinates
 * @example
 *      JSON.stringify(new poly2tri.Point(1,2))
 *      // → '{"x":1,"y":2}'
 */
Point.prototype.toJSON = function() {
    return { x: this.x, y: this.y };
};

/**
 * Creates a copy of this Point object.
 * @return {Point} new cloned point
 */
Point.prototype.clone = function() {
    return new Point(this.x, this.y);
};

/**
 * Set this Point instance to the origo. <code>(0; 0)</code>
 * @return {Point} this (for chaining)
 */
Point.prototype.set_zero = function() {
    this.x = 0.0;
    this.y = 0.0;
    return this; // for chaining
};

/**
 * Set the coordinates of this instance.
 * @param {number} x   coordinate
 * @param {number} y   coordinate
 * @return {Point} this (for chaining)
 */
Point.prototype.set = function(x, y) {
    this.x = +x || 0;
    this.y = +y || 0;
    return this; // for chaining
};

/**
 * Negate this Point instance. (component-wise)
 * @return {Point} this (for chaining)
 */
Point.prototype.negate = function() {
    this.x = -this.x;
    this.y = -this.y;
    return this; // for chaining
};

/**
 * Add another Point object to this instance. (component-wise)
 * @param {!Point} n - Point object.
 * @return {Point} this (for chaining)
 */
Point.prototype.add = function(n) {
    this.x += n.x;
    this.y += n.y;
    return this; // for chaining
};

/**
 * Subtract this Point instance with another point given. (component-wise)
 * @param {!Point} n - Point object.
 * @return {Point} this (for chaining)
 */
Point.prototype.sub = function(n) {
    this.x -= n.x;
    this.y -= n.y;
    return this; // for chaining
};

/**
 * Multiply this Point instance by a scalar. (component-wise)
 * @param {number} s   scalar.
 * @return {Point} this (for chaining)
 */
Point.prototype.mul = function(s) {
    this.x *= s;
    this.y *= s;
    return this; // for chaining
};

/**
 * Return the distance of this Point instance from the origo.
 * @return {number} distance
 */
Point.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * Normalize this Point instance (as a vector).
 * @return {number} The original distance of this instance from the origo.
 */
Point.prototype.normalize = function() {
    var len = this.length();
    this.x /= len;
    this.y /= len;
    return len;
};

/**
 * Test this Point object with another for equality.
 * @param {!XY} p - any "Point like" object with {x,y}
 * @return {boolean} <code>true</code> if same x and y coordinates, <code>false</code> otherwise.
 */
Point.prototype.equals = function(p) {
    return this.x === p.x && this.y === p.y;
};


// -----------------------------------------------------Point ("static" methods)

/**
 * Negate a point component-wise and return the result as a new Point object.
 * @param {!XY} p - any "Point like" object with {x,y}
 * @return {Point} the resulting Point object.
 */
Point.negate = function(p) {
    return new Point(-p.x, -p.y);
};

/**
 * Add two points component-wise and return the result as a new Point object.
 * @param {!XY} a - any "Point like" object with {x,y}
 * @param {!XY} b - any "Point like" object with {x,y}
 * @return {Point} the resulting Point object.
 */
Point.add = function(a, b) {
    return new Point(a.x + b.x, a.y + b.y);
};

/**
 * Subtract two points component-wise and return the result as a new Point object.
 * @param {!XY} a - any "Point like" object with {x,y}
 * @param {!XY} b - any "Point like" object with {x,y}
 * @return {Point} the resulting Point object.
 */
Point.sub = function(a, b) {
    return new Point(a.x - b.x, a.y - b.y);
};

/**
 * Multiply a point by a scalar and return the result as a new Point object.
 * @param {number} s - the scalar
 * @param {!XY} p - any "Point like" object with {x,y}
 * @return {Point} the resulting Point object.
 */
Point.mul = function(s, p) {
    return new Point(s * p.x, s * p.y);
};

/**
 * Perform the cross product on either two points (this produces a scalar)
 * or a point and a scalar (this produces a point).
 * This function requires two parameters, either may be a Point object or a
 * number.
 * @param  {XY|number} a - Point object or scalar.
 * @param  {XY|number} b - Point object or scalar.
 * @return {Point|number} a Point object or a number, depending on the parameters.
 */
Point.cross = function(a, b) {
    if (typeof(a) === 'number') {
        if (typeof(b) === 'number') {
            return a * b;
        } else {
            return new Point(-a * b.y, a * b.x);
        }
    } else {
        if (typeof(b) === 'number') {
            return new Point(b * a.y, -b * a.x);
        } else {
            return a.x * b.y - a.y * b.x;
        }
    }
};


// -----------------------------------------------------------------"Point-Like"
/*
 * The following functions operate on "Point" or any "Point like" object
 * with {x,y} (duck typing).
 */

Point.toString = xy.toString;
Point.compare = xy.compare;
Point.cmp = xy.compare; // backward compatibility
Point.equals = xy.equals;

/**
 * Peform the dot product on two vectors.
 * @public
 * @param {!XY} a - any "Point like" object with {x,y}
 * @param {!XY} b - any "Point like" object with {x,y}
 * @return {number} The dot product
 */
Point.dot = function(a, b) {
    return a.x * b.x + a.y * b.y;
};


// ---------------------------------------------------------Exports (public API)

module.exports = Point;

},{"./xy":11}],5:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";

/*
 * Class added in the JavaScript version (was not present in the c++ version)
 */

var xy = _dereq_('./xy');

/**
 * Custom exception class to indicate invalid Point values
 * @constructor
 * @public
 * @extends Error
 * @struct
 * @param {string=} message - error message
 * @param {Array.<XY>=} points - invalid points
 */
var PointError = function(message, points) {
    this.name = "PointError";
    /**
     * Invalid points
     * @public
     * @type {Array.<XY>}
     */
    this.points = points = points || [];
    /**
     * Error message
     * @public
     * @type {string}
     */
    this.message = message || "Invalid Points!";
    for (var i = 0; i < points.length; i++) {
        this.message += " " + xy.toString(points[i]);
    }
};
PointError.prototype = new Error();
PointError.prototype.constructor = PointError;


module.exports = PointError;

},{"./xy":11}],6:[function(_dereq_,module,exports){
(function (global){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * * Neither the name of Poly2Tri nor the names of its contributors may be
 *   used to endorse or promote products derived from this software without specific
 *   prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

/**
 * Public API for poly2tri.js
 * @module poly2tri
 */


/**
 * If you are not using a module system (e.g. CommonJS, RequireJS), you can access this library
 * as a global variable <code>poly2tri</code> i.e. <code>window.poly2tri</code> in a browser.
 * @name poly2tri
 * @global
 * @public
 * @type {module:poly2tri}
 */
var previousPoly2tri = global.poly2tri;
/**
 * For Browser + &lt;script&gt; :
 * reverts the {@linkcode poly2tri} global object to its previous value,
 * and returns a reference to the instance called.
 *
 * @example
 *              var p = poly2tri.noConflict();
 * @public
 * @return {module:poly2tri} instance called
 */
// (this feature is not automatically provided by browserify).
exports.noConflict = function() {
    global.poly2tri = previousPoly2tri;
    return exports;
};

/**
 * poly2tri library version
 * @public
 * @const {string}
 */
exports.VERSION = _dereq_('../dist/version.json').version;

/**
 * Exports the {@linkcode PointError} class.
 * @public
 * @typedef {PointError} module:poly2tri.PointError
 * @function
 */
exports.PointError = _dereq_('./pointerror');
/**
 * Exports the {@linkcode Point} class.
 * @public
 * @typedef {Point} module:poly2tri.Point
 * @function
 */
exports.Point = _dereq_('./point');
/**
 * Exports the {@linkcode Triangle} class.
 * @public
 * @typedef {Triangle} module:poly2tri.Triangle
 * @function
 */
exports.Triangle = _dereq_('./triangle');
/**
 * Exports the {@linkcode SweepContext} class.
 * @public
 * @typedef {SweepContext} module:poly2tri.SweepContext
 * @function
 */
exports.SweepContext = _dereq_('./sweepcontext');


// Backward compatibility
var sweep = _dereq_('./sweep');
/**
 * @function
 * @deprecated use {@linkcode SweepContext#triangulate} instead
 */
exports.triangulate = sweep.triangulate;
/**
 * @deprecated use {@linkcode SweepContext#triangulate} instead
 * @property {function} Triangulate - use {@linkcode SweepContext#triangulate} instead
 */
exports.sweep = {Triangulate: sweep.triangulate};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../dist/version.json":1,"./point":4,"./pointerror":5,"./sweep":7,"./sweepcontext":8,"./triangle":9}],7:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

/* jshint latedef:nofunc, maxcomplexity:9 */

"use strict";

/**
 * This 'Sweep' module is present in order to keep this JavaScript version
 * as close as possible to the reference C++ version, even though almost all
 * functions could be declared as methods on the {@linkcode module:sweepcontext~SweepContext} object.
 * @module
 * @private
 */

/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it
 * easier to keep the 2 versions in sync.
 */

var assert = _dereq_('./assert');
var PointError = _dereq_('./pointerror');
var Triangle = _dereq_('./triangle');
var Node = _dereq_('./advancingfront').Node;


// ------------------------------------------------------------------------utils

var utils = _dereq_('./utils');

/** @const */
var EPSILON = utils.EPSILON;

/** @const */
var Orientation = utils.Orientation;
/** @const */
var orient2d = utils.orient2d;
/** @const */
var inScanArea = utils.inScanArea;
/** @const */
var isAngleObtuse = utils.isAngleObtuse;


// ------------------------------------------------------------------------Sweep

/**
 * Triangulate the polygon with holes and Steiner points.
 * Do this AFTER you've added the polyline, holes, and Steiner points
 * @private
 * @param {!SweepContext} tcx - SweepContext object
 */
function triangulate(tcx) {
    tcx.initTriangulation();
    tcx.createAdvancingFront();
    // Sweep points; build mesh
    sweepPoints(tcx);
    // Clean up
    finalizationPolygon(tcx);
}

/**
 * Start sweeping the Y-sorted point set from bottom to top
 * @param {!SweepContext} tcx - SweepContext object
 */
function sweepPoints(tcx) {
    var i, len = tcx.pointCount();
    for (i = 1; i < len; ++i) {
        var point = tcx.getPoint(i);
        var node = pointEvent(tcx, point);
        var edges = point._p2t_edge_list;
        for (var j = 0; edges && j < edges.length; ++j) {
            edgeEventByEdge(tcx, edges[j], node);
        }
    }
}

/**
 * @param {!SweepContext} tcx - SweepContext object
 */
function finalizationPolygon(tcx) {
    // Get an Internal triangle to start with
    var t = tcx.front().head().next.triangle;
    var p = tcx.front().head().next.point;
    while (!t.getConstrainedEdgeCW(p)) {
        t = t.neighborCCW(p);
    }

    // Collect interior triangles constrained by edges
    tcx.meshClean(t);
}

/**
 * Find closes node to the left of the new point and
 * create a new triangle. If needed new holes and basins
 * will be filled to.
 * @param {!SweepContext} tcx - SweepContext object
 * @param {!XY} point   Point
 */
function pointEvent(tcx, point) {
    var node = tcx.locateNode(point);
    var new_node = newFrontTriangle(tcx, point, node);

    // Only need to check +epsilon since point never have smaller
    // x value than node due to how we fetch nodes from the front
    if (point.x <= node.point.x + (EPSILON)) {
        fill(tcx, node);
    }

    //tcx.AddNode(new_node);

    fillAdvancingFront(tcx, new_node);
    return new_node;
}

function edgeEventByEdge(tcx, edge, node) {
    tcx.edge_event.constrained_edge = edge;
    tcx.edge_event.right = (edge.p.x > edge.q.x);

    if (isEdgeSideOfTriangle(node.triangle, edge.p, edge.q)) {
        return;
    }

    // For now we will do all needed filling
    // TODO: integrate with flip process might give some better performance
    //       but for now this avoid the issue with cases that needs both flips and fills
    fillEdgeEvent(tcx, edge, node);
    edgeEventByPoints(tcx, edge.p, edge.q, node.triangle, edge.q);
}

function edgeEventByPoints(tcx, ep, eq, triangle, point) {
    if (isEdgeSideOfTriangle(triangle, ep, eq)) {
        return;
    }

    var p1 = triangle.pointCCW(point);
    var o1 = orient2d(eq, p1, ep);
    if (o1 === Orientation.COLLINEAR) {
        // TODO integrate here changes from C++ version
        // (C++ repo revision 09880a869095 dated March 8, 2011)
        throw new PointError('poly2tri EdgeEvent: Collinear not supported!', [eq, p1, ep]);
    }

    var p2 = triangle.pointCW(point);
    var o2 = orient2d(eq, p2, ep);
    if (o2 === Orientation.COLLINEAR) {
        // TODO integrate here changes from C++ version
        // (C++ repo revision 09880a869095 dated March 8, 2011)
        throw new PointError('poly2tri EdgeEvent: Collinear not supported!', [eq, p2, ep]);
    }

    if (o1 === o2) {
        // Need to decide if we are rotating CW or CCW to get to a triangle
        // that will cross edge
        if (o1 === Orientation.CW) {
            triangle = triangle.neighborCCW(point);
        } else {
            triangle = triangle.neighborCW(point);
        }
        edgeEventByPoints(tcx, ep, eq, triangle, point);
    } else {
        // This triangle crosses constraint so lets flippin start!
        flipEdgeEvent(tcx, ep, eq, triangle, point);
    }
}

function isEdgeSideOfTriangle(triangle, ep, eq) {
    var index = triangle.edgeIndex(ep, eq);
    if (index !== -1) {
        triangle.markConstrainedEdgeByIndex(index);
        var t = triangle.getNeighbor(index);
        if (t) {
            t.markConstrainedEdgeByPoints(ep, eq);
        }
        return true;
    }
    return false;
}

/**
 * Creates a new front triangle and legalize it
 * @param {!SweepContext} tcx - SweepContext object
 */
function newFrontTriangle(tcx, point, node) {
    var triangle = new Triangle(point, node.point, node.next.point);

    triangle.markNeighbor(node.triangle);
    tcx.addToMap(triangle);

    var new_node = new Node(point);
    new_node.next = node.next;
    new_node.prev = node;
    node.next.prev = new_node;
    node.next = new_node;

    if (!legalize(tcx, triangle)) {
        tcx.mapTriangleToNodes(triangle);
    }

    return new_node;
}

/**
 * Adds a triangle to the advancing front to fill a hole.
 * @param {!SweepContext} tcx - SweepContext object
 * @param node - middle node, that is the bottom of the hole
 */
function fill(tcx, node) {
    var triangle = new Triangle(node.prev.point, node.point, node.next.point);

    // TODO: should copy the constrained_edge value from neighbor triangles
    //       for now constrained_edge values are copied during the legalize
    triangle.markNeighbor(node.prev.triangle);
    triangle.markNeighbor(node.triangle);

    tcx.addToMap(triangle);

    // Update the advancing front
    node.prev.next = node.next;
    node.next.prev = node.prev;


    // If it was legalized the triangle has already been mapped
    if (!legalize(tcx, triangle)) {
        tcx.mapTriangleToNodes(triangle);
    }

    //tcx.removeNode(node);
}

/**
 * Fills holes in the Advancing Front
 * @param {!SweepContext} tcx - SweepContext object
 */
function fillAdvancingFront(tcx, n) {
    // Fill right holes
    var node = n.next;
    while (node.next) {
        // TODO integrate here changes from C++ version
        // (C++ repo revision acf81f1f1764 dated April 7, 2012)
        if (isAngleObtuse(node.point, node.next.point, node.prev.point)) {
            break;
        }
        fill(tcx, node);
        node = node.next;
    }

    // Fill left holes
    node = n.prev;
    while (node.prev) {
        // TODO integrate here changes from C++ version
        // (C++ repo revision acf81f1f1764 dated April 7, 2012)
        if (isAngleObtuse(node.point, node.next.point, node.prev.point)) {
            break;
        }
        fill(tcx, node);
        node = node.prev;
    }

    // Fill right basins
    if (n.next && n.next.next) {
        if (isBasinAngleRight(n)) {
            fillBasin(tcx, n);
        }
    }
}

/**
 * The basin angle is decided against the horizontal line [1,0].
 * @param {Node} node
 * @return {boolean} true if angle < 3*π/4
 */
function isBasinAngleRight(node) {
    var ax = node.point.x - node.next.next.point.x;
    var ay = node.point.y - node.next.next.point.y;
    assert(ay >= 0, "unordered y");
    return (ax >= 0 || Math.abs(ax) < ay);
}

/**
 * Returns true if triangle was legalized
 * @param {!SweepContext} tcx - SweepContext object
 * @return {boolean}
 */
function legalize(tcx, t) {
    // To legalize a triangle we start by finding if any of the three edges
    // violate the Delaunay condition
    for (var i = 0; i < 3; ++i) {
        if (t.delaunay_edge[i]) {
            continue;
        }
        var ot = t.getNeighbor(i);
        if (ot) {
            var p = t.getPoint(i);
            var op = ot.oppositePoint(t, p);
            var oi = ot.index(op);

            // If this is a Constrained Edge or a Delaunay Edge(only during recursive legalization)
            // then we should not try to legalize
            if (ot.constrained_edge[oi] || ot.delaunay_edge[oi]) {
                t.constrained_edge[i] = ot.constrained_edge[oi];
                continue;
            }

            var inside = inCircle(p, t.pointCCW(p), t.pointCW(p), op);
            if (inside) {
                // Lets mark this shared edge as Delaunay
                t.delaunay_edge[i] = true;
                ot.delaunay_edge[oi] = true;

                // Lets rotate shared edge one vertex CW to legalize it
                rotateTrianglePair(t, p, ot, op);

                // We now got one valid Delaunay Edge shared by two triangles
                // This gives us 4 new edges to check for Delaunay

                // Make sure that triangle to node mapping is done only one time for a specific triangle
                var not_legalized = !legalize(tcx, t);
                if (not_legalized) {
                    tcx.mapTriangleToNodes(t);
                }

                not_legalized = !legalize(tcx, ot);
                if (not_legalized) {
                    tcx.mapTriangleToNodes(ot);
                }
                // Reset the Delaunay edges, since they only are valid Delaunay edges
                // until we add a new triangle or point.
                // XXX: need to think about this. Can these edges be tried after we
                //      return to previous recursive level?
                t.delaunay_edge[i] = false;
                ot.delaunay_edge[oi] = false;

                // If triangle have been legalized no need to check the other edges since
                // the recursive legalization will handles those so we can end here.
                return true;
            }
        }
    }
    return false;
}

/**
 * <b>Requirement</b>:<br>
 * 1. a,b and c form a triangle.<br>
 * 2. a and d is know to be on opposite side of bc<br>
 * <pre>
 *                a
 *                +
 *               / \
 *              /   \
 *            b/     \c
 *            +-------+
 *           /    d    \
 *          /           \
 * </pre>
 * <b>Fact</b>: d has to be in area B to have a chance to be inside the circle formed by
 *  a,b and c<br>
 *  d is outside B if orient2d(a,b,d) or orient2d(c,a,d) is CW<br>
 *  This preknowledge gives us a way to optimize the incircle test
 * @param pa - triangle point, opposite d
 * @param pb - triangle point
 * @param pc - triangle point
 * @param pd - point opposite a
 * @return {boolean} true if d is inside circle, false if on circle edge
 */
function inCircle(pa, pb, pc, pd) {
    var adx = pa.x - pd.x;
    var ady = pa.y - pd.y;
    var bdx = pb.x - pd.x;
    var bdy = pb.y - pd.y;

    var adxbdy = adx * bdy;
    var bdxady = bdx * ady;
    var oabd = adxbdy - bdxady;
    if (oabd <= 0) {
        return false;
    }

    var cdx = pc.x - pd.x;
    var cdy = pc.y - pd.y;

    var cdxady = cdx * ady;
    var adxcdy = adx * cdy;
    var ocad = cdxady - adxcdy;
    if (ocad <= 0) {
        return false;
    }

    var bdxcdy = bdx * cdy;
    var cdxbdy = cdx * bdy;

    var alift = adx * adx + ady * ady;
    var blift = bdx * bdx + bdy * bdy;
    var clift = cdx * cdx + cdy * cdy;

    var det = alift * (bdxcdy - cdxbdy) + blift * ocad + clift * oabd;
    return det > 0;
}

/**
 * Rotates a triangle pair one vertex CW
 *<pre>
 *       n2                    n2
 *  P +-----+             P +-----+
 *    | t  /|               |\  t |
 *    |   / |               | \   |
 *  n1|  /  |n3           n1|  \  |n3
 *    | /   |    after CW   |   \ |
 *    |/ oT |               | oT \|
 *    +-----+ oP            +-----+
 *       n4                    n4
 * </pre>
 */
function rotateTrianglePair(t, p, ot, op) {
    var n1, n2, n3, n4;
    n1 = t.neighborCCW(p);
    n2 = t.neighborCW(p);
    n3 = ot.neighborCCW(op);
    n4 = ot.neighborCW(op);

    var ce1, ce2, ce3, ce4;
    ce1 = t.getConstrainedEdgeCCW(p);
    ce2 = t.getConstrainedEdgeCW(p);
    ce3 = ot.getConstrainedEdgeCCW(op);
    ce4 = ot.getConstrainedEdgeCW(op);

    var de1, de2, de3, de4;
    de1 = t.getDelaunayEdgeCCW(p);
    de2 = t.getDelaunayEdgeCW(p);
    de3 = ot.getDelaunayEdgeCCW(op);
    de4 = ot.getDelaunayEdgeCW(op);

    t.legalize(p, op);
    ot.legalize(op, p);

    // Remap delaunay_edge
    ot.setDelaunayEdgeCCW(p, de1);
    t.setDelaunayEdgeCW(p, de2);
    t.setDelaunayEdgeCCW(op, de3);
    ot.setDelaunayEdgeCW(op, de4);

    // Remap constrained_edge
    ot.setConstrainedEdgeCCW(p, ce1);
    t.setConstrainedEdgeCW(p, ce2);
    t.setConstrainedEdgeCCW(op, ce3);
    ot.setConstrainedEdgeCW(op, ce4);

    // Remap neighbors
    // XXX: might optimize the markNeighbor by keeping track of
    //      what side should be assigned to what neighbor after the
    //      rotation. Now mark neighbor does lots of testing to find
    //      the right side.
    t.clearNeighbors();
    ot.clearNeighbors();
    if (n1) {
        ot.markNeighbor(n1);
    }
    if (n2) {
        t.markNeighbor(n2);
    }
    if (n3) {
        t.markNeighbor(n3);
    }
    if (n4) {
        ot.markNeighbor(n4);
    }
    t.markNeighbor(ot);
}

/**
 * Fills a basin that has formed on the Advancing Front to the right
 * of given node.<br>
 * First we decide a left,bottom and right node that forms the
 * boundaries of the basin. Then we do a reqursive fill.
 *
 * @param {!SweepContext} tcx - SweepContext object
 * @param node - starting node, this or next node will be left node
 */
function fillBasin(tcx, node) {
    if (orient2d(node.point, node.next.point, node.next.next.point) === Orientation.CCW) {
        tcx.basin.left_node = node.next.next;
    } else {
        tcx.basin.left_node = node.next;
    }

    // Find the bottom and right node
    tcx.basin.bottom_node = tcx.basin.left_node;
    while (tcx.basin.bottom_node.next && tcx.basin.bottom_node.point.y >= tcx.basin.bottom_node.next.point.y) {
        tcx.basin.bottom_node = tcx.basin.bottom_node.next;
    }
    if (tcx.basin.bottom_node === tcx.basin.left_node) {
        // No valid basin
        return;
    }

    tcx.basin.right_node = tcx.basin.bottom_node;
    while (tcx.basin.right_node.next && tcx.basin.right_node.point.y < tcx.basin.right_node.next.point.y) {
        tcx.basin.right_node = tcx.basin.right_node.next;
    }
    if (tcx.basin.right_node === tcx.basin.bottom_node) {
        // No valid basins
        return;
    }

    tcx.basin.width = tcx.basin.right_node.point.x - tcx.basin.left_node.point.x;
    tcx.basin.left_highest = tcx.basin.left_node.point.y > tcx.basin.right_node.point.y;

    fillBasinReq(tcx, tcx.basin.bottom_node);
}

/**
 * Recursive algorithm to fill a Basin with triangles
 *
 * @param {!SweepContext} tcx - SweepContext object
 * @param node - bottom_node
 */
function fillBasinReq(tcx, node) {
    // if shallow stop filling
    if (isShallow(tcx, node)) {
        return;
    }

    fill(tcx, node);

    var o;
    if (node.prev === tcx.basin.left_node && node.next === tcx.basin.right_node) {
        return;
    } else if (node.prev === tcx.basin.left_node) {
        o = orient2d(node.point, node.next.point, node.next.next.point);
        if (o === Orientation.CW) {
            return;
        }
        node = node.next;
    } else if (node.next === tcx.basin.right_node) {
        o = orient2d(node.point, node.prev.point, node.prev.prev.point);
        if (o === Orientation.CCW) {
            return;
        }
        node = node.prev;
    } else {
        // Continue with the neighbor node with lowest Y value
        if (node.prev.point.y < node.next.point.y) {
            node = node.prev;
        } else {
            node = node.next;
        }
    }

    fillBasinReq(tcx, node);
}

function isShallow(tcx, node) {
    var height;
    if (tcx.basin.left_highest) {
        height = tcx.basin.left_node.point.y - node.point.y;
    } else {
        height = tcx.basin.right_node.point.y - node.point.y;
    }

    // if shallow stop filling
    if (tcx.basin.width > height) {
        return true;
    }
    return false;
}

function fillEdgeEvent(tcx, edge, node) {
    if (tcx.edge_event.right) {
        fillRightAboveEdgeEvent(tcx, edge, node);
    } else {
        fillLeftAboveEdgeEvent(tcx, edge, node);
    }
}

function fillRightAboveEdgeEvent(tcx, edge, node) {
    while (node.next.point.x < edge.p.x) {
        // Check if next node is below the edge
        if (orient2d(edge.q, node.next.point, edge.p) === Orientation.CCW) {
            fillRightBelowEdgeEvent(tcx, edge, node);
        } else {
            node = node.next;
        }
    }
}

function fillRightBelowEdgeEvent(tcx, edge, node) {
    if (node.point.x < edge.p.x) {
        if (orient2d(node.point, node.next.point, node.next.next.point) === Orientation.CCW) {
            // Concave
            fillRightConcaveEdgeEvent(tcx, edge, node);
        } else {
            // Convex
            fillRightConvexEdgeEvent(tcx, edge, node);
            // Retry this one
            fillRightBelowEdgeEvent(tcx, edge, node);
        }
    }
}

function fillRightConcaveEdgeEvent(tcx, edge, node) {
    fill(tcx, node.next);
    if (node.next.point !== edge.p) {
        // Next above or below edge?
        if (orient2d(edge.q, node.next.point, edge.p) === Orientation.CCW) {
            // Below
            if (orient2d(node.point, node.next.point, node.next.next.point) === Orientation.CCW) {
                // Next is concave
                fillRightConcaveEdgeEvent(tcx, edge, node);
            } else {
                // Next is convex
                /* jshint noempty:false */
            }
        }
    }
}

function fillRightConvexEdgeEvent(tcx, edge, node) {
    // Next concave or convex?
    if (orient2d(node.next.point, node.next.next.point, node.next.next.next.point) === Orientation.CCW) {
        // Concave
        fillRightConcaveEdgeEvent(tcx, edge, node.next);
    } else {
        // Convex
        // Next above or below edge?
        if (orient2d(edge.q, node.next.next.point, edge.p) === Orientation.CCW) {
            // Below
            fillRightConvexEdgeEvent(tcx, edge, node.next);
        } else {
            // Above
            /* jshint noempty:false */
        }
    }
}

function fillLeftAboveEdgeEvent(tcx, edge, node) {
    while (node.prev.point.x > edge.p.x) {
        // Check if next node is below the edge
        if (orient2d(edge.q, node.prev.point, edge.p) === Orientation.CW) {
            fillLeftBelowEdgeEvent(tcx, edge, node);
        } else {
            node = node.prev;
        }
    }
}

function fillLeftBelowEdgeEvent(tcx, edge, node) {
    if (node.point.x > edge.p.x) {
        if (orient2d(node.point, node.prev.point, node.prev.prev.point) === Orientation.CW) {
            // Concave
            fillLeftConcaveEdgeEvent(tcx, edge, node);
        } else {
            // Convex
            fillLeftConvexEdgeEvent(tcx, edge, node);
            // Retry this one
            fillLeftBelowEdgeEvent(tcx, edge, node);
        }
    }
}

function fillLeftConvexEdgeEvent(tcx, edge, node) {
    // Next concave or convex?
    if (orient2d(node.prev.point, node.prev.prev.point, node.prev.prev.prev.point) === Orientation.CW) {
        // Concave
        fillLeftConcaveEdgeEvent(tcx, edge, node.prev);
    } else {
        // Convex
        // Next above or below edge?
        if (orient2d(edge.q, node.prev.prev.point, edge.p) === Orientation.CW) {
            // Below
            fillLeftConvexEdgeEvent(tcx, edge, node.prev);
        } else {
            // Above
            /* jshint noempty:false */
        }
    }
}

function fillLeftConcaveEdgeEvent(tcx, edge, node) {
    fill(tcx, node.prev);
    if (node.prev.point !== edge.p) {
        // Next above or below edge?
        if (orient2d(edge.q, node.prev.point, edge.p) === Orientation.CW) {
            // Below
            if (orient2d(node.point, node.prev.point, node.prev.prev.point) === Orientation.CW) {
                // Next is concave
                fillLeftConcaveEdgeEvent(tcx, edge, node);
            } else {
                // Next is convex
                /* jshint noempty:false */
            }
        }
    }
}

function flipEdgeEvent(tcx, ep, eq, t, p) {
    var ot = t.neighborAcross(p);
    assert(ot, "FLIP failed due to missing triangle!");

    var op = ot.oppositePoint(t, p);

    // Additional check from Java version (see issue #88)
    if (t.getConstrainedEdgeAcross(p)) {
        var index = t.index(p);
        throw new PointError("poly2tri Intersecting Constraints",
                [p, op, t.getPoint((index + 1) % 3), t.getPoint((index + 2) % 3)]);
    }

    if (inScanArea(p, t.pointCCW(p), t.pointCW(p), op)) {
        // Lets rotate shared edge one vertex CW
        rotateTrianglePair(t, p, ot, op);
        tcx.mapTriangleToNodes(t);
        tcx.mapTriangleToNodes(ot);

        // XXX: in the original C++ code for the next 2 lines, we are
        // comparing point values (and not pointers). In this JavaScript
        // code, we are comparing point references (pointers). This works
        // because we can't have 2 different points with the same values.
        // But to be really equivalent, we should use "Point.equals" here.
        if (p === eq && op === ep) {
            if (eq === tcx.edge_event.constrained_edge.q && ep === tcx.edge_event.constrained_edge.p) {
                t.markConstrainedEdgeByPoints(ep, eq);
                ot.markConstrainedEdgeByPoints(ep, eq);
                legalize(tcx, t);
                legalize(tcx, ot);
            } else {
                // XXX: I think one of the triangles should be legalized here?
                /* jshint noempty:false */
            }
        } else {
            var o = orient2d(eq, op, ep);
            t = nextFlipTriangle(tcx, o, t, ot, p, op);
            flipEdgeEvent(tcx, ep, eq, t, p);
        }
    } else {
        var newP = nextFlipPoint(ep, eq, ot, op);
        flipScanEdgeEvent(tcx, ep, eq, t, ot, newP);
        edgeEventByPoints(tcx, ep, eq, t, p);
    }
}

/**
 * After a flip we have two triangles and know that only one will still be
 * intersecting the edge. So decide which to contiune with and legalize the other
 *
 * @param {!SweepContext} tcx - SweepContext object
 * @param o - should be the result of an orient2d( eq, op, ep )
 * @param t - triangle 1
 * @param ot - triangle 2
 * @param p - a point shared by both triangles
 * @param op - another point shared by both triangles
 * @return returns the triangle still intersecting the edge
 */
function nextFlipTriangle(tcx, o, t, ot, p, op) {
    var edge_index;
    if (o === Orientation.CCW) {
        // ot is not crossing edge after flip
        edge_index = ot.edgeIndex(p, op);
        ot.delaunay_edge[edge_index] = true;
        legalize(tcx, ot);
        ot.clearDelaunayEdges();
        return t;
    }

    // t is not crossing edge after flip
    edge_index = t.edgeIndex(p, op);

    t.delaunay_edge[edge_index] = true;
    legalize(tcx, t);
    t.clearDelaunayEdges();
    return ot;
}

/**
 * When we need to traverse from one triangle to the next we need
 * the point in current triangle that is the opposite point to the next
 * triangle.
 */
function nextFlipPoint(ep, eq, ot, op) {
    var o2d = orient2d(eq, op, ep);
    if (o2d === Orientation.CW) {
        // Right
        return ot.pointCCW(op);
    } else if (o2d === Orientation.CCW) {
        // Left
        return ot.pointCW(op);
    } else {
        throw new PointError("poly2tri [Unsupported] nextFlipPoint: opposing point on constrained edge!", [eq, op, ep]);
    }
}

/**
 * Scan part of the FlipScan algorithm<br>
 * When a triangle pair isn't flippable we will scan for the next
 * point that is inside the flip triangle scan area. When found
 * we generate a new flipEdgeEvent
 *
 * @param {!SweepContext} tcx - SweepContext object
 * @param ep - last point on the edge we are traversing
 * @param eq - first point on the edge we are traversing
 * @param {!Triangle} flip_triangle - the current triangle sharing the point eq with edge
 * @param t
 * @param p
 */
function flipScanEdgeEvent(tcx, ep, eq, flip_triangle, t, p) {
    var ot = t.neighborAcross(p);
    assert(ot, "FLIP failed due to missing triangle");

    var op = ot.oppositePoint(t, p);

    if (inScanArea(eq, flip_triangle.pointCCW(eq), flip_triangle.pointCW(eq), op)) {
        // flip with new edge op.eq
        flipEdgeEvent(tcx, eq, op, ot, op);
    } else {
        var newP = nextFlipPoint(ep, eq, ot, op);
        flipScanEdgeEvent(tcx, ep, eq, flip_triangle, ot, newP);
    }
}


// ----------------------------------------------------------------------Exports

exports.triangulate = triangulate;

},{"./advancingfront":2,"./assert":3,"./pointerror":5,"./triangle":9,"./utils":10}],8:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

/* jshint maxcomplexity:6 */

"use strict";


/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it
 * easier to keep the 2 versions in sync.
 */

var PointError = _dereq_('./pointerror');
var Point = _dereq_('./point');
var Triangle = _dereq_('./triangle');
var sweep = _dereq_('./sweep');
var AdvancingFront = _dereq_('./advancingfront');
var Node = AdvancingFront.Node;


// ------------------------------------------------------------------------utils

/**
 * Initial triangle factor, seed triangle will extend 30% of
 * PointSet width to both left and right.
 * @private
 * @const
 */
var kAlpha = 0.3;


// -------------------------------------------------------------------------Edge
/**
 * Represents a simple polygon's edge
 * @constructor
 * @struct
 * @private
 * @param {Point} p1
 * @param {Point} p2
 * @throw {PointError} if p1 is same as p2
 */
var Edge = function(p1, p2) {
    this.p = p1;
    this.q = p2;

    if (p1.y > p2.y) {
        this.q = p1;
        this.p = p2;
    } else if (p1.y === p2.y) {
        if (p1.x > p2.x) {
            this.q = p1;
            this.p = p2;
        } else if (p1.x === p2.x) {
            throw new PointError('poly2tri Invalid Edge constructor: repeated points!', [p1]);
        }
    }

    if (!this.q._p2t_edge_list) {
        this.q._p2t_edge_list = [];
    }
    this.q._p2t_edge_list.push(this);
};


// ------------------------------------------------------------------------Basin
/**
 * @constructor
 * @struct
 * @private
 */
var Basin = function() {
    /** @type {Node} */
    this.left_node = null;
    /** @type {Node} */
    this.bottom_node = null;
    /** @type {Node} */
    this.right_node = null;
    /** @type {number} */
    this.width = 0.0;
    /** @type {boolean} */
    this.left_highest = false;
};

Basin.prototype.clear = function() {
    this.left_node = null;
    this.bottom_node = null;
    this.right_node = null;
    this.width = 0.0;
    this.left_highest = false;
};

// --------------------------------------------------------------------EdgeEvent
/**
 * @constructor
 * @struct
 * @private
 */
var EdgeEvent = function() {
    /** @type {Edge} */
    this.constrained_edge = null;
    /** @type {boolean} */
    this.right = false;
};

// ----------------------------------------------------SweepContext (public API)
/**
 * SweepContext constructor option
 * @typedef {Object} SweepContextOptions
 * @property {boolean=} cloneArrays - if <code>true</code>, do a shallow copy of the Array parameters
 *                  (contour, holes). Points inside arrays are never copied.
 *                  Default is <code>false</code> : keep a reference to the array arguments,
 *                  who will be modified in place.
 */
/**
 * Constructor for the triangulation context.
 * It accepts a simple polyline (with non repeating points),
 * which defines the constrained edges.
 *
 * @example
 *          var contour = [
 *              new poly2tri.Point(100, 100),
 *              new poly2tri.Point(100, 300),
 *              new poly2tri.Point(300, 300),
 *              new poly2tri.Point(300, 100)
 *          ];
 *          var swctx = new poly2tri.SweepContext(contour, {cloneArrays: true});
 * @example
 *          var contour = [{x:100, y:100}, {x:100, y:300}, {x:300, y:300}, {x:300, y:100}];
 *          var swctx = new poly2tri.SweepContext(contour, {cloneArrays: true});
 * @constructor
 * @public
 * @struct
 * @param {Array.<XY>} contour - array of point objects. The points can be either {@linkcode Point} instances,
 *          or any "Point like" custom class with <code>{x, y}</code> attributes.
 * @param {SweepContextOptions=} options - constructor options
 */
var SweepContext = function(contour, options) {
    options = options || {};
    this.triangles_ = [];
    this.map_ = [];
    this.points_ = (options.cloneArrays ? contour.slice(0) : contour);
    this.edge_list = [];

    // Bounding box of all points. Computed at the start of the triangulation,
    // it is stored in case it is needed by the caller.
    this.pmin_ = this.pmax_ = null;

    /**
     * Advancing front
     * @private
     * @type {AdvancingFront}
     */
    this.front_ = null;

    /**
     * head point used with advancing front
     * @private
     * @type {Point}
     */
    this.head_ = null;

    /**
     * tail point used with advancing front
     * @private
     * @type {Point}
     */
    this.tail_ = null;

    /**
     * @private
     * @type {Node}
     */
    this.af_head_ = null;
    /**
     * @private
     * @type {Node}
     */
    this.af_middle_ = null;
    /**
     * @private
     * @type {Node}
     */
    this.af_tail_ = null;

    this.basin = new Basin();
    this.edge_event = new EdgeEvent();

    this.initEdges(this.points_);
};


/**
 * Add a hole to the constraints
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var hole = [
 *          new poly2tri.Point(200, 200),
 *          new poly2tri.Point(200, 250),
 *          new poly2tri.Point(250, 250)
 *      ];
 *      swctx.addHole(hole);
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.addHole([{x:200, y:200}, {x:200, y:250}, {x:250, y:250}]);
 * @public
 * @param {Array.<XY>} polyline - array of "Point like" objects with {x,y}
 */
SweepContext.prototype.addHole = function(polyline) {
    this.initEdges(polyline);
    var i, len = polyline.length;
    for (i = 0; i < len; i++) {
        this.points_.push(polyline[i]);
    }
    return this; // for chaining
};

/**
 * For backward compatibility
 * @function
 * @deprecated use {@linkcode SweepContext#addHole} instead
 */
SweepContext.prototype.AddHole = SweepContext.prototype.addHole;


/**
 * Add several holes to the constraints
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var holes = [
 *          [ new poly2tri.Point(200, 200), new poly2tri.Point(200, 250), new poly2tri.Point(250, 250) ],
 *          [ new poly2tri.Point(300, 300), new poly2tri.Point(300, 350), new poly2tri.Point(350, 350) ]
 *      ];
 *      swctx.addHoles(holes);
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var holes = [
 *          [{x:200, y:200}, {x:200, y:250}, {x:250, y:250}],
 *          [{x:300, y:300}, {x:300, y:350}, {x:350, y:350}]
 *      ];
 *      swctx.addHoles(holes);
 * @public
 * @param {Array.<Array.<XY>>} holes - array of array of "Point like" objects with {x,y}
 */
// Method added in the JavaScript version (was not present in the c++ version)
SweepContext.prototype.addHoles = function(holes) {
    var i, len = holes.length;
    for (i = 0; i < len; i++) {
        this.initEdges(holes[i]);
    }
    this.points_ = this.points_.concat.apply(this.points_, holes);
    return this; // for chaining
};


/**
 * Add a Steiner point to the constraints
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var point = new poly2tri.Point(150, 150);
 *      swctx.addPoint(point);
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.addPoint({x:150, y:150});
 * @public
 * @param {XY} point - any "Point like" object with {x,y}
 */
SweepContext.prototype.addPoint = function(point) {
    this.points_.push(point);
    return this; // for chaining
};

/**
 * For backward compatibility
 * @function
 * @deprecated use {@linkcode SweepContext#addPoint} instead
 */
SweepContext.prototype.AddPoint = SweepContext.prototype.addPoint;


/**
 * Add several Steiner points to the constraints
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var points = [
 *          new poly2tri.Point(150, 150),
 *          new poly2tri.Point(200, 250),
 *          new poly2tri.Point(250, 250)
 *      ];
 *      swctx.addPoints(points);
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.addPoints([{x:150, y:150}, {x:200, y:250}, {x:250, y:250}]);
 * @public
 * @param {Array.<XY>} points - array of "Point like" object with {x,y}
 */
// Method added in the JavaScript version (was not present in the c++ version)
SweepContext.prototype.addPoints = function(points) {
    this.points_ = this.points_.concat(points);
    return this; // for chaining
};


/**
 * Triangulate the polygon with holes and Steiner points.
 * Do this AFTER you've added the polyline, holes, and Steiner points
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.triangulate();
 *      var triangles = swctx.getTriangles();
 * @public
 */
// Shortcut method for sweep.triangulate(SweepContext).
// Method added in the JavaScript version (was not present in the c++ version)
SweepContext.prototype.triangulate = function() {
    sweep.triangulate(this);
    return this; // for chaining
};


/**
 * Get the bounding box of the provided constraints (contour, holes and
 * Steinter points). Warning : these values are not available if the triangulation
 * has not been done yet.
 * @public
 * @returns {{min:Point,max:Point}} object with 'min' and 'max' Point
 */
// Method added in the JavaScript version (was not present in the c++ version)
SweepContext.prototype.getBoundingBox = function() {
    return {min: this.pmin_, max: this.pmax_};
};

/**
 * Get result of triangulation.
 * The output triangles have vertices which are references
 * to the initial input points (not copies): any custom fields in the
 * initial points can be retrieved in the output triangles.
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.triangulate();
 *      var triangles = swctx.getTriangles();
 * @example
 *      var contour = [{x:100, y:100, id:1}, {x:100, y:300, id:2}, {x:300, y:300, id:3}];
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.triangulate();
 *      var triangles = swctx.getTriangles();
 *      typeof triangles[0].getPoint(0).id
 *      // → "number"
 * @public
 * @returns {array<Triangle>}   array of triangles
 */
SweepContext.prototype.getTriangles = function() {
    return this.triangles_;
};

/**
 * For backward compatibility
 * @function
 * @deprecated use {@linkcode SweepContext#getTriangles} instead
 */
SweepContext.prototype.GetTriangles = SweepContext.prototype.getTriangles;


// ---------------------------------------------------SweepContext (private API)

/** @private */
SweepContext.prototype.front = function() {
    return this.front_;
};

/** @private */
SweepContext.prototype.pointCount = function() {
    return this.points_.length;
};

/** @private */
SweepContext.prototype.head = function() {
    return this.head_;
};

/** @private */
SweepContext.prototype.setHead = function(p1) {
    this.head_ = p1;
};

/** @private */
SweepContext.prototype.tail = function() {
    return this.tail_;
};

/** @private */
SweepContext.prototype.setTail = function(p1) {
    this.tail_ = p1;
};

/** @private */
SweepContext.prototype.getMap = function() {
    return this.map_;
};

/** @private */
SweepContext.prototype.initTriangulation = function() {
    var xmax = this.points_[0].x;
    var xmin = this.points_[0].x;
    var ymax = this.points_[0].y;
    var ymin = this.points_[0].y;

    // Calculate bounds
    var i, len = this.points_.length;
    for (i = 1; i < len; i++) {
        var p = this.points_[i];
        /* jshint expr:true */
        (p.x > xmax) && (xmax = p.x);
        (p.x < xmin) && (xmin = p.x);
        (p.y > ymax) && (ymax = p.y);
        (p.y < ymin) && (ymin = p.y);
    }
    this.pmin_ = new Point(xmin, ymin);
    this.pmax_ = new Point(xmax, ymax);

    var dx = kAlpha * (xmax - xmin);
    var dy = kAlpha * (ymax - ymin);
    this.head_ = new Point(xmax + dx, ymin - dy);
    this.tail_ = new Point(xmin - dx, ymin - dy);

    // Sort points along y-axis
    this.points_.sort(Point.compare);
};

/** @private */
SweepContext.prototype.initEdges = function(polyline) {
    var i, len = polyline.length;
    for (i = 0; i < len; ++i) {
        this.edge_list.push(new Edge(polyline[i], polyline[(i + 1) % len]));
    }
};

/** @private */
SweepContext.prototype.getPoint = function(index) {
    return this.points_[index];
};

/** @private */
SweepContext.prototype.addToMap = function(triangle) {
    this.map_.push(triangle);
};

/** @private */
SweepContext.prototype.locateNode = function(point) {
    return this.front_.locateNode(point.x);
};

/** @private */
SweepContext.prototype.createAdvancingFront = function() {
    var head;
    var middle;
    var tail;
    // Initial triangle
    var triangle = new Triangle(this.points_[0], this.tail_, this.head_);

    this.map_.push(triangle);

    head = new Node(triangle.getPoint(1), triangle);
    middle = new Node(triangle.getPoint(0), triangle);
    tail = new Node(triangle.getPoint(2));

    this.front_ = new AdvancingFront(head, tail);

    head.next = middle;
    middle.next = tail;
    middle.prev = head;
    tail.prev = middle;
};

/** @private */
SweepContext.prototype.removeNode = function(node) {
    // do nothing
    /* jshint unused:false */
};

/** @private */
SweepContext.prototype.mapTriangleToNodes = function(t) {
    for (var i = 0; i < 3; ++i) {
        if (!t.getNeighbor(i)) {
            var n = this.front_.locatePoint(t.pointCW(t.getPoint(i)));
            if (n) {
                n.triangle = t;
            }
        }
    }
};

/** @private */
SweepContext.prototype.removeFromMap = function(triangle) {
    var i, map = this.map_, len = map.length;
    for (i = 0; i < len; i++) {
        if (map[i] === triangle) {
            map.splice(i, 1);
            break;
        }
    }
};

/**
 * Do a depth first traversal to collect triangles
 * @private
 * @param {Triangle} triangle start
 */
SweepContext.prototype.meshClean = function(triangle) {
    // New implementation avoids recursive calls and use a loop instead.
    // Cf. issues # 57, 65 and 69.
    var triangles = [triangle], t, i;
    /* jshint boss:true */
    while (t = triangles.pop()) {
        if (!t.isInterior()) {
            t.setInterior(true);
            this.triangles_.push(t);
            for (i = 0; i < 3; i++) {
                if (!t.constrained_edge[i]) {
                    triangles.push(t.getNeighbor(i));
                }
            }
        }
    }
};

// ----------------------------------------------------------------------Exports

module.exports = SweepContext;

},{"./advancingfront":2,"./point":4,"./pointerror":5,"./sweep":7,"./triangle":9}],9:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

/* jshint maxcomplexity:10 */

"use strict";


/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it
 * easier to keep the 2 versions in sync.
 */

var xy = _dereq_("./xy");


// ---------------------------------------------------------------------Triangle
/**
 * Triangle class.<br>
 * Triangle-based data structures are known to have better performance than
 * quad-edge structures.
 * See: J. Shewchuk, "Triangle: Engineering a 2D Quality Mesh Generator and
 * Delaunay Triangulator", "Triangulations in CGAL"
 *
 * @constructor
 * @struct
 * @param {!XY} pa  point object with {x,y}
 * @param {!XY} pb  point object with {x,y}
 * @param {!XY} pc  point object with {x,y}
 */
var Triangle = function(a, b, c) {
    /**
     * Triangle points
     * @private
     * @type {Array.<XY>}
     */
    this.points_ = [a, b, c];

    /**
     * Neighbor list
     * @private
     * @type {Array.<Triangle>}
     */
    this.neighbors_ = [null, null, null];

    /**
     * Has this triangle been marked as an interior triangle?
     * @private
     * @type {boolean}
     */
    this.interior_ = false;

    /**
     * Flags to determine if an edge is a Constrained edge
     * @private
     * @type {Array.<boolean>}
     */
    this.constrained_edge = [false, false, false];

    /**
     * Flags to determine if an edge is a Delauney edge
     * @private
     * @type {Array.<boolean>}
     */
    this.delaunay_edge = [false, false, false];
};

var p2s = xy.toString;
/**
 * For pretty printing ex. <code>"[(5;42)(10;20)(21;30)]"</code>.
 * @public
 * @return {string}
 */
Triangle.prototype.toString = function() {
    return ("[" + p2s(this.points_[0]) + p2s(this.points_[1]) + p2s(this.points_[2]) + "]");
};

/**
 * Get one vertice of the triangle.
 * The output triangles of a triangulation have vertices which are references
 * to the initial input points (not copies): any custom fields in the
 * initial points can be retrieved in the output triangles.
 * @example
 *      var contour = [{x:100, y:100, id:1}, {x:100, y:300, id:2}, {x:300, y:300, id:3}];
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.triangulate();
 *      var triangles = swctx.getTriangles();
 *      typeof triangles[0].getPoint(0).id
 *      // → "number"
 * @param {number} index - vertice index: 0, 1 or 2
 * @public
 * @returns {XY}
 */
Triangle.prototype.getPoint = function(index) {
    return this.points_[index];
};

/**
 * For backward compatibility
 * @function
 * @deprecated use {@linkcode Triangle#getPoint} instead
 */
Triangle.prototype.GetPoint = Triangle.prototype.getPoint;

/**
 * Get all 3 vertices of the triangle as an array
 * @public
 * @return {Array.<XY>}
 */
// Method added in the JavaScript version (was not present in the c++ version)
Triangle.prototype.getPoints = function() {
    return this.points_;
};

/**
 * @private
 * @param {number} index
 * @returns {?Triangle}
 */
Triangle.prototype.getNeighbor = function(index) {
    return this.neighbors_[index];
};

/**
 * Test if this Triangle contains the Point object given as parameter as one of its vertices.
 * Only point references are compared, not values.
 * @public
 * @param {XY} point - point object with {x,y}
 * @return {boolean} <code>True</code> if the Point object is of the Triangle's vertices,
 *         <code>false</code> otherwise.
 */
Triangle.prototype.containsPoint = function(point) {
    var points = this.points_;
    // Here we are comparing point references, not values
    return (point === points[0] || point === points[1] || point === points[2]);
};

/**
 * Test if this Triangle contains the Edge object given as parameter as its
 * bounding edges. Only point references are compared, not values.
 * @private
 * @param {Edge} edge
 * @return {boolean} <code>True</code> if the Edge object is of the Triangle's bounding
 *         edges, <code>false</code> otherwise.
 */
Triangle.prototype.containsEdge = function(edge) {
    return this.containsPoint(edge.p) && this.containsPoint(edge.q);
};

/**
 * Test if this Triangle contains the two Point objects given as parameters among its vertices.
 * Only point references are compared, not values.
 * @param {XY} p1 - point object with {x,y}
 * @param {XY} p2 - point object with {x,y}
 * @return {boolean}
 */
Triangle.prototype.containsPoints = function(p1, p2) {
    return this.containsPoint(p1) && this.containsPoint(p2);
};

/**
 * Has this triangle been marked as an interior triangle?
 * @returns {boolean}
 */
Triangle.prototype.isInterior = function() {
    return this.interior_;
};

/**
 * Mark this triangle as an interior triangle
 * @private
 * @param {boolean} interior
 * @returns {Triangle} this
 */
Triangle.prototype.setInterior = function(interior) {
    this.interior_ = interior;
    return this;
};

/**
 * Update neighbor pointers.
 * @private
 * @param {XY} p1 - point object with {x,y}
 * @param {XY} p2 - point object with {x,y}
 * @param {Triangle} t Triangle object.
 * @throws {Error} if can't find objects
 */
Triangle.prototype.markNeighborPointers = function(p1, p2, t) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if ((p1 === points[2] && p2 === points[1]) || (p1 === points[1] && p2 === points[2])) {
        this.neighbors_[0] = t;
    } else if ((p1 === points[0] && p2 === points[2]) || (p1 === points[2] && p2 === points[0])) {
        this.neighbors_[1] = t;
    } else if ((p1 === points[0] && p2 === points[1]) || (p1 === points[1] && p2 === points[0])) {
        this.neighbors_[2] = t;
    } else {
        throw new Error('poly2tri Invalid Triangle.markNeighborPointers() call');
    }
};

/**
 * Exhaustive search to update neighbor pointers
 * @private
 * @param {!Triangle} t
 */
Triangle.prototype.markNeighbor = function(t) {
    var points = this.points_;
    if (t.containsPoints(points[1], points[2])) {
        this.neighbors_[0] = t;
        t.markNeighborPointers(points[1], points[2], this);
    } else if (t.containsPoints(points[0], points[2])) {
        this.neighbors_[1] = t;
        t.markNeighborPointers(points[0], points[2], this);
    } else if (t.containsPoints(points[0], points[1])) {
        this.neighbors_[2] = t;
        t.markNeighborPointers(points[0], points[1], this);
    }
};


Triangle.prototype.clearNeighbors = function() {
    this.neighbors_[0] = null;
    this.neighbors_[1] = null;
    this.neighbors_[2] = null;
};

Triangle.prototype.clearDelaunayEdges = function() {
    this.delaunay_edge[0] = false;
    this.delaunay_edge[1] = false;
    this.delaunay_edge[2] = false;
};

/**
 * Returns the point clockwise to the given point.
 * @private
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.pointCW = function(p) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (p === points[0]) {
        return points[2];
    } else if (p === points[1]) {
        return points[0];
    } else if (p === points[2]) {
        return points[1];
    } else {
        return null;
    }
};

/**
 * Returns the point counter-clockwise to the given point.
 * @private
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.pointCCW = function(p) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (p === points[0]) {
        return points[1];
    } else if (p === points[1]) {
        return points[2];
    } else if (p === points[2]) {
        return points[0];
    } else {
        return null;
    }
};

/**
 * Returns the neighbor clockwise to given point.
 * @private
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.neighborCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.neighbors_[1];
    } else if (p === this.points_[1]) {
        return this.neighbors_[2];
    } else {
        return this.neighbors_[0];
    }
};

/**
 * Returns the neighbor counter-clockwise to given point.
 * @private
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.neighborCCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.neighbors_[2];
    } else if (p === this.points_[1]) {
        return this.neighbors_[0];
    } else {
        return this.neighbors_[1];
    }
};

Triangle.prototype.getConstrainedEdgeCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.constrained_edge[1];
    } else if (p === this.points_[1]) {
        return this.constrained_edge[2];
    } else {
        return this.constrained_edge[0];
    }
};

Triangle.prototype.getConstrainedEdgeCCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.constrained_edge[2];
    } else if (p === this.points_[1]) {
        return this.constrained_edge[0];
    } else {
        return this.constrained_edge[1];
    }
};

// Additional check from Java version (see issue #88)
Triangle.prototype.getConstrainedEdgeAcross = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.constrained_edge[0];
    } else if (p === this.points_[1]) {
        return this.constrained_edge[1];
    } else {
        return this.constrained_edge[2];
    }
};

Triangle.prototype.setConstrainedEdgeCW = function(p, ce) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        this.constrained_edge[1] = ce;
    } else if (p === this.points_[1]) {
        this.constrained_edge[2] = ce;
    } else {
        this.constrained_edge[0] = ce;
    }
};

Triangle.prototype.setConstrainedEdgeCCW = function(p, ce) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        this.constrained_edge[2] = ce;
    } else if (p === this.points_[1]) {
        this.constrained_edge[0] = ce;
    } else {
        this.constrained_edge[1] = ce;
    }
};

Triangle.prototype.getDelaunayEdgeCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.delaunay_edge[1];
    } else if (p === this.points_[1]) {
        return this.delaunay_edge[2];
    } else {
        return this.delaunay_edge[0];
    }
};

Triangle.prototype.getDelaunayEdgeCCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.delaunay_edge[2];
    } else if (p === this.points_[1]) {
        return this.delaunay_edge[0];
    } else {
        return this.delaunay_edge[1];
    }
};

Triangle.prototype.setDelaunayEdgeCW = function(p, e) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        this.delaunay_edge[1] = e;
    } else if (p === this.points_[1]) {
        this.delaunay_edge[2] = e;
    } else {
        this.delaunay_edge[0] = e;
    }
};

Triangle.prototype.setDelaunayEdgeCCW = function(p, e) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        this.delaunay_edge[2] = e;
    } else if (p === this.points_[1]) {
        this.delaunay_edge[0] = e;
    } else {
        this.delaunay_edge[1] = e;
    }
};

/**
 * The neighbor across to given point.
 * @private
 * @param {XY} p - point object with {x,y}
 * @returns {Triangle}
 */
Triangle.prototype.neighborAcross = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.neighbors_[0];
    } else if (p === this.points_[1]) {
        return this.neighbors_[1];
    } else {
        return this.neighbors_[2];
    }
};

/**
 * @private
 * @param {!Triangle} t Triangle object.
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.oppositePoint = function(t, p) {
    var cw = t.pointCW(p);
    return this.pointCW(cw);
};

/**
 * Legalize triangle by rotating clockwise around oPoint
 * @private
 * @param {XY} opoint - point object with {x,y}
 * @param {XY} npoint - point object with {x,y}
 * @throws {Error} if oPoint can not be found
 */
Triangle.prototype.legalize = function(opoint, npoint) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (opoint === points[0]) {
        points[1] = points[0];
        points[0] = points[2];
        points[2] = npoint;
    } else if (opoint === points[1]) {
        points[2] = points[1];
        points[1] = points[0];
        points[0] = npoint;
    } else if (opoint === points[2]) {
        points[0] = points[2];
        points[2] = points[1];
        points[1] = npoint;
    } else {
        throw new Error('poly2tri Invalid Triangle.legalize() call');
    }
};

/**
 * Returns the index of a point in the triangle.
 * The point *must* be a reference to one of the triangle's vertices.
 * @private
 * @param {XY} p - point object with {x,y}
 * @returns {number} index 0, 1 or 2
 * @throws {Error} if p can not be found
 */
Triangle.prototype.index = function(p) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (p === points[0]) {
        return 0;
    } else if (p === points[1]) {
        return 1;
    } else if (p === points[2]) {
        return 2;
    } else {
        throw new Error('poly2tri Invalid Triangle.index() call');
    }
};

/**
 * @private
 * @param {XY} p1 - point object with {x,y}
 * @param {XY} p2 - point object with {x,y}
 * @return {number} index 0, 1 or 2, or -1 if errror
 */
Triangle.prototype.edgeIndex = function(p1, p2) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (p1 === points[0]) {
        if (p2 === points[1]) {
            return 2;
        } else if (p2 === points[2]) {
            return 1;
        }
    } else if (p1 === points[1]) {
        if (p2 === points[2]) {
            return 0;
        } else if (p2 === points[0]) {
            return 2;
        }
    } else if (p1 === points[2]) {
        if (p2 === points[0]) {
            return 1;
        } else if (p2 === points[1]) {
            return 0;
        }
    }
    return -1;
};

/**
 * Mark an edge of this triangle as constrained.
 * @private
 * @param {number} index - edge index
 */
Triangle.prototype.markConstrainedEdgeByIndex = function(index) {
    this.constrained_edge[index] = true;
};
/**
 * Mark an edge of this triangle as constrained.
 * @private
 * @param {Edge} edge instance
 */
Triangle.prototype.markConstrainedEdgeByEdge = function(edge) {
    this.markConstrainedEdgeByPoints(edge.p, edge.q);
};
/**
 * Mark an edge of this triangle as constrained.
 * This method takes two Point instances defining the edge of the triangle.
 * @private
 * @param {XY} p - point object with {x,y}
 * @param {XY} q - point object with {x,y}
 */
Triangle.prototype.markConstrainedEdgeByPoints = function(p, q) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if ((q === points[0] && p === points[1]) || (q === points[1] && p === points[0])) {
        this.constrained_edge[2] = true;
    } else if ((q === points[0] && p === points[2]) || (q === points[2] && p === points[0])) {
        this.constrained_edge[1] = true;
    } else if ((q === points[1] && p === points[2]) || (q === points[2] && p === points[1])) {
        this.constrained_edge[0] = true;
    }
};


// ---------------------------------------------------------Exports (public API)

module.exports = Triangle;

},{"./xy":11}],10:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";

/**
 * Precision to detect repeated or collinear points
 * @private
 * @const {number}
 * @default
 */
var EPSILON = 1e-12;
exports.EPSILON = EPSILON;

/**
 * @private
 * @enum {number}
 * @readonly
 */
var Orientation = {
    "CW": 1,
    "CCW": -1,
    "COLLINEAR": 0
};
exports.Orientation = Orientation;


/**
 * Formula to calculate signed area<br>
 * Positive if CCW<br>
 * Negative if CW<br>
 * 0 if collinear<br>
 * <pre>
 * A[P1,P2,P3]  =  (x1*y2 - y1*x2) + (x2*y3 - y2*x3) + (x3*y1 - y3*x1)
 *              =  (x1-x3)*(y2-y3) - (y1-y3)*(x2-x3)
 * </pre>
 *
 * @private
 * @param {!XY} pa  point object with {x,y}
 * @param {!XY} pb  point object with {x,y}
 * @param {!XY} pc  point object with {x,y}
 * @return {Orientation}
 */
function orient2d(pa, pb, pc) {
    var detleft = (pa.x - pc.x) * (pb.y - pc.y);
    var detright = (pa.y - pc.y) * (pb.x - pc.x);
    var val = detleft - detright;
    if (val > -(EPSILON) && val < (EPSILON)) {
        return Orientation.COLLINEAR;
    } else if (val > 0) {
        return Orientation.CCW;
    } else {
        return Orientation.CW;
    }
}
exports.orient2d = orient2d;


/**
 *
 * @private
 * @param {!XY} pa  point object with {x,y}
 * @param {!XY} pb  point object with {x,y}
 * @param {!XY} pc  point object with {x,y}
 * @param {!XY} pd  point object with {x,y}
 * @return {boolean}
 */
function inScanArea(pa, pb, pc, pd) {
    var oadb = (pa.x - pb.x) * (pd.y - pb.y) - (pd.x - pb.x) * (pa.y - pb.y);
    if (oadb >= -EPSILON) {
        return false;
    }

    var oadc = (pa.x - pc.x) * (pd.y - pc.y) - (pd.x - pc.x) * (pa.y - pc.y);
    if (oadc <= EPSILON) {
        return false;
    }
    return true;
}
exports.inScanArea = inScanArea;


/**
 * Check if the angle between (pa,pb) and (pa,pc) is obtuse i.e. (angle > π/2 || angle < -π/2)
 *
 * @private
 * @param {!XY} pa  point object with {x,y}
 * @param {!XY} pb  point object with {x,y}
 * @param {!XY} pc  point object with {x,y}
 * @return {boolean} true if angle is obtuse
 */
function isAngleObtuse(pa, pb, pc) {
    var ax = pb.x - pa.x;
    var ay = pb.y - pa.y;
    var bx = pc.x - pa.x;
    var by = pc.y - pa.y;
    return (ax * bx + ay * by) < 0;
}
exports.isAngleObtuse = isAngleObtuse;


},{}],11:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";

/**
 * The following functions operate on "Point" or any "Point like" object with {x,y},
 * as defined by the {@link XY} type
 * ([duck typing]{@link http://en.wikipedia.org/wiki/Duck_typing}).
 * @module
 * @private
 */

/**
 * poly2tri.js supports using custom point class instead of {@linkcode Point}.
 * Any "Point like" object with <code>{x, y}</code> attributes is supported
 * to initialize the SweepContext polylines and points
 * ([duck typing]{@link http://en.wikipedia.org/wiki/Duck_typing}).
 *
 * poly2tri.js might add extra fields to the point objects when computing the
 * triangulation : they are prefixed with <code>_p2t_</code> to avoid collisions
 * with fields in the custom class.
 *
 * @example
 *      var contour = [{x:100, y:100}, {x:100, y:300}, {x:300, y:300}, {x:300, y:100}];
 *      var swctx = new poly2tri.SweepContext(contour);
 *
 * @typedef {Object} XY
 * @property {number} x - x coordinate
 * @property {number} y - y coordinate
 */


/**
 * Point pretty printing : prints x and y coordinates.
 * @example
 *      xy.toStringBase({x:5, y:42})
 *      // → "(5;42)"
 * @protected
 * @param {!XY} p - point object with {x,y}
 * @returns {string} <code>"(x;y)"</code>
 */
function toStringBase(p) {
    return ("(" + p.x + ";" + p.y + ")");
}

/**
 * Point pretty printing. Delegates to the point's custom "toString()" method if exists,
 * else simply prints x and y coordinates.
 * @example
 *      xy.toString({x:5, y:42})
 *      // → "(5;42)"
 * @example
 *      xy.toString({x:5,y:42,toString:function() {return this.x+":"+this.y;}})
 *      // → "5:42"
 * @param {!XY} p - point object with {x,y}
 * @returns {string} <code>"(x;y)"</code>
 */
function toString(p) {
    // Try a custom toString first, and fallback to own implementation if none
    var s = p.toString();
    return (s === '[object Object]' ? toStringBase(p) : s);
}


/**
 * Compare two points component-wise. Ordered by y axis first, then x axis.
 * @param {!XY} a - point object with {x,y}
 * @param {!XY} b - point object with {x,y}
 * @return {number} <code>&lt; 0</code> if <code>a &lt; b</code>,
 *         <code>&gt; 0</code> if <code>a &gt; b</code>,
 *         <code>0</code> otherwise.
 */
function compare(a, b) {
    if (a.y === b.y) {
        return a.x - b.x;
    } else {
        return a.y - b.y;
    }
}

/**
 * Test two Point objects for equality.
 * @param {!XY} a - point object with {x,y}
 * @param {!XY} b - point object with {x,y}
 * @return {boolean} <code>True</code> if <code>a == b</code>, <code>false</code> otherwise.
 */
function equals(a, b) {
    return a.x === b.x && a.y === b.y;
}


module.exports = {
    toString: toString,
    toStringBase: toStringBase,
    compare: compare,
    equals: equals
};

},{}]},{},[6])
(6)
});

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
}

/*!*
 * algo.js
 *
 * JavaScript Creative Coding Framework
 * http://algojs.com
 *
 * Copyright 2015 hisa hayashi, HYS INC.
 */

var ALGO = (function () {
  'use strict';

  /**
   * Private Variables
   */
  var that;
  var params = {
    id: '',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundAuto: true
  };
  var canvas;

  /**
   * Constructor
   */
  function ALGO(_param) {
    // ALGO.log('ALGO Constructor');
    that = this;
    params = ALGO.ObjectUtil.extend(param, _param);
    init();
  };

  /**
   * init
   */
  function init() {
    setupProperties();
    setupRender();
    addReady();
  };

  /**
   * setupProperties
   */
  function setupProperties() {
    /**
     * setter variables
     */
    that.width = params.width;
    that.height = params.height;
    that.backgroundAuto = param.backgroundAuto;
    // that.framerate = ALGO.prototype.framerate;

    ALGO.log( that );
  };

  /**
   * setupRender
   */
  function setupRender() {
    that.render = new ALGO.Render(that);
    that.render.setFramerate(that.framerate);
  };

  /**
   * setupStage
   */
  function setupStage() {
    // ALGO.log('ALGO: Setup stage.');

    // set canvas
    that.canvas = document.getElementById(params.id);
    that.canvas.width = params.width;
    that.canvas.height = params.height;
    // that.canvas = c;

    // set renderer
    that.renderer = new ALGO.WebGLRenderer(that);
  };

  /**
   * addEvents
   */
  function addReady() {
    // ALGO.log('ALGO: Add events.');
    window.onload = function () {
      setupStage();
      if (that.setup) that.setup.call(that);
      addEvents();
    };
  };

  function addEvents(){
    window.onmouseover = function () {
      if (that.mouseover) that.mouseover.call(that);
    };
    window.onmouseout = function () {
      if (that.mouseout) that.mouseout.call(that);
    };
    window.onmousedown = function () {
      if (that.mousedown) that.mousedown.call(that);
    };
    window.onmouseup = function () {
      if (that.mouseup) that.mouseup.call(that);
    };
    window.onmousemove = function ( e ) {
      if (that.mousemove){
        var mousex = e.clientX;
        var mousey = e.clientY;
        that.mousemove.call(that, mousex, mousey);
      }
    };
    window.onkeydown = function () {
      if (that.keydown) that.keydown.call(that);
    };
    window.onkeyup = function () {
      if (that.keyup) that.keyup.call(that);
    };
    window.onresize = function () {
      if (that.resize) that.resize.call(that);
      // renderer
      if( that.renderer ) that.renderer.resize();
    };

    that.render.startRender();
  };

  /**
   * removeEvents
   */
  function removeEvents() {
    ALGO.log('ALGO: Remove events.');
    window.onload = null;
    window.onmouseover = null;
    window.onmouseout = null;
    window.onmousedown = null;
    window.onmouseup = null;
    window.onmousemove = null;
    window.onkeydown = null;
    window.onkeyup = null;
    window.onresize = null;
    that.render.stopRender();
  };

  /**
   * bind
   */
  function bind(name, method) {
    this[name] = method;
    that[name] = this[name];
    // save the class variable
    that = this;
  };

  function unbind(name, method) {
    this[name] = method;
    that[name] = null;
  };

  /**
   * events
   */
  function setup() {};

  function frame() {};

  function destroy() {};

  function mouseover() {};

  function mouseout() {};

  function mousedown() {};

  function mouseup() {};

  function mousemove() {};

  function keydown() {};

  function keyup() {};

  function resize() {};

  /**
   * methods
   */
  function size(w, h) {
    that.canvas.width = w;
    that.canvas.height = h;
    that.width = w;
    that.height = h;
  };

  function add( shape ){
    shape.add( that );
  };

  function remove( shape ){
    shape.remove( that );
  };

  function readPixels(){
    var w = this.width;
    var h = this.height;
    var ctx = this.renderer.getContext();
    var pixels = new Uint8Array( w * h * 4 );
    ctx.readPixels(0, 0, w, h, ctx.RGBA, ctx.UNSIGNED_BYTE, pixels);
    return pixels;
  };

  function setBackgroundAuto( bool ){
    this.backgroundAuto = bool;
    if( this.renderer ) this.renderer.init( this );
  };

  ALGO.prototype = {
    constructor: ALGO,

    /**
     * Events
     */
    setup: setup,
    frame: frame,
    destroy: destroy,
    mouseover: mouseover,
    mouseout: mouseout,
    mousedown: mousedown,
    mouseup: mouseup,
    mousemove: mousemove,
    keydown: keydown,
    keyup: keyup,
    resize: resize,

    /**
     * Methods
     */
    bind: bind,
    unbind: unbind,
    size: size,
    add: add,
    remove: remove,
    readPixels: readPixels,
    setBackgroundAuto: setBackgroundAuto,

    /**
     * Child Class
     */
    render: null, // ALGO.Render
    renderer: null, // ALGO.WebGLRenderer
  };

  return ALGO;
}());

/**
 * Static Variables
 */
ALGO.debug = 1;

// Blendmode
// @see http://yomotsu.net/blog/2013/08/04/blendmode-in-webgl.html
ALGO.BLEND_NONE = 0;
ALGO.BLEND_ADD = 1;
ALGO.BLEND_MULTIPLY = 2;
ALGO.BLEND_SCREEN = 3;
ALGO.BLEND_ALPHA = 4;

/**
 * Define Getter / Setter
 */
ALGO.prototype.__defineGetter__('framerate', function() {
  // ALGO.log('define getter: framerate');
  return this.framerate_;
});

ALGO.prototype.__defineSetter__('framerate', function(value) {
  // ALGO.log('define setter: framerate');
  if (this.render) this.render.setFramerate(value);
  this.framerate_ = value;
});

/**
 * Define Getter / Setter
 */
ALGO.prototype.__defineGetter__('circleResolution', function() {
  // ALGO.log('define getter: circleResolution');
  return this.circleResolution_;
});

ALGO.prototype.__defineSetter__('circleResolution', function(value) {
  // ALGO.log('define setter: circleResolution');

  /*
  更新時にALGO.Circleへの通知が必要かも
   */
  ALGO.circleResolution = value;

  this.circleResolution_ = value;
});


// Properties
ALGO.prototype.width = 0;
ALGO.prototype.height = 0;
ALGO.prototype.blendMode = ALGO.BLEND_ALPHA;
ALGO.prototype.background = 0x666666;
ALGO.prototype.backgroundAlpha = 0.5;
ALGO.prototype.backgroundAuto = true;
ALGO.prototype.framerate = 60;
ALGO.prototype.circleResolution = 32;
ALGO.prototype.canvas = null;
ALGO.prototype.displayObjects = [];
ALGO.prototype.children = [];

/**
 * ALGO.Render
 */
ALGO.Render = (function() {
  'use strict';

  var that;
  var is_render = false;
  var framerate;
  var frameCount = 0;
  var fpsInterval;
  var startTime;
  var now;
  var then;
  var elapsed;

  var requestAnimation = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / framerate);
    };


  ALGO.Render = function(_that) {
    // ALGO.log('ALGO.Render');
    that = _that;
    renderInit();
  };

  /**
   * renderInit
   */
  function renderInit() {
    setupRequestAnimation();
    setupNowTime();
  };

  /**
   * setupRequestAnimation
   */
  function setupRequestAnimation() {}

  /**
   * setupNowTime
   */
  function setupNowTime() {}

  /**
   * setFramerate
   */
  function setFramerate(value) {
    framerate = value;
    fpsInterval = 1000 / framerate;
    ALGO.log('setFramerate = ' + framerate);
  };

  /**
   * getFramerate
   */
  function getFramerate() {
    return framerate;
  };

  /**
   * startRender
   */
  function startRender() {
    is_render = true;

    fpsInterval = 1000 / framerate;
    then = Date.now();
    startTime = then;

    renderUpdate();
  };

  function stopRender() {
    is_render = false;
  };

  /**
   * renderUpdate
   */
  function renderUpdate() {
    if (is_render) requestAnimation(renderUpdate);

    now = Date.now();
    elapsed = now - then;
    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {
      // Get ready for next frame by setting then=now, but also adjust for your
      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
      then = now - (elapsed % fpsInterval);

      // renderer
      if( that.renderer ) that.renderer.update();

      // drawing code
      if (that.frame) that.frame.call(that);

      // debug framerate
      var sinceStart = now - startTime;
      var currentFps = Math.round(1000 / (sinceStart / ++frameCount) * 100) / 100;
      // ALGO.log("Elapsed time= " + Math.round(sinceStart / 1000 * 100) / 100 + " secs @ " + currentFps + " fps.");
    }
  };

  ALGO.Render.prototype = {
    constructor: ALGO.Render,
    setFramerate: setFramerate,
    getFramerate: getFramerate,
    startRender: startRender,
    stopRender: stopRender
  };

  return ALGO.Render;
}());

/**
 * ALGO.Matrix3
 */
ALGO.Matrix3 = (function(ALGO) {
  'use strict';

  /**
   * Constructor
   */
  ALGO.Matrix3 = function() {
    // ALGO.log('ALGO.Matrix3');
    // return create();
  };

  /**
   * [create description]
   * @return {[type]} [description]
   */
  function create() {
    return new Float32Array(16);
  };

  /**
   * [identity description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function identity(dest) {
    dest = [
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0
    ];
    return dest;
  };

  /**
   * [multiply description]
   * @param  {[type]} mat1 [description]
   * @param  {[type]} mat2 [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function multiply(mat1, mat2, dest) {
    // var a = mat1[0] * mat2[0] + mat1[3] * mat2[1] + mat1[6] * mat2[2];
    // var b = mat1[1] * mat2[0] + mat1[4] * mat2[1] + mat1[7] * mat2[2];
    // var c = mat1[2] * mat2[0] + mat1[5] * mat2[1] + mat1[8] * mat2[2];

    // var d = mat1[0] * mat2[3] + mat1[3] * mat2[4] + mat1[6] * mat2[5];
    // var e = mat1[1] * mat2[3] + mat1[4] * mat2[4] + mat1[7] * mat2[5];
    // var f = mat1[2] * mat2[3] + mat1[5] * mat2[4] + mat1[8] * mat2[5];

    // var g = mat1[0] * mat2[6] + mat1[3] * mat2[7] + mat1[6] * mat2[8];
    // var h = mat1[1] * mat2[6] + mat1[4] * mat2[7] + mat1[7] * mat2[8];
    // var i = mat1[2] * mat2[6] + mat1[5] * mat2[7] + mat1[8] * mat2[8];

    // dest[0] = a;
    // dest[1] = b;
    // dest[2] = c;
    // dest[3] = d;
    // dest[4] = e;
    // dest[5] = f;
    // dest[6] = g;
    // dest[7] = h;
    // dest[8] = i;

    var a = mat1[0 * 3 + 0];
    var b = mat1[0 * 3 + 1];
    var c = mat1[0 * 3 + 2];

    var d = mat1[1 * 3 + 0];
    var e = mat1[1 * 3 + 1];
    var f = mat1[1 * 3 + 2];

    var g = mat1[2 * 3 + 0];
    var h = mat1[2 * 3 + 1];
    var i = mat1[2 * 3 + 2];

    var A = mat2[0 * 3 + 0];
    var B = mat2[0 * 3 + 1];
    var C = mat2[0 * 3 + 2];

    var D = mat2[1 * 3 + 0];
    var E = mat2[1 * 3 + 1];
    var F = mat2[1 * 3 + 2];

    var G = mat2[2 * 3 + 0];
    var H = mat2[2 * 3 + 1];
    var I = mat2[2 * 3 + 2];

    dest[0] = a * A + b * D + c * G;
    dest[1] = a * B + b * E + c * H;
    dest[2] = a * C + b * F + c * I;
    dest[3] = d * A + e * D + f * G;
    dest[4] = d * B + e * E + f * H;
    dest[5] = d * C + e * F + f * I;
    dest[6] = g * A + h * D + i * G;
    dest[7] = g * B + h * E + i * H;
    dest[8] = g * C + h * F + i * I;


    return dest;
  };

  /**
   * [scale description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} vec  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function scale(mat, vec, dest) {
    dest[0] = mat[0] * vec[0];
    dest[1] = mat[1];
    dest[2] = mat[2];

    dest[3] = mat[3];
    dest[4] = mat[4] * vec[1];
    dest[5] = mat[5];

    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    return dest;
  };

  /**
   * [translate description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} vec  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function translate(mat, vec, dest) {
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];

    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];

    dest[6] = mat[6] + vec[0];
    dest[7] = mat[7] + vec[1];
    dest[8] = mat[8];
    return dest;
  };

  /**
   * [rotate description]
   * @param  {[type]} mat   [description]
   * @param  {[type]} angle [description]
   * @param  {[type]} dest  [description]
   * @return {[type]}       [description]
   */
  function rotate(mat, rad, dest) {
    var c = Math.cos(rad);
    var s = Math.sin(rad);

    dest[0] =  c;
    dest[1] = -s;
    dest[2] = mat[2];

    dest[3] = s;
    dest[4] = c;
    dest[5] = mat[5];

    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];

    return dest;
  };

  /**
   * [transpose description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function transpose(mat, dest) {
    dest[0] = mat[0];
    dest[1] = mat[3];
    dest[2] = mat[6];

    dest[3] = mat[1];
    dest[4] = mat[4];
    dest[5] = mat[7];

    dest[6] = mat[2];
    dest[7] = mat[5];
    dest[8] = mat[8];

    return dest;
  };

  /**
   * [inverse description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function inverse(mat, dest) {
    /*
    これから書く
     */
    return dest;
  };

  ALGO.Matrix3.prototype = {
    constructor: ALGO.Matrix3,
    create: create,
    identity: identity,
    multiply: multiply,
    scale: scale,
    translate: translate,
    rotate: rotate,
    transpose: transpose,
    inverse: inverse
  };

  return ALGO.Matrix3;
}(ALGO));

/**
 * ALGO.Matrix4
 */
ALGO.Matrix4 = (function(ALGO) {
  'use strict';

  /**
   * Constructor
   */
  ALGO.Matrix4 = function(){
    // ALGO.log('ALGO.Matrix4');
    // return create();
  };

  /**
   * [create description]
   * @return {[type]} [description]
   */
  function create() {
    return new Float32Array(16);
  };

  /**
   * [identity description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function identity(dest) {
    dest[0] = 1;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = 1;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 0;
    dest[9] = 0;
    dest[10] = 1;
    dest[11] = 0;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = 0;
    dest[15] = 1;
    return dest;
  };

  /**
   * [multiply description]
   * @param  {[type]} mat1 [description]
   * @param  {[type]} mat2 [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function multiply(mat1, mat2, dest) {
    var a = mat1[0],
      b = mat1[1],
      c = mat1[2],
      d = mat1[3],
      e = mat1[4],
      f = mat1[5],
      g = mat1[6],
      h = mat1[7],
      i = mat1[8],
      j = mat1[9],
      k = mat1[10],
      l = mat1[11],
      m = mat1[12],
      n = mat1[13],
      o = mat1[14],
      p = mat1[15],
      A = mat2[0],
      B = mat2[1],
      C = mat2[2],
      D = mat2[3],
      E = mat2[4],
      F = mat2[5],
      G = mat2[6],
      H = mat2[7],
      I = mat2[8],
      J = mat2[9],
      K = mat2[10],
      L = mat2[11],
      M = mat2[12],
      N = mat2[13],
      O = mat2[14],
      P = mat2[15];
    dest[0] = A * a + B * e + C * i + D * m;
    dest[1] = A * b + B * f + C * j + D * n;
    dest[2] = A * c + B * g + C * k + D * o;
    dest[3] = A * d + B * h + C * l + D * p;
    dest[4] = E * a + F * e + G * i + H * m;
    dest[5] = E * b + F * f + G * j + H * n;
    dest[6] = E * c + F * g + G * k + H * o;
    dest[7] = E * d + F * h + G * l + H * p;
    dest[8] = I * a + J * e + K * i + L * m;
    dest[9] = I * b + J * f + K * j + L * n;
    dest[10] = I * c + J * g + K * k + L * o;
    dest[11] = I * d + J * h + K * l + L * p;
    dest[12] = M * a + N * e + O * i + P * m;
    dest[13] = M * b + N * f + O * j + P * n;
    dest[14] = M * c + N * g + O * k + P * o;
    dest[15] = M * d + N * h + O * l + P * p;
    return dest;
  };

  /**
   * [scale description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} vec  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function scale(mat, vec, dest) {
    dest[0] = mat[0] * vec[0];
    dest[1] = mat[1] * vec[0];
    dest[2] = mat[2] * vec[0];
    dest[3] = mat[3] * vec[0];
    dest[4] = mat[4] * vec[1];
    dest[5] = mat[5] * vec[1];
    dest[6] = mat[6] * vec[1];
    dest[7] = mat[7] * vec[1];
    dest[8] = mat[8] * vec[2];
    dest[9] = mat[9] * vec[2];
    dest[10] = mat[10] * vec[2];
    dest[11] = mat[11] * vec[2];
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
    return dest;
  };

  /**
   * [translate description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} vec  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function translate(mat, vec, dest) {
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    dest[9] = mat[9];
    dest[10] = mat[10];
    dest[11] = mat[11];
    dest[12] = mat[0] * vec[0] + mat[4] * vec[1] + mat[8] * vec[2] + mat[12];
    dest[13] = mat[1] * vec[0] + mat[5] * vec[1] + mat[9] * vec[2] + mat[13];
    dest[14] = mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14];
    dest[15] = mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15];
    return dest;
  };

  /**
   * [rotate description]
   * @param  {[type]} mat   [description]
   * @param  {[type]} angle [description]
   * @param  {[type]} axis  [description]
   * @param  {[type]} dest  [description]
   * @return {[type]}       [description]
   */
  function rotate(mat, angle, axis, dest) {
    var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    if (!sq) {
      return null;
    }
    var a = axis[0],
      b = axis[1],
      c = axis[2];
    if (sq != 1) {
      sq = 1 / sq;
      a *= sq;
      b *= sq;
      c *= sq;
    }
    var d = Math.sin(angle),
      e = Math.cos(angle),
      f = 1 - e,
      g = mat[0],
      h = mat[1],
      i = mat[2],
      j = mat[3],
      k = mat[4],
      l = mat[5],
      m = mat[6],
      n = mat[7],
      o = mat[8],
      p = mat[9],
      q = mat[10],
      r = mat[11],
      s = a * a * f + e,
      t = b * a * f + c * d,
      u = c * a * f - b * d,
      v = a * b * f - c * d,
      w = b * b * f + e,
      x = c * b * f + a * d,
      y = a * c * f + b * d,
      z = b * c * f - a * d,
      A = c * c * f + e;
    if (angle) {
      if (mat != dest) {
        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
      }
    } else {
      dest = mat;
    }
    dest[0] = g * s + k * t + o * u;
    dest[1] = h * s + l * t + p * u;
    dest[2] = i * s + m * t + q * u;
    dest[3] = j * s + n * t + r * u;
    dest[4] = g * v + k * w + o * x;
    dest[5] = h * v + l * w + p * x;
    dest[6] = i * v + m * w + q * x;
    dest[7] = j * v + n * w + r * x;
    dest[8] = g * y + k * z + o * A;
    dest[9] = h * y + l * z + p * A;
    dest[10] = i * y + m * z + q * A;
    dest[11] = j * y + n * z + r * A;
    return dest;
  };

  /**
   * [lookAt description]
   * @param  {[type]} eye    [description]
   * @param  {[type]} center [description]
   * @param  {[type]} up     [description]
   * @param  {[type]} dest   [description]
   * @return {[type]}        [description]
   */
  function lookAt(eye, center, up, dest) {
    var eyeX = eye[0],
      eyeY = eye[1],
      eyeZ = eye[2],
      upX = up[0],
      upY = up[1],
      upZ = up[2],
      centerX = center[0],
      centerY = center[1],
      centerZ = center[2];
    if (eyeX == centerX && eyeY == centerY && eyeZ == centerZ) {
      return identity(dest);
    }
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, l;
    z0 = eyeX - center[0];
    z1 = eyeY - center[1];
    z2 = eyeZ - center[2];
    l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= l;
    z1 *= l;
    z2 *= l;
    x0 = upY * z2 - upZ * z1;
    x1 = upZ * z0 - upX * z2;
    x2 = upX * z1 - upY * z0;
    l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!l) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      l = 1 / l;
      x0 *= l;
      x1 *= l;
      x2 *= l;
    }
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!l) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      l = 1 / l;
      y0 *= l;
      y1 *= l;
      y2 *= l;
    }
    dest[0] = x0;
    dest[1] = y0;
    dest[2] = z0;
    dest[3] = 0;
    dest[4] = x1;
    dest[5] = y1;
    dest[6] = z1;
    dest[7] = 0;
    dest[8] = x2;
    dest[9] = y2;
    dest[10] = z2;
    dest[11] = 0;
    dest[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
    dest[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
    dest[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
    dest[15] = 1;
    return dest;
  };

  /**
   * [perspective description]
   * @param  {[type]} fovy   [description]
   * @param  {[type]} aspect [description]
   * @param  {[type]} near   [description]
   * @param  {[type]} far    [description]
   * @param  {[type]} dest   [description]
   * @return {[type]}        [description]
   */
  function perspective(fovy, aspect, near, far, dest) {
    var t = near * Math.tan(fovy * Math.PI / 360);
    var r = t * aspect;
    var a = r * 2,
      b = t * 2,
      c = far - near;
    dest[0] = near * 2 / a;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = near * 2 / b;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 0;
    dest[9] = 0;
    dest[10] = -(far + near) / c;
    dest[11] = -1;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = -(far * near * 2) / c;
    dest[15] = 0;
    return dest;
  };

  /**
   * [transpose description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function transpose(mat, dest) {
    dest[0] = mat[0];
    dest[1] = mat[4];
    dest[2] = mat[8];
    dest[3] = mat[12];
    dest[4] = mat[1];
    dest[5] = mat[5];
    dest[6] = mat[9];
    dest[7] = mat[13];
    dest[8] = mat[2];
    dest[9] = mat[6];
    dest[10] = mat[10];
    dest[11] = mat[14];
    dest[12] = mat[3];
    dest[13] = mat[7];
    dest[14] = mat[11];
    dest[15] = mat[15];
    return dest;
  };

  /**
   * [inverse description]
   * @param  {[type]} mat  [description]
   * @param  {[type]} dest [description]
   * @return {[type]}      [description]
   */
  function inverse(mat, dest) {
    var a = mat[0],
      b = mat[1],
      c = mat[2],
      d = mat[3],
      e = mat[4],
      f = mat[5],
      g = mat[6],
      h = mat[7],
      i = mat[8],
      j = mat[9],
      k = mat[10],
      l = mat[11],
      m = mat[12],
      n = mat[13],
      o = mat[14],
      p = mat[15],
      q = a * f - b * e,
      r = a * g - c * e,
      s = a * h - d * e,
      t = b * g - c * f,
      u = b * h - d * f,
      v = c * h - d * g,
      w = i * n - j * m,
      x = i * o - k * m,
      y = i * p - l * m,
      z = j * o - k * n,
      A = j * p - l * n,
      B = k * p - l * o,
      ivd = 1 / (q * B - r * A + s * z + t * y - u * x + v * w);
    dest[0] = (f * B - g * A + h * z) * ivd;
    dest[1] = (-b * B + c * A - d * z) * ivd;
    dest[2] = (n * v - o * u + p * t) * ivd;
    dest[3] = (-j * v + k * u - l * t) * ivd;
    dest[4] = (-e * B + g * y - h * x) * ivd;
    dest[5] = (a * B - c * y + d * x) * ivd;
    dest[6] = (-m * v + o * s - p * r) * ivd;
    dest[7] = (i * v - k * s + l * r) * ivd;
    dest[8] = (e * A - f * y + h * w) * ivd;
    dest[9] = (-a * A + b * y - d * w) * ivd;
    dest[10] = (m * u - n * s + p * q) * ivd;
    dest[11] = (-i * u + j * s - l * q) * ivd;
    dest[12] = (-e * z + f * x - g * w) * ivd;
    dest[13] = (a * z - b * x + c * w) * ivd;
    dest[14] = (-m * t + n * r - o * q) * ivd;
    dest[15] = (i * t - j * r + k * q) * ivd;
    return dest;
  };

  ALGO.Matrix4.prototype = {
    constructor: ALGO.Matrix4,
    create: create,
    identity: identity,
    multiply: multiply,
    scale: scale,
    translate: translate,
    rotate: rotate,
    lookAt: lookAt,
    perspective: perspective,
    transpose: transpose,
    inverse: inverse
  };

  return ALGO.Matrix4;
}(ALGO));

/**
 * ALGO.Loader
 */
ALGO.Loader = (function() {
  'use strict';

  var that;
  var loader_url = '';
  var xhr;
  var responseText = '';

  ALGO.Loader = function(_url) {
    loader_url = _url;

    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(e) {
      readyStateChange(e);
    };

    that = this;
  };

  function get() {
    xhr.open('get', loader_url, true);
    xhr.send(null);
  };

  function post(params) {
    xhr.open('post', loader_url, true);
    xhr.send(params);
  };

  function readyStateChange(e) {

    if (xhr.status !== 0) {

      var state_str = getReadyStateString(xhr.readyState);

      // ALGO.log( e.target );
      // ALGO.log( 'status: ' + xhr.status );
      // ALGO.log( 'response: ' + xhr.response );
      // ALGO.log( 'responseText: ' + xhr.responseText );
      // ALGO.log( 'readyState: ' + state_str );
      // ALGO.log( '' );

      if (xhr.readyState == xhr.UNSENT) {

      } else if (xhr.readyState == xhr.OPENED) {

      } else if (xhr.readyState == xhr.HEADERS_RECEIVED) {

      } else if (xhr.readyState == xhr.LOADING) {

      } else if (xhr.readyState == xhr.DONE) {
        var params = {};
        params.status = xhr.status;
        params.responseText = xhr.responseText;
        completeRequest(params);
      }
    }

  };

  function completeRequest(params) {
    that.complete(params);
  };

  function complete(params) {}

  function getReadyStateString(ready_state) {
    var str;
    if (ready_state == xhr.UNSENT) {
      str = 'UNSENT';
    } else if (ready_state == xhr.OPENED) {
      str = 'OPENED';
    } else if (ready_state == xhr.HEADERS_RECEIVED) {
      str = 'HEADERS_RECEIVED';
    } else if (ready_state == xhr.LOADING) {
      str = 'LOADING';
    } else if (ready_state == xhr.DONE) {
      str = 'DONE';
    }
    return str;
  }

  ALGO.Loader.prototype = {
    constructor: ALGO.Loader,
    get: get,
    post: post,
    complete: complete
  };

  return ALGO.Loader;
}());

/**
 * ALGO.ShapeCtrl
 */
ALGO.ShapeCtrl = {

  createID: function( _ary, _length ){
    var strings = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var length = ( _length )? _length: 12;
    var id = '';
    for( var i = 0; i < length; i++ ){
      var c_length = strings.length;
      var c_index = Math.floor( Math.random() * c_length );
      id += strings.charAt( c_index );
    }
    if( _ary.indexOf( id ) > -1 ){
      arguments.callee( _ary, _length );
    }
    return id;
  }

};

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
    var object_index = root.displayObjects.indexOf(this.id);
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

  function vertexUpdate() {
    this.setVertexPosition();
    this.setVertexColor(this.color, this.vertexColors);
    this.setVertexAlpha(this.alpha, this.vertexColors);
    this.setVertexColor(this.lineColor, this.vertexLineColors);
    this.setVertexAlpha(this.lineAlpha, this.vertexLineColors);
    this.setIndex();
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
    color_: 0x000000,
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
    vertexUpdate: vertexUpdate,
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

/**
 * ALGO.Polygon
 */
ALGO.Polygon = function( _x, _y, _angles, _radius ) {
  'use strict';
  // ALGO.log( 'ALGO.Polygon' );
  this.x = _x;
  this.y = _y;
  this.angles = _angles;
  this.radius = _radius;

  // define
  this.angles_ = _angles;
  this.radius_ = _radius;

  this.type = 'polygon';

  this.init();
  this.setup();
};

ALGO.Polygon.prototype = Object.create( ALGO.Shape.prototype );
ALGO.Polygon.prototype.constructor = ALGO.Polygon;

/**
 * [setupGeometry description]
 */
 ALGO.Polygon.prototype.setGeometry = function(){
  /* 頂点の位置を算出 */
  var geometry = this.geometry = [];
  for (var i = 0; i < this.angles; i++) {
    geometry[i] = {};
    geometry[i].x = Math.cos(2 * i * Math.PI / this.angles - Math.PI / 2);
    geometry[i].y = Math.sin(2 * i * Math.PI / this.angles - Math.PI / 2);
  }
};

/**
 * [setIndex description]
 */
 ALGO.Polygon.prototype.setIndex = function(){
  // set index
  var index = this.index = [];
  for( i = 1; i < this.angles - 1; i++ ){
    index.push( 0 );
    index.push( i );
    index.push( i+1 );
  }
};

/**
 * ALGO.Circle
 */
ALGO.Circle = function( _x, _y, _radius ) {
  'use strict';
  // ALGO.log( 'ALGO.Circle' );
  this.x = _x;
  this.y = _y;
  this.angles = ALGO.circleResolution;
  this.radius = _radius;

  // define
  this.angles_ = ALGO.circleResolution;
  this.radius_ = _radius;

  this.type = 'circle';

  this.init();
  this.setup();
};

ALGO.Circle.prototype = Object.create( ALGO.Polygon.prototype );
ALGO.Circle.prototype.constructor = ALGO.Circle;

/**
 * ALGO.Rectangle
 */
ALGO.Rectangle = function( _x, _y, _width, _height ) {
  'use strict';
  // ALGO.log( 'ALGO.Rectangle' );
  this.x = _x;
  this.y = _y;
  this.width = _width;
  this.height = _height;

  // define
  this.width_ = _width;
  this.height_ = _height;

  this.type = 'rectangle';

  this.init();
  this.setup();
};

ALGO.Rectangle.prototype = Object.create( ALGO.Shape.prototype );
ALGO.Rectangle.prototype.constructor = ALGO.Rectangle;

ALGO.Rectangle.prototype.width = 0;
ALGO.Rectangle.prototype.height = 0;
ALGO.Rectangle.prototype.width_ = 0;
ALGO.Rectangle.prototype.height_ = 0;

ALGO.Rectangle.prototype.setGeometry = function(){
  /* 頂点の位置を算出 */
  var geometry = this.geometry = [];

  geometry[0] = [];
  geometry[0].x = -0.5;
  geometry[0].y = -0.5;

  geometry[1] = [];
  geometry[1].x = 0.5;
  geometry[1].y = -0.5;

  geometry[2] = [];
  geometry[2].x = 0.5;
  geometry[2].y = 0.5;

  geometry[3] = [];
  geometry[3].x = -0.5;
  geometry[3].y = 0.5;
};

ALGO.Rectangle.prototype.setScale = function(scale){
  if( this.m ){
    var scaleX = this.width * scale;
    var scaleY = this.height * scale;

    this.m.scale( this.matrix, [ scaleX, scaleY, 0.0 ], this.matrixScale );
    // ALGO.log( 'scale: ' + scale );
    // ALGO.log( this.matrixScale );
  }
};

ALGO.Rectangle.prototype.setIndex = function(){
  var index = [
    0, 1, 2,
    0, 2, 3
  ];
  this.index = index;
};

/**
 * Define Getter / Setter
 */
ALGO.Rectangle.prototype.__defineGetter__('width', function() {
  // ALGO.log('define getter: width');
  return this.width_;
});

ALGO.Rectangle.prototype.__defineSetter__('width', function(value) {
  // ALGO.log('define setter: width');
  this.width_ = value;
  this.setScale( this.scale );
});

ALGO.Rectangle.prototype.__defineGetter__('height', function() {
  // ALGO.log('define getter: height');
  return this.height_;
});

ALGO.Rectangle.prototype.__defineSetter__('height', function(value) {
  // ALGO.log('define setter: height');
  this.height_ = value;
  this.setScale( this.scale );
});

/**
 * ALGO.Path
 */
ALGO.Path = function(_start, _end) {
  'use strict';
  // ALGO.log( 'ALGO.Path' );
  // ALGO.log( this.geometry );

  this.start = _start;
  this.end = _end;
  this.type = 'path';
  this.holes = [];
  this.triangles = null;

  this.init();
  this.setup();

  this.initLine();
};

ALGO.Path.prototype = Object.create(ALGO.Shape.prototype);
ALGO.Path.prototype.constructor = ALGO.Path;
ALGO.Path.prototype.closed = false;
ALGO.Path.prototype.holes = [];
ALGO.Path.prototype.triangles = null;

/**
 * [setGeometry description]
 */
ALGO.Path.prototype.setGeometry = function() {};

ALGO.Path.prototype.geometryToPoly = function( geometry, start_count ){
  var poly = [];
  var length = geometry.length;
  var prevx, prevy;
  var count = start_count;
  for (var i = 0; i < length; i++) {
    var x = geometry[i].x;
    var y = geometry[i].y;
    if( prevx !== x || prevy !== y ){
      var point = { x: x, y: y, id: count };
      poly.push(point);
      prevx = x;
      prevy = y;
      count++;
      // ALGO.log( point );
    }
  }
  return poly;
};

/**
 * [setIndex description]
 */
ALGO.Path.prototype.setIndex = function() {
  // set index
  var index = this.index = [];
  var length = this.geometry.length;

  if (length > 2) {
    // create geometry
    var poly = this.geometryToPoly( this.geometry, 0 );

    // create poly
    var swctx = new poly2tri.SweepContext(poly, {cloneArrays: true});

    // create holes
    var hole_length = this.holes.length;
    var hole_count = poly.length;
    for( i = 0; i < hole_length; i++ ){
      var hole_geometry = this.holes[i];
      var hole_poly = this.geometryToPoly( hole_geometry, hole_count );
      poly = poly.concat(hole_poly);
      hole_count += hole_poly.length;
      swctx.addHole( hole_poly );
    }
    this.geometry = poly;

    // create triangles
    var trianglate = swctx.triangulate();
    var triangles = trianglate.getTriangles() || [];
    this.triangles = triangles;

    // set indexes
    var indexes = [];
    for( var i = 0; i < triangles.length; i++ ){
      var t = triangles[i];
      var p1 = t.getPoint(0);
      var p2 = t.getPoint(1);
      var p3 = t.getPoint(2);
      indexes.push( p1.id );
      indexes.push( p2.id );
      indexes.push( p3.id );
    }
    this.index = indexes;

    // update
    this.vertexPosition = [];
    this.setVertexPosition();
    this.setVertexColor( this.color, this.vertexColors );
    this.setVertexAlpha( this.alpha, this.vertexColors );
    this.setVertexColor( this.lineColor, this.vertexLineColors );
    this.setVertexAlpha( this.lineAlpha, this.vertexLineColors );
  }
};

ALGO.Path.prototype.setScale = function(scale) {
  if (this.m) {
    var scaleX = scale;
    var scaleY = scale;

    this.m.scale(this.matrix, [scaleX, scaleY, 0.0], this.matrixScale);
    // ALGO.log( 'scale: ' + scale );
    // ALGO.log( this.matrixScale );
  }
};

ALGO.Path.prototype.initLine = function() {
  var start = this.start;
  var end = this.end;
  if (start) {
    this.moveTo(start.x, start.y);
  }
  if (end) {
    this.lineTo(end.x, end.y);
  }
};

ALGO.Path.prototype.moveTo = function(x, y) {
  // ALGO.log('moveTo: ' + x + ', ' + y );
  var vec2 = {
    x: x,
    y: y
  };
  this.geometry.push(vec2);

  this.vertexUpdate();
};

ALGO.Path.prototype.lineTo = function(x, y) {
  // ALGO.log('lineTo: ' + x + ', ' + y );
  var vec2 = {
    x: x,
    y: y
  };
  this.geometry.push(vec2);

  this.vertexUpdate();
  // ALGO.log( 'geometry: ' + this.geometry.length + ', pos: ' + this.vertexPosition.length + ', color: ' + this.vertexColors.length );
};

ALGO.Path.prototype.close = function() {
  this.closed = true;
};

/**
 * ALGO.Particle
 */
ALGO.Particle = function( _x, _y ) {
  'use strict';
  // ALGO.log( 'ALGO.Particle' );
  this.x = _x;
  this.y = _y;

  // define
  this.angles = 10;
  this.angles_ = 10;
  this.radius = 100;
  this.radius_ = 100;

  this.type = 'particle';

  this.init();
  this.setup();
};

ALGO.Particle.prototype = Object.create( ALGO.Shape.prototype );
ALGO.Particle.prototype.constructor = ALGO.Particle;

 ALGO.Particle.prototype.pointsize = 1;

/**
 * [setupGeometry description]
 */
 ALGO.Particle.prototype.setGeometry = function( _geometry ){
  /* 頂点の位置を算出 */
  var geometry = this.geometry = [];

  // for (var i = 0; i < this.angles; i++) {
  //   geometry[i] = {};
  //   geometry[i].x = Math.cos(2 * i * Math.PI / this.angles - Math.PI / 2);
  //   geometry[i].y = Math.sin(2 * i * Math.PI / this.angles - Math.PI / 2);
  // }
  // this.geometry = geometry;

  if( _geometry ){
    this.geometry = _geometry;
    this.vertexUpdate();
  }

};

/**
 * [setIndex description]
 */
 ALGO.Particle.prototype.setIndex = function(){
};

ALGO.Particle.prototype.setScale = function(scale) {
  if (this.m) {
    var scaleX = scale;
    var scaleY = scale;

    this.m.scale(this.matrix, [scaleX, scaleY, 0.0], this.matrixScale);
    // ALGO.log( 'scale: ' + scale );
    // ALGO.log( this.matrixScale );
  }
};

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

/**
 * ALGO.WebGLRenderer
 */
ALGO.WebGLRenderer = (function(ALGO) {
  'use strict';

  var that;
  var gl;
  var vbuffers = [];
  var ibuffer = [];
  var texture = [];
  var program;
  var uniform_vars;
  var attr_location;
  var attr_stride;
  var point_size = 4;

  var cw, ch;
  var sw, sh;
  var sx, sy;

  var m;
  var v_matrix;
  var p_matrix;
  var tmp_matrix;
  var mvp_matrix;
  var uni_location;

  var object_vbo = [];
  var object_vbo_line = [];
  var object_ibo = [];
  var object_index = [];

  var is_read_pixels = true;
  var read_pixels;

  /**
   * renderer properties
   */
  var canvas;
  var background;
  var backgroundAlpha;
  var backgroundAuto;
  var depth = 0.0;
  var children;
  var displayObjects;

  /**
   * Constructor
   */
  ALGO.WebGLRenderer = function(_that) {
    // ALGO.log('ALGO.WebGLRenderer');
    init( _that );
  };

  function init( _that ){

    var is_preserve = false;
    that = _that;

    updateParameter(that);

    // auto clear
    if( !that.backgroundAuto ){
      is_preserve = true;
    }

    ALGO.log('that.backgroundAuto: ' + that.backgroundAuto);

    // webglコンテキストを取得
    var param = {
      preserveDrawingBuffer: is_preserve
    };
    gl = canvas.getContext('webgl', param) || canvas.getContext('experimental-webgl', param);

    // 頂点シェーダとフラグメントシェーダの生成
    var v_shader = createShader('vertex');
    var f_shader = createShader('fragment');

    // プログラムオブジェクトの生成とリンク
    program = createProgram(v_shader, f_shader);

    resize();

    // uniformLocationの取得
    uni_location = {};
    uni_location.position = gl.getUniformLocation(program, 'position2d');
    uni_location.matrix = gl.getUniformLocation(program, 'matrix2d');
    uni_location.color = gl.getUniformLocation(program, 'color');
    uni_location.point_size = gl.getUniformLocation(program, 'point_size');

    // attributeLocationの取得
    attr_location = {};
    attr_location.position = gl.getAttribLocation(program, 'position2d');
    attr_location.color = gl.getAttribLocation(program, 'color');

    /*
    attr_location はpositionがattributeの何番目なのかを持っている
    attributeの要素数(この場合は xyz の3要素)
     */
    attr_stride = {};
    attr_stride.position = 2; // vertex
    attr_stride.color = 4; // index

    render();
  }

  function make2DProjection(width, height) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ];
  }

  /**
   * Init
   */
  function render() {

    var pm = new ALGO.Matrix3();
    var projectionMatrix = make2DProjection(cw, ch);

    for (var i = 0; i < children.length; i++) {

      var object = children[i];
      var needsUpdate = object.needsUpdate;
      var fill_object = object.fill;
      var line_object = object.line;
      // モデル(頂点)データ
      var vertex_position = object.vertexPosition;
      // 頂点の色情報を格納する配列
      var vertex_color = object.vertexColors;
      // 頂点の色情報を格納する配列
      var vertex_line_color = object.vertexLineColors || object.vertexColors;
      var index = object.index;
      var objectMatrix = object.getMatrix();
      var matrix = pm.multiply(objectMatrix, projectionMatrix, [] );
      var line_width = object.lineWidth;
      var object_point_size = object.pointsize;

      if( fill_object ){

        // VBOの生成
        if( !object_vbo[i] || needsUpdate ){
          var vbo = [];
          vbo.position = createVbo(vertex_position);
          vbo.color = createVbo(vertex_color);
          object_vbo[i] = vbo;
        }

        setVBOAttribute( object_vbo[i], attr_location, attr_stride);

        if( object.type !== 'particle' ){
          // IBOの生成
          if( !object_ibo[i] || needsUpdate ){
            var ibo = createIbo(index);
            object_index[i] = index;
            object_ibo[i] = ibo;
          }

          // IBOをバインドして登録する
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object_ibo[i]);
        }

        // Set the matrix.
        gl.uniformMatrix3fv(uni_location.matrix, false, matrix);

        if( object.type == 'path' ){
          if( object.closed ){
            // gl.drawArrays(gl.TRIANGLES, 0, vertex_position.length / 2);
            gl.drawElements(gl.TRIANGLES, object_index[i].length, gl.UNSIGNED_SHORT, 0);
          }
          else{
            // gl.drawArrays(gl.TRIANGLES, 0, vertex_position.length / 2);
            gl.drawElements(gl.TRIANGLES, object_index[i].length, gl.UNSIGNED_SHORT, 0);
          }
        }
        else if( object.type == 'particle' ){
          // ALGO.log( 'pos: ' + vertex_position.length + ', color: ' + vertex_color.length + ', index: ' + object_index[i].length );
          gl.uniform1f(uni_location.point_size, object_point_size);
          gl.drawArrays(gl.POINTS, 0, vertex_position.length / 2);
        }
        else{
          gl.drawElements(gl.TRIANGLES, object_index[i].length, gl.UNSIGNED_SHORT, 0);
          // gl.uniform1f(uni_location.point_size, point_size);
          // gl.drawArrays(gl.POINTS, 0, vertex_position.length / 2);
        }
      }


      if( line_object ){

        // VBOの生成
        if( !object_vbo_line[i] || needsUpdate ){
          var vbo = [];
          vbo.position = createVbo(vertex_position);
          vbo.color = createVbo(vertex_line_color);
          object_vbo_line[i] = vbo;
        }

        setVBOAttribute( object_vbo_line[i], attr_location, attr_stride);

        // Set the matrix.
        gl.uniformMatrix3fv(uni_location.matrix, false, matrix);

        // line width
        gl.lineWidth( line_width );

        if( object.type == 'path' ){
          if( object.closed ){
            gl.drawArrays(gl.LINE_LOOP, 0, vertex_position.length / 2);
          }
          else{
            gl.drawArrays(gl.LINE_STRIP, 0, vertex_position.length / 2);
          }
        }
        else{
          gl.drawArrays(gl.LINE_LOOP, 0, vertex_position.length / 2);
        }
      }

      if( needsUpdate ){
        object.needsUpdate = false;
      }
    }

    // コンテキストの再描画
    gl.flush();

  };

  /**
   * [resize description]
   * @return {[type]} [description]
   */
  function resize() {
    cw = canvas.width;
    ch = canvas.height;

    var resolution_location = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolution_location, canvas.width, canvas.height);

    gl.viewport(0, 0, cw, ch);
  };

  /**
   * [getContext description]
   * @return {[type]} [description]
   */
  function getContext(){
    return gl;
  };

  /**
   * [update description]
   * @return {[type]} [description]
   */
  function update() {
    // gl.drawingBufferWidth = that.width;
    // gl.drawingBufferHeight = that.height;
    updateParameter(that);
    updateDepth();
    updateBackground();
    updateBlend();
    render();
  };

  /**
   * [updateParameter description]
   * @param  {[type]} that [description]
   * @return {[type]}      [description]
   */
  function updateParameter(that) {
    canvas = that.canvas;
    background = that.background;
    backgroundAlpha = that.backgroundAlpha;
    backgroundAuto = that.backgroundAuto;
    children = that.children;
    displayObjects = that.displayObjects;

    // ALGO.log( that.children );
    // ALGO.log( that.displayObjects );
  };

  /**
   * [updateDepth description]
   * @return {[type]} [description]
   */
  function updateDepth() {
    // canvasを初期化する際の深度を設定する
    gl.clearDepth(depth);
  };

  /**
   * [updateBackground description]
   * @return {[type]} [description]
   */
  function updateBackground() {

    if (backgroundAuto) {
      // canvasを初期化する色を設定する
      var color_n = ALGO.ColorUtil.hexToRgbNormalize(background);
      // ALGO.log( color_n.r + ', ' + color_n.g + ', ' + color_n.b + ', ' + backgroundAlpha );

      // canvasを初期化
      gl.clearColor(color_n.r, color_n.g, color_n.b, backgroundAlpha);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    else{
    }
  };

  /**
   * [updateBlend description]
   * @return {[type]} [description]
   */
  function updateBlend() {
    var blend = that.blendMode;

    if( blend > 0 ){
      gl.enable( gl.BLEND );
    }

    if( blend == ALGO.BLEND_ADD ){
      gl.blendFunc( gl.SRC_ALPHA, gl.ONE );
    }
    else if( blend == ALGO.BLEND_MULTIPLY ){
      gl.blendFunc( gl.DST_COLOR, gl.ZERO );
    }
    else if( blend == ALGO.BLEND_SCREEN ){
      gl.blendFunc( gl.ONE_MINUS_DST_COLOR, gl.ONE );
    }
    else if( blend == ALGO.BLEND_ALPHA ){
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    else{
    }
    // ALGO.log( blend + ', ' + ALGO.BLEND_ALPHA );
  };

  // シェーダを生成する関数
  /**
   * [create_shader description]
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  function createShader(type) {
    // シェーダを格納する変数
    var shader;
    var shader_script = '';
    if (type == 'vertex') {
      shader_script = '\
      attribute vec2 position2d;\
      uniform mat3 matrix2d;\
      uniform vec2 u_resolution;\
      attribute vec4 color;\
      varying   vec4 v_color; \
      uniform float point_size;\
      \
      void main(void){\
        v_color = color;\
        gl_PointSize = point_size;\
        \
        gl_Position = vec4((matrix2d * vec3(position2d, 1)).xy, 0, 1);\
      }';
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (type == 'fragment') {
      shader_script = '\
      precision mediump float;\
      varying vec4 v_color;\
      \
      void main(void){\
        gl_FragColor = v_color;\
      }';
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    // 生成されたシェーダにソースを割り当てる
    gl.shaderSource(shader, shader_script);

    // シェーダをコンパイルする
    gl.compileShader(shader);

    // シェーダが正しくコンパイルされたかチェック
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      // 成功していたらシェーダを返して終了
      return shader;
    } else {
      // 失敗していたらエラーログをアラートする
      alert(gl.getShaderInfoLog(shader));
    }
  };


  // プログラムオブジェクトを生成しシェーダをリンクする関数
  /**
   * [createProgram description]
   * @param  {[type]} vs [description]
   * @param  {[type]} fs [description]
   * @return {[type]}    [description]
   */
  function createProgram(vs, fs) {
    // プログラムオブジェクトの生成
    var program = gl.createProgram();

    // プログラムオブジェクトにシェーダを割り当てる
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    // シェーダをリンク
    gl.linkProgram(program);

    // シェーダのリンクが正しく行なわれたかチェック
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {

      // 成功していたらプログラムオブジェクトを有効にする
      gl.useProgram(program);

      // プログラムオブジェクトを返して終了
      return program;
    } else {

      // 失敗していたらエラーログをアラートする
      alert(gl.getProgramInfoLog(program));
    }
  };

  // VBOを生成する関数
  function createVbo(data) {
    // バッファオブジェクトの生成
    var vbo = gl.createBuffer();

    // バッファをバインドする
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

    // バッファにデータをセット
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    // バッファのバインドを無効化
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // 生成した VBO を返して終了
    return vbo;
  };

  // IBOを生成する関数
  /**
   * [create_ibo description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  function createIbo(data) {
    // バッファオブジェクトの生成
    var ibo = gl.createBuffer();
    // バッファをバインドする
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    // バッファにデータをセット
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    // バッファのバインドを無効化
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    // 生成したIBOを返して終了
    return ibo;
  };

  // VBOをバインドし登録する関数
  /**
   * [setVBOAttribute description]
   * @param {[type]} vbo  [description]
   * @param {[type]} attL [description]
   * @param {[type]} attS [description]
   */
  function setVBOAttribute(vbo, attL, attS) {
    // 引数として受け取った配列を処理する
    for (var key in vbo) {
      // バッファをバインドする
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo[key]);

      // attributeLocationを有効にする
      gl.enableVertexAttribArray(attL[key]);

      // attributeLocationを通知し登録する
      gl.vertexAttribPointer(attL[key], attS[key], gl.FLOAT, false, 0, 0);
    }
  };

  ALGO.WebGLRenderer.prototype = {
    constructor: ALGO.WebGLRenderer,
    init: init,
    update: update,
    resize: resize,
    getContext: getContext
  };

  return ALGO.WebGLRenderer;
}(ALGO));

/**
 * ALGO.Sound
 */
ALGO.Sound = (function(ALGO) {
  'use strict';

  /**
   * Constructor
   */
  ALGO.Sound = function(_mp3, _ogg, _bpm) {
    // ALGO.log('ALGO.Sound');

    this.mp3 = _mp3;
    this.ogg = _ogg;

    this.bpm = _bpm;
    this.noteTime = 1000 * 60 / this.bpm;
    this.noteHalfTime = this.noteTime * 0.5;

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if( window.AudioContext ){
      this.startLoading();
    }
    else{
      this.startNotAvarableMode();
    }
  };

  function startLoading(){
    // setup
    var that = this;
    var browser = ALGO.Util.getBrowser();
    var isSmp = ALGO.Util.isSmartDevice();
    var url = null;

    if( browser == 'chrome' || browser == 'firefox' || browser == 'opera' ){
      url = this.ogg;
    }
    else if( browser == 'safari' ){
      url = this.mp3;
    };

    // check
    var ls = localStorage;
    if( Number(ls.stopped) ){
      this.isInitplay = false;
    }
    else{
      this.isInitplay = true;
    }

    if( isSmp ){
      this.isInitplay = false;
    }

    var context = new AudioContext();
    var analyser = context.createAnalyser();
    analyser.connect( context.destination );

    context.createGain = context.createGain || context.createGainNode;
    var gainNode = context.createGain();
    gainNode.connect( analyser );

    var timeDomainData = new Uint8Array( analyser.frequencyBinCount );
    var frequencyData = new Uint8Array( analyser.frequencyBinCount );

    var bufferLoader = new BufferLoader(
      context, [ url ], function(e){
        that.finishedLoading(e);
      }
    );

    bufferLoader.load();

    this.context = context;
    this.analyser = analyser;
    this.gainNode = gainNode;
    this.timeDomainData = timeDomainData;
    this.frequencyData = frequencyData;
    this.bufferLoader = bufferLoader;
  };

  function finishedLoading(bufferList) {
    this.buffers = bufferList;

    if( this.isInitplay ){
      this.play(0);
    }
    else{
    }
  };

  function update(){
    this.updateFFT();
    this.updateNotes();
  };

  function updateFFT(){
    this.analyser.getByteTimeDomainData( this.timeDomainData ); // 時間
    this.analyser.getByteFrequencyData( this.frequencyData ); // 周波数

    this.tdTotal = 0;
    this.fTotal = 0;
    this.tdValues = [];
    this.fValues = [];

    for( i = 0; i < this.timeDomainData.length; i++ ){
      // 正規化
      this.tdValues[i] = parseInt( this.frequencyData[i] ) / 255;
      this.fValues[i] = parseInt( this.timeDomainData[i] ) / 255;
      this.tdTotal += this.tdValues[i];
      this.fTotal += this.fValues[i];
    }

    this.fTotal = this.fTotal / this.frequencyData.length; // 正規化
    this.tdTotal = this.tdTotal / this.timeDomainData.length; // 正規化
  };

  function updateNotes(){
    // bpm
    var diffTime = ( this.context.currentTime - this.currentTimeBefore ) *  1000;
    this.noteCount += this.diffTime;
    this.noteHalfCount += this.diffTime;

    // 1 / 1
    if( this.noteCount >= this.noteTime ){
      this.noteCount = 0;
      // root.emit(root.NoteEvent, context.currentTime);
    }

    // 1 / 2
    if( this.noteHalfCount >= this.noteHalfTime ){
      this.noteHalfCount = 0;
      // root.emit(root.NoteHalfEvent, context.currentTime);
    }

    this.currentTimeBefore = this.context.currentTime;
  };

  function play(){
    this.startTime = this.context.currentTime;

    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffers[0];
    this.source.loop = true;
    this.source.connect( this.gainNode );

    ALGO.log( this.source );

    this.gainNode.gain.value = this.volume; // volume

    this.source.start(0);

    this.isPlay = true;

    try{
      localStorage.stopped = 0;
    }
    catch(e){}
  };

  function stop(){
    this.source.stop(0);
    this.isPlay = false;

    try{
      localStorage.stopped = 1;
    }
    catch(e){}
  };

  function startNotAvarableMode(){
    var celar = setInterval(function(){
      // root.emit(root.NoteHalfEvent, 0);
    }, 1000);

    var celar = setInterval(function(){
      // root.emit(root.NoteEvent, 0);
    }, 4000);
  };

  function getCurrentTime(){
    var time = this.context.currentTime - this.startTime;
    if( this.startTime == null ){
      time = 0;
    }
    return time;
  };

  function getNoteTime(){
    return this.noteTime;
  };

  function getPlay(){
    return this.isPlay;
  };

  function getTimeDomainValues(){
    return this.tdValues;
  };

  function getTimeDomainTotal(){
    return this.tdTotal;
  };

  function getFrequencyValues(){
    return this.fValues;
  };

  function getFrequencyTotal(){
    return this.fTotal;
  };

  function getSplitValues( values, splitSize ){
    var splitLength = Math.floor( values.length / splitSize );
    var splits = [];
    for( var i = 0; i < splitLength; i++ ){
      var start = splitLength * i;
      var end = splitLength * ( i + 1 );
      splits[i] = 0;
      for( var j = start; j < end; j++ ){
        if( values[j] ) splits[i] += values[j];
      }
    }
    return splits;
  };

  ALGO.Sound.prototype = {
    constructor: ALGO.Sound,

    /**
     * Property
     */
      // bpm
      bpm: 0,
      noteTime: 0,
      noteHalfTime: 0,
      noteCount: 0,
      noteHalfCount: 0,
      currentTimeBefore: 0,

      // audiodata
      mp3: '',
      ogg: '',
      context: null,
      analyser: null,
      gainNode: null,
      bufferLoader: null,
      source: null,
      buffers: null,
      pauseTime: 0,
      startTime: null,
      isPlay: false,
      volume: 1.0,

      // flags
      isInitplay: 0,

      // fft
      timeDomainData: null,
      tdTotal: 0,
      tdValues: [],
      frequencyData: null,
      fTotal: 0,
      fValues: [],

    /**
     * define getter/setter
     */

    /**
     * Method
     */
    play: play,
    stop: stop,
    getCurrentTime: getCurrentTime,
    getNoteTime: getNoteTime,
    getPlay: getPlay,
    getTimeDomainValues: getTimeDomainValues,
    getTimeDomainTotal: getTimeDomainTotal,
    getFrequencyValues: getFrequencyValues,
    getFrequencyTotal: getFrequencyTotal,
    getSplitValues: getSplitValues,

    /**
     * Private Method
     */
    startLoading: startLoading,
    startNotAvarableMode: startNotAvarableMode,
    finishedLoading: finishedLoading,
    update: update,
    updateFFT: updateFFT,
    updateNotes: updateNotes,
  };

  return ALGO.Sound;
}(ALGO));

/**
 * ALGO.log
 */
ALGO.log = function() {
  if( window.console && window.console.log ) {
    if( ALGO.debug ){
      window.console.log.apply(console, arguments);
    }
  }
};

/**
 * ALGO.warn
 */
ALGO.warn = function() {
  if( window.console && window.console.log ) {
    if( ALGO.debug ){
      window.console.warn.apply(console, arguments);
    }
  }
};

/**
 * ALGO.error
 */
ALGO.error = function() {
  if( window.console && window.console.log ) {
    if( ALGO.debug ){
      window.console.error.apply(console, arguments);
    }
  }
};

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

/**
 * ALGO.ColorUtil
 */
ALGO.ColorUtil = {

  /**
   * [rgbToHex description]
   * @param  {[type]} r [description]
   * @param  {[type]} g [description]
   * @param  {[type]} b [description]
   * @return {[type]}   [description]
   */
  rgbToHex: function (r, g, b) {
    r = Math.floor( r );
    g = Math.floor( g );
    b = Math.floor( b );
    var hex = ( r << 16 ) + ( g << 8 ) + b;
    return '0x' + hex.toString(16);
  },

  /**
   * [hexToRgb description]
   * @param  {[type]} hex [description]
   * @return {[type]}     [description]
   */
  hexToRgb: function ( hex ) {
    hex = hex.toString(16).replace('#', '').replace('0x', '');
    hex = '0x' + hex;
    var obj = {
      r: hex >> 16,
      g: hex >> 8 & 0xff,
      b: hex & 0xff,
    };
    return obj;
  },

  /**
   * [hexToRgb description]
   * @param  {[type]} hex [description]
   * @return {[type]}     [description]
   */
  hexToRgbNormalize: function ( hex ) {
    var obj = ALGO.ColorUtil.hexToRgb( hex );
    obj.r = obj.r / 256;
    obj.g = obj.g / 256;
    obj.b = obj.b / 256;
    return obj;
  },

};

/**
 * ALGO.Util
 */
ALGO.Util = {
  /**
   * [browserLanguage description]
   * @return {[type]} [description]
   */
  getBrowserLang: function () {
    var ua = window.navigator.userAgent.toLowerCase();
    try {
      // chrome
      if (ua.indexOf('chrome') != -1) {
        return (navigator.languages[0] || navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0, 2);
      }
      // others
      else {
        return (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0, 2);
      }
    } catch (e) {
      return undefined;
    }
  },

  /**
   * [isSmartDevice description]
   * @return {Boolean} [description]
   */
  isSmartDevice: function () {
    var ua = navigator.userAgent;
    var flag = false;

    if ((ua.indexOf('iPhone') > 0 && ua.indexOf('iPad') == -1) || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
      flag = 'smartphone';
    } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
      flag = 'tablet';
    }
    return flag;
  },

  /**
   * [getOS description]
   * @return {[type]} [description]
   */
  getOS: function () {
    var os;
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/win/)) {
      os = "win";
    } else if (ua.match(/mac|ppc/)) {
      os = "mac";
    } else if (ua.match(/linux/)) {
      os = "linux";
    } else {
      os = "other";
    }
    return os;
  },

  /**
   * [getBrowser description]
   * @return (ie6、ie7、ie8、ie9、ie10、ie11、chrome、safari、opera、firefox、unknown)
   */
  getBrowser: function () {
    var ua = window.navigator.userAgent.toLowerCase();
    var ver = window.navigator.appVersion.toLowerCase();
    var name = 'unknown';

    if (ua.indexOf("msie") != -1) {
      if (ver.indexOf("msie 6.") != -1) {
        name = 'ie6';
      } else if (ver.indexOf("msie 7.") != -1) {
        name = 'ie7';
      } else if (ver.indexOf("msie 8.") != -1) {
        name = 'ie8';
      } else if (ver.indexOf("msie 9.") != -1) {
        name = 'ie9';
      } else if (ver.indexOf("msie 10.") != -1) {
        name = 'ie10';
      } else {
        name = 'ie';
      }
    } else if (ua.indexOf('trident/7') != -1) {
      name = 'ie11';
    } else if (ua.indexOf('chrome') != -1) {
      name = 'chrome';
    } else if (ua.indexOf('safari') != -1) {
      name = 'safari';
    } else if (ua.indexOf('opera') != -1) {
      name = 'opera';
    } else if (ua.indexOf('firefox') != -1) {
      name = 'firefox';
    }
    return name;
  },

  /**
   * [isSupported description]
   * @param  {[type]}  browsers [description]
   * @return {Boolean}          [description]
   */
  isSupported: function (browsers) {
    var thusBrowser = getBrowser();
    for (var i = 0; i < browsers.length; i++) {
      if (browsers[i] == thusBrowser) {
        return true;
        exit;
      }
    }
    return false;
  },

  /**
   * [getQuery description]
   * @return {[type]} [description]
   */
  getQuery: function () {
    var query = window.location.search.substring(1);
    var parms = query.split('&');
    var p = {};

    for (var i = 0; i < parms.length; i++) {
      var pos = parms[i].indexOf('=');
      if (pos > 0) {
        var key = parms[i].substring(0, pos);
        var val = parms[i].substring(pos + 1);
        p[key] = val;
      }
    }
    return p;
  }

};
