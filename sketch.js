const FPS = 30;
let sound;

function preload() {
  sound = loadSound('sample.mp3');
}

function setup() {
  createCanvas(400, 400);
  workshop_setup();
  // sound.play();
  frameRate(FPS);
}

function draw() {
  // 背景を白く塗りつぶす
  background(255);

  // SECは開始からの秒数
  const SEC = floor(frameCount / FPS);

  // 開始から5秒未満まで
  if (SEC < 5) {
  }
  // 開始5秒から20秒未満まで
  else if (SEC < 20) {
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
