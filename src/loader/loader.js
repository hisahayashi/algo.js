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
