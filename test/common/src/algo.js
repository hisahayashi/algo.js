describe('ALGO', function() {
  describe('init', function() {
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
