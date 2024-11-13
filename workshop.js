"use strict";

let CircleFree_Layer;
let CircleRotate_Layer;
let CirclePaint_Layer;
let DrawShapeGrid_Layer;
let RandomSquares_Layer;
let SpiralSquares_Layer;

// const circle_free_pg = createGraphics(width, height);

p5.prototype.workshop_setup = (arg) => {
  CircleFree_Layer = createGraphics(width, height);
  CircleRotate_Layer = createGraphics(width, height);
  CirclePaint_Layer = createGraphics(width, height);
  DrawShapeGrid_Layer = createGraphics(width, height);
  RandomSquares_Layer = createGraphics(width, height);
  SpiralSquares_Layer = createGraphics(width, height);
};

const data = {
  drawShapeGrid_colors: [],
  circle_free_circles: [],
  circle_paint_circles: [],
  circle_rotate_angle: 0,
  circle_rotate_radius: 250,
  circle_rotate_currentColor: null,
  randomSquares: [],
  spiralSquares: [],
};

p5.prototype.drawSpiralSquares = (arg) => {
  // 初回のみスパイラル四角形を初期化
  if (data.spiralSquares.length === 0) {
    const num = arg.num || 4;
    const size = arg.size || 30;
    const speed = arg.speed || 0.05;
    const bl = arg.bl || 0;
    const colors = arg.colors || [
      color(252, 121, 121),
      color(126, 224, 201),
      color(145, 168, 235),
      color(252, 249, 179),
    ];

    // 各四角形の初期角度と中心位置を設定
    for (let i = 0; i < num; i++) {
      const angle = (TWO_PI / num) * i; // 各四角形の初期角度
      data.spiralSquares.push({
        x: width / 2, // 中心から始める
        y: height / 2,
        color: colors[i % colors.length],
        angle: angle,
        step: 0,
        bl: bl,
        size: size,
        speed: speed,
      });
    }
  }

  // 四角形をスパイラルに描画
  SpiralSquares_Layer.clear();
  for (let square of data.spiralSquares) {
    // 中心を基点にスパイラル移動
    const spiralRadius = width / 2 - square.step * 0.5; // 半径を減少させながらスパイラル状に描画
    square.x = width / 2 + cos(square.angle) * spiralRadius;
    square.y = height / 2 + sin(square.angle) * spiralRadius;

    SpiralSquares_Layer.fill(square.color);
    SpiralSquares_Layer.noStroke();
    SpiralSquares_Layer.square(
      square.x - square.size / 2,
      square.y - square.size / 2,
      square.size,
      square.bl
    );

    square.angle += square.speed; // 角度を変化させて回転
    square.step += 1; // スパイラルの進行

    // スパイラルが外側に達したらリセット
    if (spiralRadius <= 0) {
      square.step = 0;
    }
  }

  image(SpiralSquares_Layer, 0, 0);
};

/* drawRandomSquares (ランダムに四角形を出現させる) */
p5.prototype.drawRandomSquares = (arg) => {
  const baseColors = arg.baseColors || [
    color(150, 200, 250),
    color(150, 172, 250),
    color(165, 150, 250),
  ];
  const minSize = arg.minSize || 10;
  const maxSize = arg.maxSize || 50;
  const speed = arg.speed || 30;
  const bl = arg.bl || 0;

  // 出現制御
  if (frameCount % speed === 0) {
    const squareSize = random(minSize, maxSize); // サイズをランダムに
    const squareX = random(width);
    const squareY = random(height);
    data.randomSquares.push({
      x: squareX,
      y: squareY,
      size: squareSize,
      color: random(baseColors), // ランダムな色を指定
    });
  }

  // レイヤーのリセット
  RandomSquares_Layer.clear();

  // 四角形の描画
  for (let square of data.randomSquares) {
    RandomSquares_Layer.fill(square.color); // 正しい色プロパティにアクセス
    RandomSquares_Layer.noStroke();
    RandomSquares_Layer.square(square.x, square.y, square.size, bl);
  }

  // メインキャンバスに描画
  image(RandomSquares_Layer, 0, 0);
};

/*circle_free（円が自由に動き回る）*/
p5.prototype.circle_free = (arg) => {
  const num = arg.num || 7; //最大7
  const r = arg.r || 150;
  const vx = arg.vx || random(-3, 3);
  const vy = arg.vy || random(-3, 3);
  const bl = arg.bl || 100;

  CircleFree_Layer.push();
  CircleFree_Layer.clear();
  CircleFree_Layer.noStroke();

  const baseColors = arg.baseColors || [
    color(255, 0, 0, 60), // 赤
    color(245, 158, 66, 60), // オレンジ
    color(0, 255, 0, 60), // 緑
    color(0, 0, 255, 60), // 青
    color(139, 55, 191, 60), // 紫
    color(255, 255, 0, 60), // 黄色
    color(255, 0, 255, 60), // ピンク
  ];

  if (data.circle_free_circles.length === 0) {
    // 各円の初期設定をランダムに行う
    for (let i = 0; i < num; i++) {
      data.circle_free_circles.push({
        x: random(width),
        y: random(height),
        r: r,
        color: baseColors[i % baseColors.length],
        vx: vx, // x方向の速度
        vy: vy, // y方向の速度
      });
    }
  }

  const circles = data.circle_free_circles;

  for (let en of circles) {
    en.x += en.vx;
    en.y += en.vy;

    if (en.x > width || en.x < 0) {
      en.vx *= -1;
    }
    if (en.y > height || en.y < 0) {
      en.vy *= -1;
    }

    CircleFree_Layer.fill(en.color);
    CircleFree_Layer.square(en.x, en.y, en.r, bl); //四角形 ⇄ 円へと変更可
  }

  CircleFree_Layer.pop();
  image(CircleFree_Layer, 0, 0);
};

/*circle_rotate（時計回りに円が回る）*/
p5.prototype.circle_rotate = (arg) => {
  const spd = arg.spd || 0.02;
  const radiusDec = arg.radiusDec || 0.2;
  const minRad = arg.minRad || 10;
  const maxRad = arg.maxRad || 250;
  const col = arg.col || 60; //色
  const r = arg.r || 40;
  const bl = arg.bl || 10; //角の丸さ

  // const g = circle_rotate_pg;
  CircleRotate_Layer.push();
  CircleRotate_Layer.clear();
  CircleRotate_Layer.noStroke();

  const baseColors = [
    color(252, 121, 121), // 赤系
    color(126, 224, 201), // 緑系
    color(145, 168, 235), // 青系
    color(252, 249, 179), // 黄色系
  ];

  const speed = spd; // 回転速度
  const radiusDecrement = radiusDec; // 半径の縮小量
  const minRadius = minRad; // 最小半径
  const maxRadius = maxRad; // 最大半径

  // 初期色の設定
  if (data.circle_rotate_currentColor === null) {
    data.circle_rotate_currentColor = random(baseColors);
  }

  // 円の色を60フレームごとに変更
  if (frameCount % col === 0) {
    data.circle_rotate_currentColor = random(baseColors);
  }

  // 円を中心に描く
  CircleRotate_Layer.translate(width / 2, height / 2);
  CircleRotate_Layer.fill(data.circle_rotate_currentColor);

  // 円の位置計算
  let x = data.circle_rotate_radius * cos(data.circle_rotate_angle);
  let y = data.circle_rotate_radius * sin(data.circle_rotate_angle);

  // 円を描画
  CircleRotate_Layer.square(x, y, r, bl); //四角形⇄円へと変更可,40,10
  // ellipse(x, y, 50, 50);

  // 半径を縮めて、回転を進める
  data.circle_rotate_radius -= radiusDecrement;
  data.circle_rotate_angle += speed;

  // 半径が小さくなりすぎたらリセット
  if (data.circle_rotate_radius < minRadius) {
    data.circle_rotate_radius = maxRadius;
    data.circle_rotate_angle = 0;
    data.circle_rotate_currentColor = random(baseColors);
  }

  CircleRotate_Layer.pop();
  image(CircleRotate_Layer, 0, 0);
};

/*circle_paint（円で塗りつぶす）*/
p5.prototype.circle_paint = (arg) => {
  const num = arg.num || 4;
  const r = arg.r || 85;
  const vx = arg.vx || random(-2.5, 2.5);
  const vy = arg.vy || random(-2.5, 2.5);
  const bl = arg.bl || 40;
  const baseColors = arg.baseColors || [
    color(252, 121, 121), // 赤
    color(126, 224, 201), // 緑
    color(145, 168, 235), // 青
    color(252, 249, 179), // 黄色
  ];

  if (data.circle_paint_circles.length === 0) {
    for (let i = 0; i < num; i++) {
      data.circle_paint_circles.push({
        x: random(width),
        y: random(height),
        r: r,
        color: baseColors[i % baseColors.length],
        vx: vx,
        vy: vy,
      });
    }
  }

  const circles = data.circle_paint_circles;

  CirclePaint_Layer.clear(); // 描画のリセット
  CirclePaint_Layer.noStroke();

  for (let en of circles) {
    en.x += en.vx;
    en.y += en.vy;

    if (en.x > width || en.x < 0) {
      en.vx *= -1;
    }
    if (en.y > height || en.y < 0) {
      en.vy *= -1;
    }

    CirclePaint_Layer.fill(en.color);
    CirclePaint_Layer.square(en.x, en.y, en.r, bl);
  }

  image(CirclePaint_Layer, 0, 0); // メインキャンバスに描画
};

/*drawShapeGrid（25個の四角）*/
p5.prototype.drawShapeGrid = (arg) => {
  const cols = arg.cols || 5;
  const rows = arg.rows || 5;
  const shapeSize = arg.shapeSize || 50;
  const cornerRadius = arg.cornerRadius || 0;
  const baseColors = arg.colors || [
    color(252, 121, 121),
    color(126, 224, 201),
    color(145, 168, 235),
    color(252, 249, 179),
  ];
  const colorChangeSpeed = arg.colorChangeSpeed || 30;
  const useStroke = arg.stroke !== undefined ? arg.stroke : true;
  const randomizeColor =
    arg.randomizeColor !== undefined ? arg.randomizeColor : false;

  DrawShapeGrid_Layer.push();

  if (useStroke) {
    DrawShapeGrid_Layer.stroke(0);
  } else {
    DrawShapeGrid_Layer.noStroke();
  }

  const xStep = width / cols;
  const yStep = height / rows;

  if (data.drawShapeGrid_colors.length == 0) {
    for (let i = 0; i < cols * rows; i++) {
      data.drawShapeGrid_colors.push(random(baseColors));
    }
  }

  const colors = data.drawShapeGrid_colors;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const index = y * cols + x;
      const posX = x * xStep + xStep / 2;
      const posY = y * yStep + yStep / 2;

      if (randomizeColor && frameCount % colorChangeSpeed === 0) {
        colors[index] = random(baseColors);
      }

      DrawShapeGrid_Layer.fill(colors[index]);
      DrawShapeGrid_Layer.rectMode(CENTER);
      DrawShapeGrid_Layer.square(posX, posY, shapeSize, cornerRadius);
    }
  }

  DrawShapeGrid_Layer.pop();
  image(DrawShapeGrid_Layer, 0, 0);
};
