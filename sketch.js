const END_TIME = 30; // 再生時間
const FPS = 30;
let sound;

function preload() {
  sound = loadSound('sample.mp3');
}

function setup() {
  createCanvas(400, 400);
  ws_setup();
  // sound.play();
  frameRate(FPS);
}

function draw() {
  // SECは開始からの秒数
  const SEC = floor(frameCount / FPS);

  /*** 書き換えるのはここから ***/

  // 背景を白く塗りつぶす
  // background(frameCount%255, 255, 255);
  background(255);

  // 開始から10秒未満まで
  if (SEC < 30) {
    ws_spiral({ direction: [-1, -1], size: 100 });
    // ws_rebound({ num: 10, speed: [1, 10] });
    // ws_pulse({ target: 'opacity', R: 0 });
    // ws_whirl({ size: [10, 100], opacity: [0.1, 1] });
    // ws_whirl({ direction: 'shrink', diameter: width / 2 });
    // ws_pulse({ num: 30, mode: 'opacity', opacity: [0.1, 0.9] });
  }
  // 開始10秒から20秒未満まで
  else if (SEC < 20) {
    ws_pulse({ num: 30, mode: 'size', opacity: 0.5 });
    ws_rebound({ num: 20, size: 50, R: [0.5, 1] });
  }
  // 開始20秒から30秒未満まで
  else if (SEC < 30) {
    ws_rebound({ num: 10, opacity: 0.9, speed: 10 });
  }
  // それ以降
  else {
  }

  // 同じテンプレートを別のパラメーターで使いたいときはリセットする
  if (frameCount == FPS * 10) {
    // 10秒でリセット
    // ws_reset('spiral');
  } else if (frameCount == FPS * 20) {
    // 20秒でリセット
    // ws_reset('rebound');
  }

  /*** 書き換えるのはここまで ***/

  // 1秒毎に秒数をコンソールに表示
  // if (frameCount % FPS == 0) print(SEC);

  // プログラム終了
  if (SEC == END_TIME) {
    noLoop();
    sound.stop();
    background(255);
  }
}
