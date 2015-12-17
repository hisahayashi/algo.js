# algo.js

algo.jsはメディアアートやモーションの実験を行うシンプルな***2D描画用のWebGLフレームワーク***として開発しています。
フレーム毎の実行やイベントの発行なども簡単に行え、各種矩形、線、パーティクルの描画も数行のソースで作成出来ます。

現在は開発中ですが、2016年4月ごろβリリース予定です。


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
- Texture
- ピクセル操作系
- カメラ、マイク操作系
- Web Audio API


#### 未着手

- Shader
- Importer（OBJ etc..）
- 各種アルゴリズムの包括（Noise, Delauny, Boronoi etc..）


### basic usage

- <a href="http://algojs.org/examples/index.html#basic" target="_blank">demo</a>

### デモ

- <a href="http://algojs.org/examples/" target="_blank">Example</a>

<img alt="" src="https://raw.githubusercontent.com/hisahayashi/cdn/master/algojs/algojs_document.001.jpg" width="100%" height="auto">