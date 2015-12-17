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

    var filter = context.createBiquadFilter();
    filter.connect(context.destination);
    filter.type = 'allpass';
    filter.frequency.value = 220;

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
    this.filter = filter;
    this.timeDomainData = timeDomainData;
    this.frequencyData = frequencyData;
    this.bufferLoader = bufferLoader;
  };

  function startNotAvarableMode(){
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

    this.timeDomainTotal = 0;
    this.timeDomainValues = [];

    this.frequencyTotal = 0;
    this.frequencyValues = [];

    var length = this.timeDomainData.length;
    for( var i = 0; i < length; i++ ){
      // 正規化
      this.timeDomainValues[i] = parseInt( this.timeDomainData[i] ) / 255;
      this.timeDomainTotal += this.timeDomainValues[i];
      this.frequencyValues[i] = parseInt( this.frequencyData[i] ) / 255;
      this.frequencyTotal += this.frequencyValues[i];
    }

    this.timeDomainTotal = this.timeDomainTotal / length; // 正規化
    this.frequencyTotal = this.frequencyTotal / length; // 正規化
  };

  function updateNotes(){
    // bpm
    var diffTime = ( this.context.currentTime - this.currentTimeBefore ) *  1000;
    this.noteCount += diffTime;
    this.noteHalfCount += diffTime;

    // 1 / 1
    if( this.noteCount >= this.noteTime ){
      this.noteCount = 0;
      this.noteEvent(this.context.currentTime);
    }

    // 1 / 2
    if( this.noteHalfCount >= this.noteHalfTime ){
      this.noteHalfCount = 0;
      this.halfNoteEvent(this.context.currentTime);
    }

    this.currentTimeBefore = this.context.currentTime;
  };

  function play(){
    this.startTime = this.context.currentTime;

    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffers[0];
    this.source.loop = true;
    this.source.connect(this.filter);
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
    return this.timeDomainValues;
  };

  function getTimeDomainTotal(){
    return this.timeDomainTotal;
  };

  function getFrequencyValues(){
    return this.frequencyValues;
  };

  function getFrequencyTotal(){
    return this.frequencyTotal;
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
      filter: null,
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
      timeDomainTotal: 0,
      timeDomainValues: [],
      frequencyData: null,
      frequencyTotal: 0,
      frequencyValues: [],

      // note
      noteEvent: function(){},
      halfNoteEvent: function(){},

    /**
     * define getter/setter
     */

    /**
     * Method
     */
    play: play,
    stop: stop,
    update: update,
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
    updateFFT: updateFFT,
    updateNotes: updateNotes,
  };

  return ALGO.Sound;
}(ALGO));
