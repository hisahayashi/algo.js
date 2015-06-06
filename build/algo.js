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

var Delaunay;

(function() {
  "use strict";

  var EPSILON = 1.0 / 1048576.0;

  function supertriangle(vertices) {
    var xmin = Number.POSITIVE_INFINITY,
        ymin = Number.POSITIVE_INFINITY,
        xmax = Number.NEGATIVE_INFINITY,
        ymax = Number.NEGATIVE_INFINITY,
        i, dx, dy, dmax, xmid, ymid;

    for(i = vertices.length; i--; ) {
      if(vertices[i][0] < xmin) xmin = vertices[i][0];
      if(vertices[i][0] > xmax) xmax = vertices[i][0];
      if(vertices[i][1] < ymin) ymin = vertices[i][1];
      if(vertices[i][1] > ymax) ymax = vertices[i][1];
    }

    dx = xmax - xmin;
    dy = ymax - ymin;
    dmax = Math.max(dx, dy);
    xmid = xmin + dx * 0.5;
    ymid = ymin + dy * 0.5;

    return [
      [xmid - 20 * dmax, ymid -      dmax],
      [xmid            , ymid + 20 * dmax],
      [xmid + 20 * dmax, ymid -      dmax]
    ];
  }

  function circumcircle(vertices, i, j, k) {
    var x1 = vertices[i][0],
        y1 = vertices[i][1],
        x2 = vertices[j][0],
        y2 = vertices[j][1],
        x3 = vertices[k][0],
        y3 = vertices[k][1],
        fabsy1y2 = Math.abs(y1 - y2),
        fabsy2y3 = Math.abs(y2 - y3),
        xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;

    /* Check for coincident points */
    if(fabsy1y2 < EPSILON && fabsy2y3 < EPSILON)
      throw new Error("Eek! Coincident points!");

    if(fabsy1y2 < EPSILON) {
      m2  = -((x3 - x2) / (y3 - y2));
      mx2 = (x2 + x3) / 2.0;
      my2 = (y2 + y3) / 2.0;
      xc  = (x2 + x1) / 2.0;
      yc  = m2 * (xc - mx2) + my2;
    }

    else if(fabsy2y3 < EPSILON) {
      m1  = -((x2 - x1) / (y2 - y1));
      mx1 = (x1 + x2) / 2.0;
      my1 = (y1 + y2) / 2.0;
      xc  = (x3 + x2) / 2.0;
      yc  = m1 * (xc - mx1) + my1;
    }

    else {
      m1  = -((x2 - x1) / (y2 - y1));
      m2  = -((x3 - x2) / (y3 - y2));
      mx1 = (x1 + x2) / 2.0;
      mx2 = (x2 + x3) / 2.0;
      my1 = (y1 + y2) / 2.0;
      my2 = (y2 + y3) / 2.0;
      xc  = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
      yc  = (fabsy1y2 > fabsy2y3) ?
        m1 * (xc - mx1) + my1 :
        m2 * (xc - mx2) + my2;
    }

    dx = x2 - xc;
    dy = y2 - yc;
    return {i: i, j: j, k: k, x: xc, y: yc, r: dx * dx + dy * dy};
  }

  function dedup(edges) {
    var i, j, a, b, m, n;

    for(j = edges.length; j; ) {
      b = edges[--j];
      a = edges[--j];

      for(i = j; i; ) {
        n = edges[--i];
        m = edges[--i];

        if((a === m && b === n) || (a === n && b === m)) {
          edges.splice(j, 2);
          edges.splice(i, 2);
          break;
        }
      }
    }
  }

  Delaunay = {
    triangulate: function(vertices, key) {
      var n = vertices.length,
          i, j, indices, st, open, closed, edges, dx, dy, a, b, c;

      /* Bail if there aren't enough vertices to form any triangles. */
      if(n < 3)
        return [];

      /* Slice out the actual vertices from the passed objects. (Duplicate the
       * array even if we don't, though, since we need to make a supertriangle
       * later on!) */
      vertices = vertices.slice(0);

      if(key)
        for(i = n; i--; )
          vertices[i] = vertices[i][key];

      /* Make an array of indices into the vertex array, sorted by the
       * vertices' x-position. */
      indices = new Array(n);

      for(i = n; i--; )
        indices[i] = i;

      indices.sort(function(i, j) {
        return vertices[j][0] - vertices[i][0];
      });

      /* Next, find the vertices of the supertriangle (which contains all other
       * triangles), and append them onto the end of a (copy of) the vertex
       * array. */
      st = supertriangle(vertices);
      vertices.push(st[0], st[1], st[2]);
      
      /* Initialize the open list (containing the supertriangle and nothing
       * else) and the closed list (which is empty since we havn't processed
       * any triangles yet). */
      open   = [circumcircle(vertices, n + 0, n + 1, n + 2)];
      closed = [];
      edges  = [];

      /* Incrementally add each vertex to the mesh. */
      for(i = indices.length; i--; edges.length = 0) {
        c = indices[i];

        /* For each open triangle, check to see if the current point is
         * inside it's circumcircle. If it is, remove the triangle and add
         * it's edges to an edge list. */
        for(j = open.length; j--; ) {
          /* If this point is to the right of this triangle's circumcircle,
           * then this triangle should never get checked again. Remove it
           * from the open list, add it to the closed list, and skip. */
          dx = vertices[c][0] - open[j].x;
          if(dx > 0.0 && dx * dx > open[j].r) {
            closed.push(open[j]);
            open.splice(j, 1);
            continue;
          }

          /* If we're outside the circumcircle, skip this triangle. */
          dy = vertices[c][1] - open[j].y;
          if(dx * dx + dy * dy - open[j].r > EPSILON)
            continue;

          /* Remove the triangle and add it's edges to the edge list. */
          edges.push(
            open[j].i, open[j].j,
            open[j].j, open[j].k,
            open[j].k, open[j].i
          );
          open.splice(j, 1);
        }

        /* Remove any doubled edges. */
        dedup(edges);

        /* Add a new triangle for each edge. */
        for(j = edges.length; j; ) {
          b = edges[--j];
          a = edges[--j];
          open.push(circumcircle(vertices, a, b, c));
        }
      }

      /* Copy any remaining open triangles to the closed list, and then
       * remove any triangles that share a vertex with the supertriangle,
       * building a list of triplets that represent triangles. */
      for(i = open.length; i--; )
        closed.push(open[i]);
      open.length = 0;

      for(i = closed.length; i--; )
        if(closed[i].i < n && closed[i].j < n && closed[i].k < n)
          open.push(closed[i].i, closed[i].j, closed[i].k);

      /* Yay, we're done! */
      return open;
    },
    contains: function(tri, p) {
      /* Bounding box test first, for quick rejections. */
      if((p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) ||
         (p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) ||
         (p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) ||
         (p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1]))
        return null;

      var a = tri[1][0] - tri[0][0],
          b = tri[2][0] - tri[0][0],
          c = tri[1][1] - tri[0][1],
          d = tri[2][1] - tri[0][1],
          i = a * d - b * c;

      /* Degenerate tri. */
      if(i === 0.0)
        return null;

      var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i,
          v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i;

      /* If we're outside the tri, fail. */
      if(u < 0.0 || v < 0.0 || (u + v) > 1.0)
        return null;

      return [u, v];
    }
  };

  if(typeof module !== "undefined")
    module.exports = Delaunay;
})();

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
    that.width = param.width;
    that.height = param.height;
    // that.framerate = ALGO.prototype.framerate;
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
ALGO.prototype.blendMode = ALGO.BLEND_NONE;
ALGO.prototype.backgroundAuto = true;
ALGO.prototype.background = 0x666666;
ALGO.prototype.backgroundAlpha = 0.5;
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

  function vertexUpdate() {
    this.setVertexPosition();
    this.setVertexColor(this.color, this.vertexColors);
    this.setVertexAlpha(this.alpha, this.vertexColors);
    this.setVertexColor(this.lineColor, this.vertexLineColors);
    this.setVertexAlpha(this.lineAlpha, this.vertexLineColors);
    this.setIndex();
  }

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

  this.init();
  this.setup();

  this.initLine();
};

ALGO.Path.prototype = Object.create(ALGO.Shape.prototype);
ALGO.Path.prototype.constructor = ALGO.Path;
ALGO.Path.prototype.closed = false;

/**
 * [setGeometry description]
 */
ALGO.Path.prototype.setGeometry = function() {};

/**
 * [setIndex description]
 */
ALGO.Path.prototype.setIndex = function() {
  // set index
  var index = this.index = [];
  var length = this.geometry.length;
  // for (i = 1; i < length - 1; i += 1) {
  //   index.push(0);
  //   index.push(i);
  //   index.push(i + 1);
  //   // ALGO.log( 0 + ', ' + i + ', ' + ( i + 1 ) );
  // }
  var g = [];
  for (var i = 0; i < length; i++) {
    g[i] = [];
    g[i][0] = this.geometry[i].x;
    g[i][1] = this.geometry[i].y;
  }
  if (length > 2) {
    var triangles = Delaunay.triangulate(g);
    this.index = triangles;
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
      // ALGO.log( 'x: ' + x + ', y: ' + y );
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

            for (var k = 0; k < points.length; k++) {
              geometry.push(points[k]);
            }

            // ALGO.log('current: ' + prev_point.x + ', ' + prev_point.y + '   control: ' + cp1.x + ', ' + cp1.y);
            // ALGO.log('current: ' + current_point.x + ', ' + current_point.y + '   control: ' + cp2.x + ', ' + cp2.y);
            // ALGO.log(points);

            // geometry.push( { x: cp1.x, y: cp1.y } );
            // geometry.push( { x: cp2.x, y: cp2.y } );
            geometry.push({
              x: current_point.x,
              y: current_point.y
            });
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

            for (var k = 0; k < points.length; k++) {
              geometry.push(points[k]);
            }

            previous = lower;

            // geometry.push( { x: cp1.x, y: cp1.y } );
            // geometry.push( { x: cp2.x, y: cp2.y } );
            geometry.push({
              x: current_point.x,
              y: current_point.y
            });
          }
          break;

          // quadratic curveto
        case 'q':
          for (var j = 0; j < length; j += 4) {
            control = getPoint(j);
            current_point = getPoint(j + 2);
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
            geometry.push({
              x: current_point.x,
              y: current_point.y
            });
            // new Size( +coords[j], +coords[j + 1]), +coords[j + 2], +coords[j + 4], +coords[j + 3]);
          }
          break;

          // closepath
        case 'z':
        // geometries.push(geometry);
        // geometry = [];
        break;
      }


      if (l == 22 && i > 15) {
        // ALGO.log(current_point);
      }

      // ALGO.log('');
      previous = lower;
    }

    geometries.push(geometry);


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
    for (var t = 0; t <= 1.01; t += 0.1) {
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

  var zoom = 5.0;

  var object_vbo = [];
  var object_vbo_line = [];
  var object_ibo = [];
  var object_index = [];

  /**
   * renderer properties
   */
  var canvas;
  var background;
  var backgroundAlpha;
  var backgroundAuto;
  var depth;
  var children;
  var displayObjects;

  /**
   * Constructor
   */
  ALGO.WebGLRenderer = function(_that) {
    // ALGO.log('ALGO.WebGLRenderer');
    that = _that;

    updateParameter(that);



    // webglコンテキストを取得
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // 頂点シェーダとフラグメントシェーダの生成
    var v_shader = createShader('vertex');
    var f_shader = createShader('fragment');

    // プログラムオブジェクトの生成とリンク
    program = createProgram(v_shader, f_shader);




    // // Matrix を用いた行列関連処理
    // m = new ALGO.Matrix4();

    // // 各種行列の生成と初期化
    // v_matrix = m.identity(m.create());
    // p_matrix = m.identity(m.create());

    // tmp_matrix = m.identity(m.create());

    // /* モデルビュープロジェクションのマトリックス */
    // mvp_matrix = m.identity(m.create());

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

    // gl.viewport( 0, 0, screen.width, screen.height );
    // gl.flush();
    // gl.viewport( 0, 0, canvas.width, canvas.height );
  };


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


      // object.x;
      // object.y;
      // object.width;
      // object.height;
      // object.rotate;
      // object.scale;
      /*
            // 一つ目のモデルを移動するためのモデル座標変換行列
            m.identity(m_matrix);
            // m.translate(m_matrix, [ x, y, 0.0], m_matrix);
            // m.scale(m_matrix, [3.0, 3.0, 3.0], m_matrix);
            // m.rotate(m_matrix, rad, [0, 1, 0], m_matrix);
            m.multiply(tmp_matrix, m_matrix, mvp_matrix);
            gl.uniformMatrix4fv(uni_location.position, false, mvp_matrix);
            // gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
            */

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

    // m.identity(v_matrix);
    // m.identity(p_matrix);
    // m.identity(tmp_matrix);
    // m.identity(mvp_matrix);

    // // ビュー座標変換行列
    // m.lookAt([0.0, 0.0, zoom], [0, 0, 0], [0, 1, 0], v_matrix);
    // // プロジェクション座標変換行列
    // m.perspective(90, canvas.width / canvas.height, 0.01, 1000, p_matrix);
    // // 各行列を掛け合わせ座標変換行列を完成させる
    // m.multiply(p_matrix, v_matrix, tmp_matrix);

    var resolution_location = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolution_location, canvas.width, canvas.height);

    gl.viewport(0, 0, cw, ch);
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

    if (backgroundAuto) {
      updateBackground();
      updateCanvas();
    }

    drawGraphic();
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
    depth = that.depth;
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
    // canvasを初期化する色を設定する
    var color_n = ALGO.ColorUtil.hexToRgbNormalize(background);
    gl.clearColor(color_n.r, color_n.g, color_n.b, backgroundAlpha);
  };

  /**
   * [updateCanvas description]
   * @return {[type]} [description]
   */
  function updateCanvas() {
    // canvasを初期化
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  };

  /**
   * [drawGraphic description]
   * @return {[type]} [description]
   */
  function drawGraphic() {
    render();
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
    update: update,
    resize: resize,
  };

  return ALGO.WebGLRenderer;
}(ALGO));

/**
 * ALGO.log
 */
ALGO.log = function(obj) {
  if (window.console && window.console.log) {
    if (ALGO.debug) window.console.log(obj);
  }
};

/**
 * ALGO.warn
 */
ALGO.warn = function(obj) {
  if (window.console && window.console.warn) {
    if (ALGO.debug) window.console.warn(obj);
  }
};

/**
 * ALGO.error
 */
ALGO.error = function(obj) {
  if (window.console && window.console.error) {
    if (ALGO.debug) window.console.error(obj);
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
