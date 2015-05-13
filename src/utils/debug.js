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
