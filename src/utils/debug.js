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
