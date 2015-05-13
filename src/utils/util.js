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
