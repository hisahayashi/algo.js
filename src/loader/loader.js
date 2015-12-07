/**
 * ALGO.Loader
 */
ALGO.Loader = (function() {
  'use strict';

  /**
   * [Loader description]
   * @param {[type]} _url [description]
   */
  ALGO.Loader = function(_url) {
    var that = this;
    this.loaderURL = _url;

    this.xhr = new XMLHttpRequest();
    this.xhr.onreadystatechange = function(e) {
      that.readyStateChange(e);
    };
  };

  /**
   * [get description]
   * @return {[type]} [description]
   */
  function get() {
    this.xhr.open('get', this.loaderURL, true);
    this.xhr.send(null);
  };

  /**
   * [post description]
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  function post(params) {
    this.xhr.open('post', this.loaderURL, true);
    this.xhr.send(params);
  };

  /**
   * [readyStateChange description]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  function readyStateChange(e) {

    if (this.xhr.status !== 0) {

      var state_str = this.getReadyStateString(this.xhr.readyState);

      // ALGO.log( e.target );
      // ALGO.log( 'status: ' + this.xhr.status );
      // ALGO.log( 'response: ' + this.xhr.response );
      // ALGO.log( 'responseText: ' + this.xhr.responseText );
      // ALGO.log( 'readyState: ' + state_str );
      // ALGO.log( '' );

      if (this.xhr.readyState == this.xhr.UNSENT) {

      } else if (this.xhr.readyState == this.xhr.OPENED) {

      } else if (this.xhr.readyState == this.xhr.HEADERS_RECEIVED) {

      } else if (this.xhr.readyState == this.xhr.LOADING) {

      } else if (this.xhr.readyState == this.xhr.DONE) {
        var params = {};
        params.status = this.xhr.status;
        params.responseText = this.xhr.responseText;
        this.completeRequest(params);
      }
    }

  };

  /**
   * [completeRequest description]
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  function completeRequest(params) {
    this.complete(params);
    this.remove();
  };

  /**
   * [complete description]
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  function complete(params) {
  };

  /**
   * [remove description]
   * @return {[type]} [description]
   */
  function remove(){
    this.loaderURL = '';
    this.xhr = null;
  };

  /**
   * [getReadyStateString description]
   * @param  {[type]} ready_state [description]
   * @return {[type]}             [description]
   */
  function getReadyStateString(ready_state) {
    var str;
    if (ready_state == this.xhr.UNSENT) {
      str = 'UNSENT';
    } else if (ready_state == this.xhr.OPENED) {
      str = 'OPENED';
    } else if (ready_state == this.xhr.HEADERS_RECEIVED) {
      str = 'HEADERS_RECEIVED';
    } else if (ready_state == this.xhr.LOADING) {
      str = 'LOADING';
    } else if (ready_state == this.xhr.DONE) {
      str = 'DONE';
    }
    return str;
  }

  ALGO.Loader.prototype = {
    constructor: ALGO.Loader,

    /**
     * Property
     */
    loaderURL: '',
    xhr: null,

    /**
     * Method
     */
    get: get,
    post: post,
    complete: complete,
    remove: remove,

    /**
     * Private Method
     */
    readyStateChange: readyStateChange,
    getReadyStateString: getReadyStateString,
    completeRequest: completeRequest
  };

  return ALGO.Loader;
}());
