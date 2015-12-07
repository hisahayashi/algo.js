/**
 * ALGO.RTC
 */
ALGO.RTC = (function(ALGO) {
  'use strict';

  /**
   * Constructor
   */
  ALGO.RTC = function( _enableAudio, _enableVideo) {
    // ALGO.log('ALGO.RTC');

    var that = this;
    this.enableAudio = _enableAudio;
    this.enableVideo = _enableVideo;

    this.isPlaying = false;

    // 使用クラスの汎用化
    navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
    window.Recorder = window.StereoRecorder || window.MediaStreamRecorder;

    //端末のビデオ、音声ストリームを取得
    try {
      navigator.getMedia({
          video: true,
          audio: true
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
    this.videoSource = windowURL.createObjectURL(this.mediaStream);

    ALGO.log(this.mediaStream);
    ALGO.log(this.videoSource);

    // video preview
    this.videoElement = document.createElement('video');
    // document.body.appendChild(this.videoElement);
    this.videoElement.src = this.videoSource;
    this.videoElement.id = 'video';
    // this.videoElement.autoplay = true;
    this.videoElement.muted = true;
    this.videoElement.volume = 0;
    // this.videoElement.style.visibility = 'hidden';

    var that = this;
    this.videoElement.addEventListener('canplay', function(e){
      that.videoCanPlay(e);
    }, true);
  };

  function videoCanPlay(e) {
    this.videoElement.removeEventListener('canplay', null, true);
    this.videoElement.play();
    this.isPlaying = true;
  };

  function update() {
    if(this.enableAudio){
      this.updateAudio();
    }
    if(this.enableVideo){
      this.updateVideo();
    }
  };

  function updateAudio() {
    if(this.audioAnalyser) this.updateAudioAnalazer();
  };

  function updateAudioAnalazer(){
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

  function updateVideo(){
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

  function setEnableAudio(_bool){
    this.enableAudio = _bool;
  };

  function setEnableVideo(_bool){
    this.enableVideo = _bool;
  };

  ALGO.RTC.prototype = {
    constructor: ALGO.RTC,

    /**
     * Property
     */
    enableAudio: false,
    enableVideo: false,
    videoElement: null,

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
    videoSource: null,

    isPlaying: false,

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
    setEnableAudio: setEnableAudio,
    setEnableVideo: setEnableVideo,

    /**
     * Private Method
     */
    success: success,
    setupAudioAnalazer: setupAudioAnalazer,
    setupVideoRecorder: setupVideoRecorder,
    videoCanPlay: videoCanPlay,
    updateAudio: updateAudio,
    updateVideo: updateVideo,
    updateAudioAnalazer: updateAudioAnalazer,

  };

  return ALGO.RTC;
}(ALGO));
