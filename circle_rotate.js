let angle = 0;
let radius = 250; // 初期半径
let speed = 0.02; // ゆっくりした回転速度
let colors; // 色の配列
let currentColor; // 現在の色
let startAngle = 0; // スタート位置を制御する角度

function setup() {
  createCanvas(400, 400);
  noStroke(); // 輪郭を無くす

  // 使用する4色を設定
  colors = [
    color(252, 121, 121), // 赤系
    color(126, 224, 201), // 緑系
    color(145, 168, 235), // 青系
    color(252, 249, 179), // 黄色系
  ];

  // 最初の色をランダムに選択
  currentColor = random(colors);
}

function draw() {
  circle_rotate();
}

function circle_rotate() {
  // 円を中心に描く
  translate(width / 2, height / 2);

  // 円の色をランダムに変更
  if (frameCount % 60 === 0) {
    // 60フレームごとに色を変更
    currentColor = random(colors);
  }

  fill(currentColor); // 円の色を設定

  // 円の位置を計算
  let x = radius * cos(angle + startAngle); // スタート位置を角度に加算
  let y = radius * sin(angle + startAngle);

  // 半径を少しずつ縮める
  radius -= 0.2;

  // 円を描く
  ellipse(x, y, 50, 50);

  // 回転速度を調整
  angle += speed;

  // 半径が小さくなりすぎたらリセット
  if (radius < 10) {
    radius = 250; // 半径リセット
    angle = 0; // 角度リセット
    // startAngle += PI / 6;  6分の1回転ずつずらす（任意）

    // 色をもう一度ランダムに変更
    currentColor = random(colors);
  }
}
