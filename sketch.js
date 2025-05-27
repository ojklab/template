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
  if (SEC < 15) {
    ws_whirl({ speed: [20, 50] });
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
    ws_reset('pulse');
  } else if (frameCount == FPS * 20) {
    // 20秒でリセット
    ws_reset('rebound');
  }

  // 1秒毎に秒数をコンソールに表示
  if (frameCount % FPS == 0) print(SEC);
  // 60秒でプログラム終了
  if (SEC == 60) return;
}
