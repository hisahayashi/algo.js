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
