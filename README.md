# algo.js

algo.jsはメディアアートやモーションの実験を行うシンプルな***2D描画用のWebGLフレームワーク***として開発しています。
フレーム毎の実行やイベントの発行なども簡単に行え、各種矩形、線、パーティクルの描画も数行のソースで作成出来ます。

現在は開発中ですが、近日リリース予定です。


### 主な機能（予定）

- クリエイティブコーディングと相性の良い記述法
- WebGLを用いた高速な描画（現状は鈍足）
- 構造がシンプルで軽量
- （クリエイティブコーディングで使うノイズやサウンドの再生処理を包括）


### 実装状況

#### 実装中

- Stage操作
- Shape（Graphic関連）
- Importer（SVG）
- WebGL Renderer
- Triangulation
- Utils（Point, Vec, Math）


#### 未着手

- Texture
- Shader
- Importer（OBJ etc..）
- ピクセル操作系
- カメラ、マイク操作系
- Web Audio API
- 各種アルゴリズムの包括（Noise, Delauny, Boronoi etc..）


### basic usage

- <a href="https://rawgit.com/hisahayashi/algo.js/master/examples/usage.html" target="_blank">demo</a>

### デモ

- <a href="https://rawgit.com/hisahayashi/algo.js/master/examples/index.html" target="_blank">Example</a>
- <a href="https://rawgit.com/hisahayashi/algo.js/master/examples/index_01.html" target="_blank">Example 01</a>
- <a href="https://rawgit.com/hisahayashi/algo.js/master/examples/index_02.html" target="_blank">Example 02</a>
- <a href="https://rawgit.com/hisahayashi/algo.js/master/examples/index_03.html" target="_blank">Example 03</a>
- <a href="https://rawgit.com/hisahayashi/algo.js/master/examples/index_04.html" target="_blank">Example 04</a>
- <a href="https://rawgit.com/hisahayashi/algo.js/master/examples/index_05.html" target="_blank">Example 05</a>
- <a href="https://rawgit.com/hisahayashi/algo.js/master/examples/index_06.html" target="_blank">Example 06</a>
- <a href="https://rawgit.com/hisahayashi/algo.js/master/examples/index_07.html" target="_blank">Example 07</a>
- <a href="https://rawgit.com/hisahayashi/algo.js/master/examples/index_08.html" target="_blank">Example 08</a>

<img alt="" src="https://raw.githubusercontent.com/hisahayashi/cdn/master/algojs/algojs_document.001.jpg" width="100%" height="auto">