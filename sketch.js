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
  // 背景を白く塗りつぶす
  background(220);

  // SECは開始からの秒数
  const SEC = floor(frameCount / FPS);

  // 開始から10秒未満まで
  if (SEC < 10) {
    ws_rebound({ num: 20, size: [10, 50], R: 0 });
    ws_pulse({ num: 30, mode: 'size', opacity: [0.1, 0.9] });
  }
  // 開始10秒後
  else if (SEC == 10) {
    ws_pulse({ num: 30, mode: 'opacity', opacity: [0.1, 0.9] });
    ws_reset('rebound'); // 同じテンプレートを別のパラメーターで使いたいときはリセットする
  }
  // 開始11秒から20秒未満まで
  else if (SEC < 20) {
    ws_rebound({ num: 10, opacity: 0.9, speed: 10 });
    //図形ごとに
  }
  // 開始20秒から30秒未満まで
  else if (SEC < 30) {
  }
  // それ以降
  else {
  }

  // 1秒毎に秒数を表示する
  if (frameCount % FPS == 0) print(SEC);
}
