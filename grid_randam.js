let colors; // 色の配列は初期化時に設定
let colorChangeSpeed = 30; // 色が変わるスピード (フレーム数)
let gridColors = []; // 各正方形の色を保持する配列

function setup() {
  createCanvas(400, 400);

  // p5.jsのcolor()関数はsetup()内で初期化
  colors = [
    color(252, 121, 121), // 赤
    color(126, 224, 201), // 緑
    color(145, 168, 235), // 青
    color(252, 249, 179), // 黄色
  ];

  // 各正方形の初期色をランダムに設定
  for (let i = 0; i < 25; i++) {
    gridColors.push(random(colors));
  }
}

function draw() {
  background(255);

  // グリッド状に図形を描画
  drawShapeGrid(5, 5, 50); // 5x5のグリッドを描く
}

// グリッド状に図形を配置
function drawShapeGrid(rows, cols, shapeSize) {
  let xStep = width / cols;
  let yStep = height / rows;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let index = y * cols + x; // グリッド内の各正方形のインデックスを計算
      let posX = x * xStep + xStep / 2;
      let posY = y * yStep + yStep / 2;

      // 各正方形ごとにランダムなタイミングで色を変える
      if (frameCount % colorChangeSpeed === 0) {
        gridColors[index] = random(colors); // 各正方形の色をランダムに変更
      }

      fill(gridColors[index]); // 各正方形に対応する色を適用
      rectMode(CENTER);
      rect(posX, posY, shapeSize, shapeSize);
    }
  }
}
