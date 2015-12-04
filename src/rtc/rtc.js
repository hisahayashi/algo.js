/**
 * ALGO.RTC
 */
ALGO.RTC = (function(ALGO) {
  'use strict';

  /**
   * Constructor
   */
  ALGO.RTC = function( _useAudio, _useVideo) {
    // ALGO.log('ALGO.RTC');

    var that = this;
    this.useAudio = _useAudio;
    this.useVideo = _useVideo;

    // 使用クラスの汎用化
    navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
    window.Recorder = window.StereoRecorder || window.MediaStreamRecorder;

    //端末のビデオ、音声ストリームを取得
    try {
      navigator.getMedia({
          video: this.useVideo,
          audio: this.useAudio
        },
        // success
        function(stream) {
          that.success(stream);
        },
        // error
        function(e) {
          that.error(e);
        });
    } catch (e) {
      ALGO.log('This browser is not support getUserMedia API. ' + e);
    }
  };

  function success(stream) {
    // stream setup
    this.mediaStream = stream;
    this.audioContext = new AudioContext();
    this.audioSource = this.audioContext.createMediaStreamSource(this.mediaStream);

    // setups
    this.setupAudioAnalazer();
    this.setupVideoRecorder();
  };

  function error(e) {
    alert(e);
  };

  function setupAudioAnalazer() {
    //フィルター
    this.audioFilter = this.audioContext.createBiquadFilter();
    this.audioFilter.type = 'allpass';
    this.audioFilter.frequency.value = 220;

    //analyserオブジェクトの生成
    this.audioAnalyser = this.audioContext.createAnalyser();
    this.audioSource.connect(this.audioFilter);
    this.audioFilter.connect(this.audioAnalyser);

    //符号なし8bitArrayを生成
    this.timeDomainData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
    this.frequencyData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
  };

  function setupVideoRecorder() {
    // video capture
    // srcにBlob URLを指定するとカメラの画像がストリームで流れる
    var windowURL = window.URL || window.webkitURL;
    var videoSource = windowURL.createObjectURL(this.mediaStream);

  };

  function update() {
    if(this.audioAnalyser) this.updateAnalyzer();
  };

  function updateAnalyzer() {
    //周波数データ
    this.audioAnalyser.getByteTimeDomainData(this.timeDomainData);
    this.audioAnalyser.getByteFrequencyData(this.frequencyData);

    this.timeDomainTotal = 0;
    this.timeDomainValues = [];

    this.frequencyTotal = 0;
    this.frequencyValues = [];

    var length = this.frequencyData.length;

    for (var i = 0; i < length; i++) {
      this.timeDomainValues[i] = parseInt( this.timeDomainData[i] ) / 255;
      this.timeDomainTotal += this.timeDomainValues[i];
      this.frequencyValues[i] = parseInt( this.frequencyData[i] ) / 255;
      this.frequencyTotal += this.frequencyValues[i];
    }
    // 正規化
    this.timeDomainTotal = this.timeDomainTotal / length;
    this.frequencyTotal = this.frequencyTotal / length;
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


  ALGO.RTC.prototype = {
    constructor: ALGO.RTC,

    /**
     * Property
     */
    useAudio: false,
    useVideo: false,

    frequencyValues: [],
    frequencyTotal: 0,
    timeDomainValues: [],
    timeDomainTotal: 0,

    mediaStream: null,
    audioContext: null,
    audioSource: null,
    audioFilter: null,
    audioAnalyser: null,
    timeDomainData: null,
    frequencyData: null,

    /**
     * define getter/setter
     */

    /**
     * Method
     */
    update: update,
    getTimeDomainValues: getTimeDomainValues,
    getTimeDomainTotal: getTimeDomainTotal,
    getFrequencyValues: getFrequencyValues,
    getFrequencyTotal: getFrequencyTotal,

    /**
     * Private Method
     */
    success: success,
    setupAudioAnalazer: setupAudioAnalazer,
    setupVideoRecorder: setupVideoRecorder,
    updateAnalyzer: updateAnalyzer,

  };;

  return ALGO.RTC;
}(ALGO));
