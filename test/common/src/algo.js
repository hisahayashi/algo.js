describe('ALGO', function() {
  describe('constructor', function() {
    it ('should create ALGO', function() {
      var param = {
        id: 'canvas',
        width: 320,
        height: 320,
        backgroundAuto: true
      };

      var algo = new ALGO(param);
      assert(algo !== null);
    });
  });
});
