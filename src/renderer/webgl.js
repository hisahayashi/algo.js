/**
 * ALGO.WebGLRenderer
 */
ALGO.WebGLRenderer = (function(ALGO) {
  'use strict';

  var that;
  var gl;
  var vbuffers = [];
  var ibuffer = [];
  var texture = [];
  var program;
  var uniform_vars;
  var attr_location;
  var attr_stride;
  var point_size = 10;

  var cw, ch;
  var sw, sh;
  var sx, sy;

  var m;
  var v_matrix;
  var p_matrix;
  var tmp_matrix;
  var mvp_matrix;
  var uni_location;

  var zoom = 5.0;

  var object_vbo = [];
  var object_vbo_line = [];
  var object_ibo = [];
  var object_index = [];

  /**
   * renderer properties
   */
  var canvas;
  var background;
  var backgroundAlpha;
  var backgroundAuto;
  var depth;
  var children;
  var displayObjects;

  /**
   * Constructor
   */
  ALGO.WebGLRenderer = function(_that) {
    // ALGO.log('ALGO.WebGLRenderer');
    that = _that;

    updateParameter(that);



    // webglコンテキストを取得
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // 頂点シェーダとフラグメントシェーダの生成
    var v_shader = createShader('vertex');
    var f_shader = createShader('fragment');

    // プログラムオブジェクトの生成とリンク
    program = createProgram(v_shader, f_shader);




    // // Matrix を用いた行列関連処理
    // m = new ALGO.Matrix4();

    // // 各種行列の生成と初期化
    // v_matrix = m.identity(m.create());
    // p_matrix = m.identity(m.create());

    // tmp_matrix = m.identity(m.create());

    // /* モデルビュープロジェクションのマトリックス */
    // mvp_matrix = m.identity(m.create());

    resize();

    // uniformLocationの取得
    uni_location = {};
    uni_location.position = gl.getUniformLocation(program, 'position2d');
    uni_location.matrix = gl.getUniformLocation(program, 'matrix2d');
    uni_location.color = gl.getUniformLocation(program, 'color');
    uni_location.point_size = gl.getUniformLocation(program, 'point_size');


    // attributeLocationの取得
    attr_location = {};
    attr_location.position = gl.getAttribLocation(program, 'position2d');
    attr_location.color = gl.getAttribLocation(program, 'color');

    /*
    attr_location はpositionがattributeの何番目なのかを持っている
    attributeの要素数(この場合は xyz の3要素)
     */
    attr_stride = {};
    attr_stride.position = 2; // vertex
    attr_stride.color = 4; // index

    render();

    // gl.viewport( 0, 0, screen.width, screen.height );
    // gl.flush();
    // gl.viewport( 0, 0, canvas.width, canvas.height );
  };


  function make2DProjection(width, height) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ];
  }


  /**
   * Init
   */
  function render() {

    var pm = new ALGO.Matrix3();
    var projectionMatrix = make2DProjection(cw, ch);

    for (var i = 0; i < children.length; i++) {

      var object = children[i];
      var needsUpdate = object.needsUpdate;
      var fill_object = object.fill;
      var line_object = object.line;
      // モデル(頂点)データ
      var vertex_position = object.vertexPosition;
      // 頂点の色情報を格納する配列
      var vertex_color = object.vertexColors;
      // 頂点の色情報を格納する配列
      var vertex_line_color = object.vertexLineColors || object.vertexColors;
      var index = object.index;
      var objectMatrix = object.getMatrix();
      var matrix = pm.multiply(objectMatrix, projectionMatrix, [] );
      var lineWidth = object.lineWidth;

      if( fill_object ){

        // VBOの生成
        if( !object_vbo[i] || needsUpdate ){
          var vbo = [];
          vbo.position = createVbo(vertex_position);
          vbo.color = createVbo(vertex_color);
          object_vbo[i] = vbo;
        }

        setVBOAttribute( object_vbo[i], attr_location, attr_stride);

        if( object.type !== 'particle' ){
          // IBOの生成
          if( !object_ibo[i] || needsUpdate ){
            var ibo = createIbo(index);
            object_index[i] = index;
            object_ibo[i] = ibo;
          }

          // IBOをバインドして登録する
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object_ibo[i]);
        }

        // Set the matrix.
        gl.uniformMatrix3fv(uni_location.matrix, false, matrix);

        if( object.type == 'path' ){
          if( object.closed ){
            // gl.drawArrays(gl.TRIANGLES, 0, vertex_position.length / 2);
            gl.drawElements(gl.TRIANGLES, object_index[i].length, gl.UNSIGNED_SHORT, 0);
          }
          else{
            // gl.drawArrays(gl.TRIANGLES, 0, vertex_position.length / 2);
            gl.drawElements(gl.TRIANGLES, object_index[i].length, gl.UNSIGNED_SHORT, 0);
          }
        }
        else if( object.type == 'particle' ){
          gl.drawArrays(gl.POINTS, 0, vertex_position.length / 2);
        }
        else{
          gl.drawElements(gl.TRIANGLES, object_index[i].length, gl.UNSIGNED_SHORT, 0);
        }
      }

      if( line_object ){

        // VBOの生成
        if( !object_vbo_line[i] || needsUpdate ){
          var vbo = [];
          vbo.position = createVbo(vertex_position);
          vbo.color = createVbo(vertex_line_color);
          object_vbo_line[i] = vbo;
        }

        setVBOAttribute( object_vbo_line[i], attr_location, attr_stride);

        // Set the matrix.
        gl.uniformMatrix3fv(uni_location.matrix, false, matrix);

        // line width
        gl.lineWidth( lineWidth );

        if( object.type == 'path' ){
          if( object.closed ){
            gl.drawArrays(gl.LINE_LOOP, 0, vertex_position.length / 2);
          }
          else{
            gl.drawArrays(gl.LINE_STRIP, 0, vertex_position.length / 2);
          }
        }
        else{
          gl.drawArrays(gl.LINE_LOOP, 0, vertex_position.length / 2);
        }
      }

      if( needsUpdate ){
        object.needsUpdate = false;
      }


      // object.x;
      // object.y;
      // object.width;
      // object.height;
      // object.rotate;
      // object.scale;
      /*
            // 一つ目のモデルを移動するためのモデル座標変換行列
            m.identity(m_matrix);
            // m.translate(m_matrix, [ x, y, 0.0], m_matrix);
            // m.scale(m_matrix, [3.0, 3.0, 3.0], m_matrix);
            // m.rotate(m_matrix, rad, [0, 1, 0], m_matrix);
            m.multiply(tmp_matrix, m_matrix, mvp_matrix);
            gl.uniformMatrix4fv(uni_location.position, false, mvp_matrix);
            // gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
            */

    }

    // コンテキストの再描画
    gl.flush();

  };

  /**
   * [resize description]
   * @return {[type]} [description]
   */
  function resize() {
    cw = canvas.width;
    ch = canvas.height;

    // m.identity(v_matrix);
    // m.identity(p_matrix);
    // m.identity(tmp_matrix);
    // m.identity(mvp_matrix);

    // // ビュー座標変換行列
    // m.lookAt([0.0, 0.0, zoom], [0, 0, 0], [0, 1, 0], v_matrix);
    // // プロジェクション座標変換行列
    // m.perspective(90, canvas.width / canvas.height, 0.01, 1000, p_matrix);
    // // 各行列を掛け合わせ座標変換行列を完成させる
    // m.multiply(p_matrix, v_matrix, tmp_matrix);

    var resolution_location = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolution_location, canvas.width, canvas.height);

    gl.viewport(0, 0, cw, ch);
  };

  /**
   * [update description]
   * @return {[type]} [description]
   */
  function update() {
    // gl.drawingBufferWidth = that.width;
    // gl.drawingBufferHeight = that.height;

    updateParameter(that);
    updateDepth();

    if (backgroundAuto) {
      updateBackground();
      updateCanvas();
    }

    drawGraphic();
  };

  /**
   * [updateParameter description]
   * @param  {[type]} that [description]
   * @return {[type]}      [description]
   */
  function updateParameter(that) {
    canvas = that.canvas;
    background = that.background;
    backgroundAlpha = that.backgroundAlpha;
    backgroundAuto = that.backgroundAuto;
    depth = that.depth;
    children = that.children;
    displayObjects = that.displayObjects;

    // ALGO.log( that.children );
    // ALGO.log( that.displayObjects );
  };

  /**
   * [updateDepth description]
   * @return {[type]} [description]
   */
  function updateDepth() {
    // canvasを初期化する際の深度を設定する
    gl.clearDepth(depth);
  };

  /**
   * [updateBackground description]
   * @return {[type]} [description]
   */
  function updateBackground() {
    // canvasを初期化する色を設定する
    var color_n = ALGO.ColorUtil.hexToRgbNormalize(background);
    gl.clearColor(color_n.r, color_n.g, color_n.b, backgroundAlpha);
  };

  /**
   * [updateCanvas description]
   * @return {[type]} [description]
   */
  function updateCanvas() {
    // canvasを初期化
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  };

  /**
   * [drawGraphic description]
   * @return {[type]} [description]
   */
  function drawGraphic() {
    render();
  };

  // シェーダを生成する関数
  /**
   * [create_shader description]
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  function createShader(type) {
    // シェーダを格納する変数
    var shader;
    var shader_script = '';
    if (type == 'vertex') {
      shader_script = '\
      attribute vec2 position2d;\
      uniform mat3 matrix2d;\
      uniform vec2 u_resolution;\
      attribute vec4 color;\
      varying   vec4 v_color; \
      uniform float point_size;\
      \
      void main(void){\
        v_color = color;\
        gl_PointSize = point_size;\
        \
        gl_Position = vec4((matrix2d * vec3(position2d, 1)).xy, 0, 1);\
      }';
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (type == 'fragment') {
      shader_script = '\
      precision mediump float;\
      varying vec4 v_color;\
      \
      void main(void){\
        gl_FragColor = v_color;\
      }';
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    // 生成されたシェーダにソースを割り当てる
    gl.shaderSource(shader, shader_script);

    // シェーダをコンパイルする
    gl.compileShader(shader);

    // シェーダが正しくコンパイルされたかチェック
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      // 成功していたらシェーダを返して終了
      return shader;
    } else {
      // 失敗していたらエラーログをアラートする
      alert(gl.getShaderInfoLog(shader));
    }
  };


  // プログラムオブジェクトを生成しシェーダをリンクする関数
  /**
   * [createProgram description]
   * @param  {[type]} vs [description]
   * @param  {[type]} fs [description]
   * @return {[type]}    [description]
   */
  function createProgram(vs, fs) {
    // プログラムオブジェクトの生成
    var program = gl.createProgram();

    // プログラムオブジェクトにシェーダを割り当てる
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    // シェーダをリンク
    gl.linkProgram(program);

    // シェーダのリンクが正しく行なわれたかチェック
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {

      // 成功していたらプログラムオブジェクトを有効にする
      gl.useProgram(program);

      // プログラムオブジェクトを返して終了
      return program;
    } else {

      // 失敗していたらエラーログをアラートする
      alert(gl.getProgramInfoLog(program));
    }
  };

  // VBOを生成する関数
  function createVbo(data) {
    // バッファオブジェクトの生成
    var vbo = gl.createBuffer();

    // バッファをバインドする
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

    // バッファにデータをセット
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    // バッファのバインドを無効化
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // 生成した VBO を返して終了
    return vbo;
  };

  // IBOを生成する関数
  /**
   * [create_ibo description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  function createIbo(data) {
    // バッファオブジェクトの生成
    var ibo = gl.createBuffer();
    // バッファをバインドする
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    // バッファにデータをセット
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    // バッファのバインドを無効化
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    // 生成したIBOを返して終了
    return ibo;
  };

  // VBOをバインドし登録する関数
  /**
   * [setVBOAttribute description]
   * @param {[type]} vbo  [description]
   * @param {[type]} attL [description]
   * @param {[type]} attS [description]
   */
  function setVBOAttribute(vbo, attL, attS) {
    // 引数として受け取った配列を処理する
    for (var key in vbo) {
      // バッファをバインドする
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo[key]);

      // attributeLocationを有効にする
      gl.enableVertexAttribArray(attL[key]);

      // attributeLocationを通知し登録する
      gl.vertexAttribPointer(attL[key], attS[key], gl.FLOAT, false, 0, 0);
    }
  };

  ALGO.WebGLRenderer.prototype = {
    constructor: ALGO.WebGLRenderer,
    update: update,
    resize: resize,
  };

  return ALGO.WebGLRenderer;
}(ALGO));
