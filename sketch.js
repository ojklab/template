/*** ↓↓ここは触らない↓↓ ***/
const END_TIME = 30; // 再生時間（秒）
const FPS = 30; // 1秒間に何回描画するか
let sound;

/*** ↓↓① ここで音楽を選択しよう↓↓ ***/
function preload() {
  sound = loadSound('sample.mp3');
}

/*** ↓↓ここは触らない↓↓ ***/
function setup() {
  createCanvas(400, 400);
  ws_setup();
  // sound.play();
  frameRate(FPS);
}

/*** ↓↓② ここを書き換えてみよう↓↓ ***/
function draw() {
  /*
   * 開始からの時間を区切ってテンプレートを呼び出す
   * 「0〜A秒まで、A秒〜B秒まで、B秒〜終了まで」の3つに分ける場合は以下のように書く
   *
   * if (frameCount < FPS * 秒数A) {
   *   background(色指定);
   *   ws_テンプレート名（{ パラメータ });
   *   ws_テンプレート名（{ パラメータ });
   *   ...
   * } else if (frameCount == FPS * 秒数A) {
   *   ws_reset('テンプレート名');
   *   ...
   * } else if (frameCount < FPS * 秒数B)
   *   background(色指定);
   *   ws_テンプレート名（{ パラメータ });
   *   ws_テンプレート名（{ パラメータ });
   *   ...
   * } else if (frameCount == FPS * 秒数B) {
   *   ws_reset('テンプレート名');
   *   ...
   * } else if (frameCount < END_TIME)
   *   background(色指定);
   *   ws_テンプレート名（{ パラメータ });
   *   ws_テンプレート名（{ パラメータ });
   *   ...
   * }
   *
   * 時間区間を増やしたいときは 「else if (frameCount < FPS * 秒数) { ... }」 を追加しよう
   */

  // ↓↓開始0秒から10秒まで実行↓↓
  if (frameCount < FPS * 10) {
    /* キャンバスを塗りつぶす色を指定 */
    background(255); // 0〜255の値で指定（0が黒、255が白）

    /* 
     * テンプレートは全部で6種類！
     * まずはパラメータなしで1つずつ試してみよう
     * （各行の先頭の // を消すと実行されるよ）
     ＊ 呼び出す順番を変えると図形の重なり順が変わります
     * 同じテンプレートは（パラメータを変えても）2回以上は呼べません
     */
    // ws_rebound({}); // リバウンド
    // ws_pulse({}); // パルス
    // ws_whirl({}); // ウィール
    // ws_spiral({}); // スパイラル
    // ws_grid({}); // グリッド
    // ws_line({}); // ライン
  }
  // ↓↓開始10秒後に1回だけ実行↓↓
  else if (frameCount == FPS * 10) {
    /*
     * 上で使ったテンプレートを次の時間区間でまた使いたいときはリセット
     * ws_reset('テンプレート名');
     */
    // ws_reset('rebound');
    // ws_reset('pulse');
    // ws_reset('whirl');
    // ws_reset('spiral');
    // ws_reset('grid');
    // ws_reset('line');
  }
  // ↓↓開始10秒から20秒まで実行↓↓
  else if (frameCount < FPS * 20) {
    /* キャンバスを塗りつぶす色を指定 */
    background('navy');
    // ↑色名でも指定できる（ https://www.colordic.org/ ）

    /*
     * パラメータを変えてみよう
     * 書き方はテンプレートごとに違うのでウェブサイトの説明を見てね
     */
    // ws_rebound({ num: 30, size: 50, speed: [5, 10], opacity: 0.5 });
    // ws_pulse({ R: 0.5, opacity: [0.5, 1], fade: 'opacity' });
    // ws_whirl({ colors: [color('red'), color('gold'), color('salmon')], direction: 1 });
    // ws_spiral({ colors: [color('yellow')], speed: [20, 50], direction: [-1, -1], });
    // ws_grid({ R: 0, size: [20, 40], noise: 5, interval: 0.5 });
    // ws_line({ angle: 45, weight: [1, 5], speed: 40, opacity: [0.4, 0.9] });
  }
  // ↓↓開始20秒後に1回だけ実行↓↓
  else if (frameCount == FPS * 20) {
    /*
     * 上で使ったテンプレートを次の時間区間でまた使いたいときはリセット
     */
    // ws_reset('rebound');
    // ws_reset('pulse');
    // ws_reset('whirl');
    // ws_reset('spiral');
    // ws_reset('grid');
    // ws_reset('line');
  }
  // ↓↓開始20秒から最後まで実行↓↓
  else if (frameCount < FPS * END_TIME) {
    /* キャンバスを塗りつぶす色を指定 */
    background(0, 127, 255); // RGBがわかる人は挑戦！（各値は0〜255）
    // ws_rebound({});
    // ws_pulse({});
    // ws_whirl({});
    // ws_spiral({});
    // ws_grid({});
    // ws_line({});
  }

  /*** ↑↑↑書き換えるのはここまで↑↑↑ ***/

  // 開始してからの「秒数」をコンソールに表示
  if (frameCount % FPS == 0) {
    print(floor(frameCount / FPS));
  }

  // プログラムの終了処理
  if (frameCount > FPS * END_TIME) {
    noLoop();
    sound.stop();
    background(255);
  }
}
